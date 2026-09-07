const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config/keys');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Requested endpoint not found.' });
});

app.use(errorHandler);

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/server.cert'))
};

https.createServer(httpsOptions, app).listen(config.port, () => {
  console.log(`[HustleHub+ API] Secure HTTPS Server running on port ${config.port}`);
});
