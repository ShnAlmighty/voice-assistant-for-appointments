const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const appointmentRoutes = require('./src/routes/appointments');
const voiceCallRoutes = require('./src/routes/voicecalls');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send("Welcome to Appointment APIs");
})

app.use(express.json());

app.use('/appointments', appointmentRoutes);
app.use('/voicecalls', voiceCallRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
