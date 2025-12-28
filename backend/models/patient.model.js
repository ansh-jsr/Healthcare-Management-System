const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  doctor: String,
  diagnosis: String,
  symptoms: String,
  notes: String,
  medications: String,
  fileUrl: String
}, { timestamps: true });

const labTestSchema = new mongoose.Schema({
  doctor: String,
  test: String,
  notes: String,
  fileUrl: String
}, { timestamps: true });

const vaccinationSchema = new mongoose.Schema({
  doctor: String,
  vaccine: String,
  notes: String,
  fileUrl: String
}, { timestamps: true });


const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contactNumber: { type: String },
  address: { type: String },
  bloodType: { type: String },
  allergies: { type: [String] },

  insurance: {
    provider: { type: String },
    policyNumber: { type: String },
    expiryDate: { type: Date }
  },
  emergencyContact: { name: { type: String }, relationship: { type: String }, phone: { type: String } },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  registrationDate: { type: Date, default: Date.now },
  department: { type: String, enum: ['Cardiology,', 'Neurology', 'Orthopedics' ,'Pediatrics', 'General Medicine'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // doctor who created
  medicalFile: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema); 