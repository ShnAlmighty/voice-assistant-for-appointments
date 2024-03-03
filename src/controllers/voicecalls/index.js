
const dialogflow = require('@google-cloud/dialogflow');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const dotenv = require('dotenv');
dotenv.config();

const appointmentController = require('../appointments');
const Appointment = require('../../models/appointment');

const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID;

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;

const client = new twilio(TWILIO_SID, TWILIO_TOKEN);

const handleCall = async(req, res) => {
  console.log("RequestHandleCall=", req.body);
  const twiml = new VoiceResponse();
  try {
    twiml.say('Welcome to Appointment Clinic, I am your virtual assistance. I can help you in scheduling, rescheduling and cancelling your appointments with our clinic.');
    twiml.redirect('/voicecalls/menu');
    console.log(twiml.toString());
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch(err) {
    console.log(err.message);
    twiml.say('Appologies, we are facing some issues right now!');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

const handleCallMenu = async(req, res) => {
  console.log("RequestMENu=", req.body);
  const twiml = new VoiceResponse();
  try {
    const gather = twiml.gather({
        input: 'speech',
        action: '/voicecalls/query',
        method: 'POST',
        speechTimeout: 2
    });
    gather.say('Kindly tell me how I can help you');
    
    console.log(twiml.toString());
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch(err) {
    console.log(err.message);
    twiml.say('Appologies, we are facing some issues right now!');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

const readAvailableAppointments = async() => {

}

const handleQuery = async(req, res) => {
  console.log("reqQuery", req.body);
  const twiml = new VoiceResponse();
  try {
    const userInput = req.body.SpeechResult;

    const sessionID = uuidv4();
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(PROJECT_ID, sessionID);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: userInput,
          languageCode: 'en-US'
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);

    const response = responses[0].queryResult;

    const intent = response.intent.displayName;
    console.log({intent});

    if (intent == 'Schedule') {
      const scheduledSlot = await Appointment.findOne({ patientContact: req.body.From, status: 'scheduled' }).lean();
      if(scheduledSlot){
        twiml.say('It looks like you already have an appointment, kindly cancel or reschedule it before proceeding.');
        twiml.redirect('/voicecalls/menu');
      } else {
        const availableSlots = await Appointment.find({status: 'available'}).sort('appointmentTime').limit(10).lean();
        if (availableSlots.length === 0) {
          twiml.say('Sorry, there are no appointments available currently.');
          twiml.redirect('/voicecalls/menu');
        } else {
          twiml.say('Here are the available appointment slots, kindly say the day and time of the appointment you want to book. For example, you can say I want to book the slot at Friday 11 am.');
          twiml.say('Available appointment slots are');
  
          // List and announce available slots clearly
          for (let i = 0; i < availableSlots.length; i++) {
            const slot = availableSlots[i];

            const formattedDay = moment(slot.appointmentTime).format('dddd');
            const formattedDate = moment(slot.appointmentTime).format('MMMM Do');
            const formattedTime = moment(slot.appointmentTime).format('h:mm a');

            const str = `${i + 1}. ${formattedDay}, ${formattedDate}, ${formattedTime}`;
            twiml.say(str);
            // const formattedTime = moment(slot.appointmentTime).format('MMMM Do, YYYY, h:mm a');
            // twiml.say(`${i + 1}. ${formattedTime} with ${slot.doctorName}`);
          }
          const gather = twiml.gather({
            input: 'speech',
            action: '/appointments/schedule',
            method: 'POST',
            speechTimeout: 5
          });
          gather.say('You can say the desired appointment day followed by the time now');
        } 
      }
    } else if (intent == 'Reschedule') {
      const scheduledSlot = await Appointment.findOne({ patientContact: req.body.From });
      if (!scheduledSlot) {
        twiml.say('Sorry, you have no scheduled appoinment. If you want to schedule an appointment, I can help you with that.');
        twiml.redirect('/voicecalls/menu');
      } else {
        twiml.say('Your scheduled appointment is');
        
        const formattedTime = moment(scheduledSlot.appointmentTime).format('MMMM Do, YYYY, h:mm a');
        
        twiml.say(`${formattedTime} with ${scheduledSlot.doctorName}`);

        const gather = twiml.gather({
          action: '/appointments/schedule/reschedule',
          input: 'speech',
          speechTimeout: 5,
          method: 'POST'
        });
        gather.say('Do you want to reschedule this appointment?');
      }
    } else if (intent == 'Cancel') {
      const scheduledSlot = await Appointment.findOne({ patientContact: req.body.From, status: 'scheduled' }).lean();

      if (!scheduledSlot) {
        twiml.say('Sorry, you have no scheduled appoinment. If you want to schedule an appointment, I can help you with that.');
        twiml.redirect('/voicecalls/menu');
      } else {
        twiml.say('Your scheduled appointment is');
        
        const formattedTime = moment(scheduledSlot.appointmentTime).format('MMMM Do, YYYY, h:mm a');
        
        twiml.say(`${formattedTime} with ${scheduledSlot.doctorName}`);

        const gather = twiml.gather({
          action: '/appointments/schedule/cancel',
          input: 'speech',
          speechTimeout: 5,
          method: 'POST'
        });
        gather.say('Do you want to cancel this appointment?');
      }      
    } else if(intent == 'Done') {
      twiml.say('I am happy that I can assist you, thanks for calling.');
      twiml.hangup();
    } else {
      twiml.say('Sorry, I did not get that.');
      twiml.redirect('/voicecalls/menu');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch(err) {
    console.log(err.message);
    twiml.say('Appologies, we are facing some issues right now. Kindly try again later.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
};

const handleCallStatus = async(req, res) => {
  try {
    console.log("STATUS UPDATE:", req.body);
    res.send()
  } catch(err) {
    console.log(err.message);
    res.send();
    // res.send("Error occured during processing");
  }
};

module.exports = {
  handleCall,
  handleCallMenu,
  handleQuery,
  handleCallStatus
}