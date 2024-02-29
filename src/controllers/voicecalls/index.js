
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const appointmentController = require('../appointments');

const handleCall = async(req, res) => {
  try {
    const twiml = new VoiceResponse();

    twiml.say('Hello from your pals at Twilio! Have fun.');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch(err) {
    console.log(err.message);
    twiml.say('Appologies, we are facing some issues right now!');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
    // res.send("Error occured during processing");
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
  handleCallStatus
}