const mongoose = require('mongoose');

const PDFRecordSchema = new mongoose.Schema({
  fileUrl: String,      // IPFS or cloud storage URL
  uploadedAt: Date
});

const ConsultationSchema = new mongoose.Schema({
  doctor: String,
  diagnosis: String,
  symptoms: [String],
  notes: String,
  medications: [String],
  record: PDFRecordSchema
});

const LabTestSchema = new mongoose.Schema({
  doctor: String,
  test: String,
  notes: String,
  record: PDFRecordSchema
});

const VaccinationSchema = new mongoose.Schema({
  doctor: String,
  vaccine: String,
  notes: String,
  record: PDFRecordSchema
});

const MedicalHistorySchema = new mongoose.Schema({
  consultations: [ConsultationSchema],
  labTests: [LabTestSchema],
  vaccinations: [VaccinationSchema]
});

const InsuranceDetailsSchema = new mongoose.Schema({
  provider: String,
  policyNumber: String,
  expiryDate: Date
});

const PersonalInfoSchema = new mongoose.Schema({
  allergies: [String],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  }
});

const DetailsSchema = new mongoose.Schema({
  fullName: String,
  gender: String,
  dob: Date,
  age: Number,
  contactNumber: String,
  email: String,
  bloodGroup: String,
  address: String,
  personalInfo: PersonalInfoSchema,
  insuranceDetails: InsuranceDetailsSchema,
  medicalHistory: MedicalHistorySchema
}, { timestamps: true });

module.exports = mongoose.model('Details', DetailsSchema);
