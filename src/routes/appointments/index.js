const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/appointments');

// Create an appointment
router.post('/', appointmentController.createAppointment);

// Schedule a patient's appointment
router.post('/schedule', appointmentController.schedulePatientAppointment);

// Read all appointments
router.get('/all', appointmentController.readAllAppointments);

// Read a single appointment
router.get('/:id', appointmentController.readAppointment);

// Cancel a patient's appointment
router.delete('/schedule', appointmentController.cancelPatientAppointment);

// Cancel an appointment
router.delete('/:id', appointmentController.deleteAppointment);

// Reschedule a patient's appointment
router.patch('/schedule', appointmentController.reschedulePatientAppointment);

// Reschedule an appointment
router.patch('/:id', appointmentController.updateAppointment);

module.exports = router;
