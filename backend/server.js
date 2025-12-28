require('dotenv').config();
const express = require('express');
const multer = require("multer");
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(helmet());
app.use(cors());


app.use('/api', require('./routes/file.routes')); 


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

global.io = io; 



// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});



app.use(express.json()); // needed to parse JSON body
app.use('/api/support', require('./routes/support.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
      // handles multipart/form-data — keep this safe from json() parser
app.use('/api', require('./routes/health.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/records', require('./routes/record.routes'));

console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI); // Debug print

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch(err => console.error('MongoDB connection error:', err)); 