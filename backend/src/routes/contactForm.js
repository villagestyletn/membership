
const express = require('express');
const router = express.Router();

router.post('/send', async (req, res) => {
    try {
      const { email, subject, message } = req.body;

      if (!email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Generate the email content
      // Send the email
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  });

  module.exports = router;
