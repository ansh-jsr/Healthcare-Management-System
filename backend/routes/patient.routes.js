const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const patientController = require('../controllers/patient.controller');

// View patients (all users)
router.get('/', protect, patientController.getAllPatients);
// Add patient (doctors only)
router.post('/', protect, upload.single('medicalFile'), patientController.addPatient);
// Edit patient (doctors only)
router.put('/:id', protect, patientController.editPatient);

router.patch('/:id/status', protect, patientController.updatePatientStatus);
// Delete patient (doctors only)
router.delete('/:id', protect, patientController.deletePatient);

router.post('/patient/medical-record', patientController.addMedicalRecord);
router.get('/patient/:id', patientController.getPatientById); 


module.exports = router; 