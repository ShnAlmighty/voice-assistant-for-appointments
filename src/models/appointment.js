const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
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
});

module.exports = mongoose.model('Appointment', appointmentSchema);
