require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize } = require('sequelize');
const path = require('path');
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  pingInterval: 25000,
  pingTimeout: 5000,
    cors: {
      origin: '*', // Change this to your frontend's origin http://localhost:9000
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true, // Optional, if you need to support credentials
    }
});

// Middleware
app.use(cors({
  origin: '*', // Change this to your frontend's origin http://localhost:9000
  methods: ['GET', 'POST'],
  credentials: true, // Optional, if you need to support credentials
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
  })
  .finally(() => {
    console.log('🔄 Sequelize authentication attempt completed');
  });

// Routes
const AuthRoutes = require('./routes/AuthRoutes');
const AuthController = require('./controllers/AuthController');
const Auth = AuthController(io);
app.use('/api', AuthRoutes(Auth));

app.use('/api/preference/user', require('./routes/UserRoutes'));
app.use('/api/preference/office', require('./routes/OfficeRoutes'));
app.use('/api/feedback', require('./routes/FeedbackRoutes'))

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const ComplaintRoutes = require('./routes/ComplaintRoutes');
const ComplaintController = require('./controllers/ComplaintController');
const Complaint = ComplaintController(io);
app.use('/api/complaint', ComplaintRoutes(Complaint));

const KioskRatingRoutes = require('./routes/KioskRatingRoutes');
const KioskRatingController = require('./controllers/KioskRatingController');
const KioskRating = KioskRatingController(io);
app.use('/api/rating', KioskRatingRoutes(KioskRating));

require('./sockets')(io);

// Assuming your 'backend' folder is a direct sibling of 'frontend' within 'my-app/'
// and this server.js/app.js is directly within 'backend/' or 'backend/dist/'
const frontendBuildPath = path.join(__dirname, '..', '..', 'feedback-internal-quasar', 'dist', 'spa'); // Adjust as necessary

// If 'app.js' is inside 'backend/dist/', then it's two levels up:
// const frontendBuildPath = path.join(__dirname, '..', '..', 'frontend', 'build');

console.log(`Serving frontend static files from: ${frontendBuildPath}`);
app.use(express.static(frontendBuildPath));

// --- Handle Frontend Client-Side Routing (e.g., React Router) ---
// For any unhandled requests, serve the main index.html file
// This allows client-side routing to take over for paths like /about, /dashboard, etc.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
