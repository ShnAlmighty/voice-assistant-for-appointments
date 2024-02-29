const express = require('express');
const router = express.Router();
const voiceCallController = require('../../controllers/voicecalls');

// Handle a call
router.post('/', voiceCallController.handleCall);
router.post('/status', voiceCallController.handleCallStatus);

module.exports = router;
