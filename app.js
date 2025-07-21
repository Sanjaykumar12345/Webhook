// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 10080; // Default port
const verifyToken = process.env.VERIFY_TOKEN || 'brothersinchrist'; // Use your token here

// Route for GET requests (webhook verification)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ WEBHOOK VERIFICATION FAILED - Invalid token or mode');
    res.sendStatus(403);
  }
});

// Route for POST requests (message handling + status updates)
app.post('/webhook', (req, res) => {
  const body = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n📩 Webhook received at ${timestamp}:\n`);
  console.log(JSON.stringify(body, null, 2));

  // ✅ Check for WhatsApp delivery status updates
  if (body.entry) {
    body.entry.forEach(entry => {
      if (entry.changes) {
        entry.changes.forEach(change => {
          const value = change.value;

          // Check for status updates
          if (value && value.statuses) {
            value.statuses.forEach(status => {
              console.log(`✅ WhatsApp Message Status Update:`);
              console.log(`- Message ID: ${status.id}`);
              console.log(`- Status: ${status.status}`); // sent, delivered, read, failed
              console.log(`- Timestamp: ${status.timestamp}`);
              console.log(`- Recipient: ${status.recipient_id}`);
            });
          }

          // Optionally: Handle incoming messages too
          if (value && value.messages) {
            value.messages.forEach(msg => {
              console.log(`💬 New WhatsApp Message:`);
              console.log(`- From: ${msg.from}`);
              console.log(`- Type: ${msg.type}`);
              if (msg.text) console.log(`- Message: ${msg.text.body}`);
            });
          }
        });
      }
    });
  }

  res.sendStatus(200);
});

// Error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error('🔥 Error occurred:', err.stack);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 Listening on port ${port}\n`);
});
