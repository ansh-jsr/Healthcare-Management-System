const express = require('express');
const router = express.Router();
const {bookAppointment, 
  getAvailableSlots, 
  getDoctors, 
  getPatientAppointments, getDoctorAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth.middleware');

router.post('/book', protect, bookAppointment);
router.get('/slots', protect, getAvailableSlots);
router.get('/doctors', protect, getDoctors);
router.get('/patient', protect, getPatientAppointments);
router.get('/doctor-appointments', protect, getDoctorAppointments);
module.exports = router;
