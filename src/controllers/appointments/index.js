const twilio = require('twilio');
const xss = require('xss');
const moment = require('moment');
const VoiceResponse = twilio.twiml.VoiceResponse;

const Appointment = require('../../models/appointment');
const { extractDateTime, reduceConfirmation } = require('../utils/speech');

const createAppointment = async(req, res) => {
  try {
    const { doctorName, appointmentTime } = req.body;
    if(!doctorName || !appointmentTime){
      throw new Error("Kindly provide the necessary details");
    }
    const appointmentObj = {
      doctorName: xss(doctorName),
      appointmentTime: xss(appointmentTime),
      status: 'available' 
    }
    const appointment = new Appointment(appointmentObj);
    await appointment.save();
    res.status(201).json({ message: 'Appointment Created successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to Create the appointment', message: error.message });
  }
};

const schedulePatientAppointment = async(req, res) => {
  const twiml = new VoiceResponse();
  const userInput = xss(req.body.SpeechResult);
  console.log({userInput});
  try {
    const { date_utc } = extractDateTime(userInput);
    console.log({date_utc})
    const appointment = await Appointment.findOne({appointmentTime: date_utc });
    if(!appointment){
      twiml.say('Appointment at the given time is not found, kindly try again.');
      twiml.redirect('/voicecalls/menu');
    } else {
      appointment.patientContact = xss(req.body.From);
      appointment.status = 'scheduled';
      await appointment.save();

      const formattedDay = moment(appointment.appointmentTime).format('dddd');
      const formattedDate = moment(appointment.appointmentTime).format('MMMM Do');
      const formattedTime = moment(appointment.appointmentTime).format('h:mm a');

      const str = `Your appointment with ${appointment.doctorName} is booked on ${formattedDay}, ${formattedDate}, at ${formattedTime}`;
      twiml.say(str);
      twiml.redirect('/voicecalls/menu');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.log("Error in scheduling patient's appointment: ", error);
    twiml.say('Appologies, I am not able to schedule an appointment due to some issues. Kindly try again later.');
    twiml.redirect('/voicecalls/menu');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

const readAppointment = async (req, res) => {
  try {
    const appointment_id = xss(req.params.id);
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (error) {
    console.log("Error in reading appointment: ", error);
    res.status(500).json({ error: 'Failed to read appointment', message: error.message });
  }
};

const readAllAppointments = async (req, res) => {
  try {
    const query_status = req?.query?.status ?? 'available';
    const status = xss(query_status);
    const appointments = await Appointment.find({ status });
    if (appointments.length == 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }
    res.json({ appointments });
  } catch (error) {
    console.log("Error in reading all appointments: ", error);
    res.status(500).json({ error: 'Failed to read all appointments', message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment_id = xss(req.params.id);
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    console.log("Error in deleting appointment: ", error);
    res.status(500).json({ error: 'Failed to cancel appointment', message: error.message });
  }
};

const cancelPatientAppointment = async(req, res) => {
  const twiml = new VoiceResponse();
  try {
    const patientContact = xss(req.body.From);
    const userInput = xss(req.body.SpeechResult);
    console.log({userInput});
    const choice = reduceConfirmation(userInput);
    console.log({userInput, choice})

    if (choice == "Yes") {
      const appointment = await Appointment.findOne({ patientContact, status: 'scheduled' });

      //Save the cancelled appointment as a document in DB for reference
      const cancelled_appointment_obj = {
        doctorName: appointment.doctorName,
        appointmentTime: appointment.appointmentTime,
        patientContact,
        status: 'cancelled' 
      };
      const cancelled_appointment_doc = new Appointment(cancelled_appointment_obj);
      await cancelled_appointment_doc.save();

      appointment.patientContact = undefined;
      appointment.status = 'available';
      await appointment.save();

      twiml.say('Your appointment with ' + appointment.doctorName + ' on ' + moment(appointment.appointmentTime).format('MMMM Do, YYYY, h:mm a') + ' is cancelled.');
      twiml.redirect('/voicecalls/menu');
    } else if(choice == "No") {
      twiml.say('Okay, moving back to main menu.');
      twiml.redirect('/voicecalls/menu');
    } else {
      twiml.say('I did not understand that. Please try again later.');
      twiml.redirect('/voicecalls/menu');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.log("Error in cancelling patient's appointment: ", error);
    twiml.say('Appologies, I am not able to cancel the appointment due to some issues. Kindly try again later.');
    twiml.redirect('/voicecalls/menu');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment_id  = xss(req.params.id);
    const { appointmentTime } = req.body;
    const appointmentTimeCleansed = xss(appointmentTime)
    const appointment = await Appointment.findByIdAndUpdate(appointment_id, { appointmentTime: appointmentTimeCleansed }, { new: true });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    console.log("Error in updating ppointment: ", error);
    res.status(500).json({ error: 'Failed to reschedule appointment', message: error.message });
  }
};

const reschedulePatientAppointment = async(req, res) => {
  const twiml = new VoiceResponse();
  try {
    const patientContact = xss(req.body.From); //TODO: use xss to parse this first
    const userInput = xss(req.body.SpeechResult);
    const choice = reduceConfirmation(userInput);
    console.log({userInput, choice});
    if (choice == "Yes") {
      twiml.say('I will be glad to help you in booking another appointment. Let me check the available appointment slots.');
      const availableSlots = await Appointment.find({status: 'available'}).sort('appointmentTime').limit(10).lean();
      if (availableSlots.length === 0) {
        twiml.say('Sorry, there are no appointment slots available currently. Kindly try again later.');
        twiml.redirect('/voicecalls/menu');
      } else {
        // Make the previous appointment available for others
        await Appointment.findOneAndUpdate({ patientContact }, { $unset: { patientContact: "" }, status: 'available' });
        
        twiml.say('Here are the available appointment slots, kindly say the day and time of the appointment you want to book. For example, you can say I want to book the slot at Friday 11 am.');
        twiml.say('Available appointment slots are');
        for (let i = 0; i < availableSlots.length; i++) {
          const slot = availableSlots[i];
          const formattedTime = moment(slot.appointmentTime).format('MMMM Do, YYYY, h:mm a');
          twiml.say(`${i + 1}. ${formattedTime} with ${slot.doctorName}`);
        }
        const gather = twiml.gather({
          input: 'speech',
          action: '/appointments/schedule',
          method: 'POST',
          speechTimeout: 5
        });
        gather.say('You can say the desired appointment day followed by the time now');
      }
    } else if(choice == "No") {
      twiml.say('Okay, moving back to main menu.');
      twiml.redirect('/voicecalls/menu');
    } else {
      twiml.say('I did not understand that. Please try again later.');
      twiml.redirect('/voicecalls/menu');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.log("Error in rescheduling patient's appointment: ", error);
    twiml.say('Appologies, I am not able to reschedule the appointment due to some issues. Kindly try again later.');
    twiml.redirect('/voicecalls/menu');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

module.exports = {
  createAppointment,
  schedulePatientAppointment,
  readAppointment,
  readAllAppointments,
  deleteAppointment,
  cancelPatientAppointment,
  updateAppointment,
  reschedulePatientAppointment
}