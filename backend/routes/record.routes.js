const express = require('express');
const router = express.Router();
const {uploadRecord, getRecordsByPatient,deleteRecord} = require('../controllers/record.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/',protect,  uploadRecord);
router.get('/:patientId',protect, getRecordsByPatient);
router.delete('/:recordId',protect, deleteRecord);

module.exports = router;
