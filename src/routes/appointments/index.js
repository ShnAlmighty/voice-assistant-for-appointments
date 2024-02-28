const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/appointments');

// Schedule an appointment
router.post('/', appointmentController.createAppointment);

// Read all appointments
router.get('/all', appointmentController.readAllAppointments);

// Read a single appointment
router.get('/:id', appointmentController.readAppointment);

// Cancel an appointment
router.delete('/:id', appointmentController.deleteAppointment);

// Reschedule an appointment
router.patch('/:id', appointmentController.updateAppointment);

module.exports = router;
