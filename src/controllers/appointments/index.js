const Appointment = require('../../models/appointment');

const createAppointment = async(req, res) => {
  try {
    const { doctorName, appointmentTime } = req.body;
    if(!doctorName || !appointmentTime){
      throw new Error("Kindly provide the necessary details");
    }
    const appointmentObj = {
      doctorName,
      appointmentTime,
      status: 'available' 
    }
    const appointment = new Appointment(appointmentObj);
    await appointment.save();
    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule appointment', message: error.message });
  }
};

const readAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment', message: error.message });
  }
};

const readAllAppointments = async (req, res) => {
  try {
    const status = req?.query?.status ?? 'available';
    const appointments = await Appointment.find({ status });
    if (appointments.length == 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment', message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment', message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentTime } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(id, { appointmentTime }, { new: true });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reschedule appointment', message: error.message });
  }
}

module.exports = {
  createAppointment,
  readAppointment,
  readAllAppointments,
  deleteAppointment,
  updateAppointment
}