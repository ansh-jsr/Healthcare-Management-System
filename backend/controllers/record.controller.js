const MedicalRecord = require('../models/record.model');
const Appointment = require('../models/appointment');
const User = require('../models/user.model');

exports.uploadRecord = async (req, res) => {
  try {
    const { appointmentId, description, recordType, title } = req.body;
    const file = req.file;

    // Check if user is authenticated and is a doctor
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const doctor = await User.findById(req.user.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    // Validate required fields
    if (!appointmentId || !description || !recordType || !title) {
      return res.status(400).json({ 
        message: 'Missing required fields: appointmentId, description, recordType, and title are required' 
      });
    }

    // Validate recordType
    const validRecordTypes = ['Lab Result', 'Prescription', 'Diagnosis', 'Annual Checkup'];
    if (!validRecordTypes.includes(recordType)) {
      return res.status(400).json({ 
        message: 'Invalid record type. Must be one of: ' + validRecordTypes.join(', ')
      });
    }

    // Fetch the appointment and ensure it exists
    const appointment = await Appointment.findById(appointmentId).populate('patient doctor');
    console.log('🔍 DEBUG - Found appointment:', JSON.stringify(appointment, null, 2));
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Debug: Check appointment structure
    console.log('🔍 DEBUG - Appointment patient field:', appointment.patient);
    console.log('🔍 DEBUG - Appointment doctor field:', appointment.doctor);

    // Handle missing patient field - check if we can find patient by patientName
    let patientId;
    
    if (appointment.patient) {
      // Patient field exists
      if (typeof appointment.patient === 'object' && appointment.patient._id) {
        patientId = appointment.patient._id.toString();
      } else if (typeof appointment.patient === 'string') {
        patientId = appointment.patient;
      } else {
        patientId = appointment.patient.toString();
      }
    } else if (appointment.patientName) {
      // Patient field missing, try to find by patientName
      console.log('⚠️  Patient field missing, attempting to find by patientName:', appointment.patientName);
      
      const patientByName = await User.findOne({ 
        name: appointment.patientName, 
        role: 'patient' 
      });
      
      if (patientByName) {
        patientId = patientByName._id.toString();
        console.log('✅ Found patient by name:', patientByName.name, 'ID:', patientId);
        
        // Update the appointment to include the patient reference
        await Appointment.findByIdAndUpdate(appointmentId, { 
          patient: patientByName._id 
        });
        console.log('✅ Updated appointment with patient reference');
      } else {
        return res.status(400).json({ 
          message: 'Could not find patient in database',
          debug: { 
            patientName: appointment.patientName,
            appointmentId: appointmentId
          }
        });
      }
    } else {
      return res.status(400).json({ 
        message: 'Appointment is missing both patient reference and patientName',
        debug: { appointmentId, appointmentData: appointment }
      });
    }

    console.log('🔍 DEBUG - Extracted patientId:', patientId);

    // Verify patient exists and is actually a patient
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({ 
        message: 'Patient not found in database',
        debug: { patientId }
      });
    }
    
    if (patient.role !== 'patient') {
      return res.status(400).json({ 
        message: 'Referenced user is not a patient',
        debug: { patientId, userRole: patient.role }
      });
    }

    console.log('✅ Patient found:', patient.name);

    // Ensure the appointment has a valid doctor field
    if (!appointment.doctor) {
      return res.status(400).json({ 
        message: 'Appointment is missing a doctor reference',
        debug: { appointmentId, appointmentData: appointment }
      });
    }

    // Ensure the appointment belongs to this doctor
    let doctorId;
    if (typeof appointment.doctor === 'object' && appointment.doctor._id) {
      doctorId = appointment.doctor._id.toString();
    } else if (typeof appointment.doctor === 'string') {
      doctorId = appointment.doctor;
    } else {
      doctorId = appointment.doctor.toString();
    }

    console.log('🔍 DEBUG - Extracted doctorId:', doctorId);
    console.log('🔍 DEBUG - Current user ID:', req.user.id);

    if (doctorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only create records for your own appointments' });
    }

    // Create the record
    const recordData = {
      appointment: appointmentId,
      patient: patientId,
      doctor: req.user.id,
      recordType,
      title,
      description,
      fileName: file ? file.filename : null,
    };

    console.log('🔍 DEBUG - Creating record with data:', recordData);

    const record = new MedicalRecord(recordData);
    await record.save();

    console.log('✅ Record saved successfully:', record._id);

    // Populate the record with related data for response
    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot');

    res.status(201).json({ 
      message: 'Record uploaded successfully', 
      success: true,
      record: populatedRecord 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload record', 
      error: error.message 
    });
  }
};

exports.getRecordsByPatient = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get records - doctors can see records for any patient they've treated
    const records = await MedicalRecord.find({ 
      patient: patientId,
      doctor: req.user.id // Only show records created by this doctor
    })
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ recordDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email
      },
      records
    });

  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      message: 'Error fetching records',
      error: error.message
    });
  }
};

exports.getRecordsByDoctor = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {
    console.error('Error fetching doctor records:', error);
    res.status(500).json({ 
      message: 'Error fetching records',
      error: error.message
    });
  }
};

exports.getPatientOwnRecords = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied: Patients only' });
    }

    // Get all records for this patient
    const records = await MedicalRecord.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ recordDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ 
      message: 'Error fetching records',
      error: error.message
    });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    if (!recordId) {
      return res.status(400).json({ message: 'Record ID is required' });
    }

    // Find the record
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if the doctor owns this record
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own records' });
    }

    await MedicalRecord.findByIdAndDelete(recordId);

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ 
      message: 'Error deleting record',
      error: error.message
    });
  }
};