const Appointment = require('../models/appointment');
const User = require('../models/user.model');

// Available time slots (9 AM to 5 PM, 30-minute intervals)
const TIME_SLOTS = [
  '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM', '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM', '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM', '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM', '04:30 PM - 05:00 PM'
];

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot,appointmentType } = req.body;

    // Fetch patient name from authenticated user's profile
    const patient = await User.findById(req.user.id);
    if (!patient) {
  return res.status(400).json({ message: 'User not found' });
}

    // Validate doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    const validTypes = ['Follow Up', 'Consultation', 'Check-Up', 'Review'];
    if (!appointmentType || !validTypes.includes(appointmentType)) {
      return res.status(400).json({ message: 'Invalid appointment type' });
    }
    
    // Validate date (must be tomorrow or later)
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate < tomorrow) {
      return res.status(400).json({ message: 'Date must be tomorrow or later' });
    }

    // Check if time slot is valid
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    // Check slot availability
    const existing = await Appointment.findOne({ doctor: doctorId, date, timeSlot });
    if (existing) {
      return res.status(409).json({ message: 'Time slot already booked for this doctor' });
    }

    const appointment = await Appointment.create({
      patientName: patient.name,
      patient: req.user.id,
      doctor: doctorId,
      date,
      timeSlot,
      appointmentType
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Validate date
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate < tomorrow) {
      return res.status(400).json({ message: 'Date must be tomorrow or later' });
    }

    // Find booked slots
    const bookedSlots = await Appointment.find({ doctor: doctorId, date })
      .select('timeSlot');

    const booked = bookedSlots.map(slot => slot.timeSlot);
    const availableSlots = TIME_SLOTS.filter(slot => !booked.includes(slot));

    res.status(200).json({ availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch slots', error: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name _id');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('Unauthorized: No user found in request'); // Debug: Log auth issue
      return res.status(401).json({ message: 'Unauthorized access' });
    }

     const user = await User.findById(req.user.id);
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied: Patients only' });
    }

    console.log('Fetching appointments for user ID:', req.user.id); // Debug: Log user ID
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name')
      .sort({ date: 1 });

    console.log('Raw appointments from DB:', JSON.stringify(appointments, null, 2)); // Debug: Log raw data

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Use UTC for date comparison
    console.log('Today (UTC start):', startOfToday); // Debug: Log comparison date

    const past = appointments
      .filter(app => {
        const appDate = new Date(app.date);
        console.log(`Checking past: ${app.date} < ${startOfToday} -> ${appDate < startOfToday}`); // Debug: Log date check
        return appDate < startOfToday;
      })
      .map(app => ({
        _id: app._id.toString(),
        patient: app.patient.toString(),
        patientName: app.patientName,
        date: app.date,
        timeSlot: app.timeSlot,
        appointmentType: app.appointmentType,
        doctor: {
          _id: app.doctor ? app.doctor._id.toString() : '',
          name: app.doctor ? app.doctor.name : 'Unknown Doctor'
        }
      }));

    const upcoming = appointments
      .filter(app => {
        const appDate = new Date(app.date);
        console.log(`Checking upcoming: ${app.date} >= ${startOfToday} -> ${appDate >= startOfToday}`); // Debug: Log date check
        return appDate >= startOfToday;
      })
      .map(app => ({
        _id: app._id.toString(),
        patient: app.patient.toString(),
        patientName: app.patientName,
        date: app.date,
        timeSlot: app.timeSlot,
        appointmentType: app.appointmentType,
        doctor: {
          _id: app.doctor ? app.doctor._id.toString() : '',
          name: app.doctor ? app.doctor.name : 'Unknown Doctor'
        }
      }));

    console.log('Returning appointments:', { past, upcoming }); // Debug: Log final response
    res.status(200).json({ past, upcoming });
  } catch (err) {
    console.error('Error fetching appointments:', err); // Debug: Log error
    res.status(500).json({ message: 'Fetching failed', error: err.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    console.log('🔍 DEBUG - Doctor Request User:', req.user);
    console.log('🔍 DEBUG - Doctor User ID:', req.user?.id);

    if (!req.user || !req.user.id) {
      console.error('❌ Unauthorized: No doctor user found in request');
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Check if user is a doctor
    const doctor = await User.findById(req.user.id);
    if (!doctor) {
      console.error('❌ Doctor not found in database');
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.role !== 'doctor') {
      console.error('❌ User is not a doctor, role:', doctor.role);
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }
    console.log('✅ Doctor found:', doctor.name);

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('patient', 'name')
      .sort({ date: 1 });

    console.log('👨‍⚕️ Raw doctor appointments from DB:', appointments.length);
    console.log('👨‍⚕️ Doctor appointments details:', JSON.stringify(appointments, null, 2));

    // Get current date for comparison
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Separate past and upcoming appointments
    const past = [];
    const upcoming = [];

    appointments.forEach(app => {
      const appDate = new Date(app.date);
      const appDateOnly = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
      
      const mappedApp = {
        _id: app._id.toString(),
        patient: {
          _id: app.patient ? app.patient._id.toString() : '',
          name: app.patient ? app.patient.name : 'Unknown Patient'
        },
        patientName: app.patientName,
        appointmentType: app.appointmentType,
        date: app.date,
        timeSlot: app.timeSlot,
        doctor: app.doctor.toString()
      };

      if (appDateOnly < startOfToday) {
        past.push(mappedApp);
      } else {
        upcoming.push(mappedApp);
      }
    });

    const result = { past, upcoming };
    console.log('👨‍⚕️ Final doctor response:', result);
    console.log(`👨‍⚕️ Doctor Summary: ${past.length} past, ${upcoming.length} upcoming`);

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error in getDoctorAppointments:', err);
    res.status(500).json({ 
      message: 'Fetching failed', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};