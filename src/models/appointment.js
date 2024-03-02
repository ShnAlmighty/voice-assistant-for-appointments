const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientContact: {
    type: String
  },
  doctorName: {
    type: String,
    required: true,
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['available','scheduled', 'cancelled'],
    default: 'available',
  },
  created_at: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
