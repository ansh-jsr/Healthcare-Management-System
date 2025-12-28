const mongoose = require('mongoose');

const medicalRecord = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
   appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recordType: { 
    type: String, 
    required: true,
    enum: ['Lab Result', 'Prescription', 'Diagnosis', 'Annual Checkup']
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  recordDate: { 
    type: Date, 
    default: Date.now 
  },
  fileName: {
    type: String,
    default: null
  }
},{
  timestamps: true // This adds createdAt and updatedAt fields automatically
});


// Add indexes for better query performance
medicalRecord.index({ patient: 1, recordDate: -1 });
medicalRecord.index({ doctor: 1, recordDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecord);