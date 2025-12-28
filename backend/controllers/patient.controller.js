const Patient = require('../models/patient.model');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Get all patients (patients can only view, doctors see all)
// GET /api/patients?search=John&status=active&page=1&limit=10
exports.getAllPatients = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 10 } = req.query;
    const query = {};

    // For patients: return only their own record
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ email: req.user.email });
      return res.json({ success: true, patients: patient ? [patient] : [], total: patient ? 1 : 0 });
    }

    // For doctors: apply search & filters
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

  
    const patients = await Patient.find(query);
    const total = await Patient.countDocuments(query);

    res.json({ success: true, patients, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load patients', error: err.message });
  }
};


// Add a new patient 
exports.addPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, dateOfBirth, gender, contactNumber, address ,bloodType, allergies, insuranceprovider, insurancepolicyNumber, insuranceexpiryDate, emergencyContactname, emergencyContactrelationship, emergencyContactphone } = req.body;
    let medicalFileUrl = null;
    const filePath = req.file ? req.file.path : null;
    if (filePath) {
      medicalHistory.consultations.push({
        file: filePath,
        uploadedAt: new Date()
      });
    }
     const insurance = {
      provider: insuranceprovider || '',
      policyNumber: insurancepolicyNumber || '',
      expiryDate: insuranceexpiryDate || null
    };

    const emergencyContact = {
      name: emergencyContactname || '',
      relationship: emergencyContactrelationship || '',
      phone: emergencyContactphone || ''
    };
    const patient = new Patient({
      firstName, lastName, email, dateOfBirth, gender, contactNumber, address,bloodType,allergies: allergies ? [allergies] : [], insurance, emergencyContact ,
      createdBy: req.user.id ,
      medicalFile: filePath
    });
    await patient.save();
    res.status(201).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add patient', error: err.message });
  }
};

// Edit a patient (doctors only)
exports.editPatient = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can edit patients' });
    }
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to edit patient', error: err.message });
  }
};

// Delete a patient (doctors only)
exports.deletePatient = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can delete patients' });
    }
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete patient', error: err.message });
  }
}; 

// PATCH /api/patients/:id/status
exports.updatePatientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    res.json({ success: true, message: 'Status updated', patient });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient', details: err.message });
  }
};

// Add Medical Record (PDF Upload URL passed in body)
exports.addMedicalRecord = async (req, res) => {
  try {
    const { email, type, record } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (type === 'consultation') patient.medicalHistory.consultations.push(record);
    else if (type === 'labTest') patient.medicalHistory.labTests.push(record);
    else if (type === 'vaccination') patient.medicalHistory.vaccinations.push(record);
    else return res.status(400).json({ message: 'Invalid record type' });

    await patient.save();
    res.status(200).json({ message: `${type} record added successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add medical record', details: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // Since we're using protect middleware, req.user should exist
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure name is included in the response
    return res.status(200).json({
      _id: user._id,
      name: user.name, // Make sure this field exists
      email: user.email,
      role: user.role
      // Other user fields
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

