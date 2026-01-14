require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize } = require('sequelize');
const path = require('path');
const app = express();
const server = http.createServer(app);
const loginResetJob = require('./utils/cron');

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

loginResetJob(io);

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

app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/position', require('./routes/PositionRoutes'));
app.use('/api/department', require('./routes/DepartmentRoutes'));
app.use('/api/company', require('./routes/CompanyRoutes'));
app.use('/api/schedule', require('./routes/ScheduleRoutes'));
// app.use('/api/employmentstatus', require('./routes/EmploymentStatusRoutes'));
// app.use('/api/appointmentstatus', require('./routes/AppointmentmentStatusRoutes'));
// app.use('/api/taxcode', require('./routes/TaxCodeRoutes'));
// app.use('/api/leavetype', require('./routes/LeaveTypeRoutes'));
// app.use('/api/governmentagency', require('./routes/GovernmentAgencyRoutes'));

// app.use('/api/school', require('./routes/SchoolRoutes'));
// app.use('/api/schoollevel', require('./routes/SchoolLevelRoutes'));
// app.use('/api/course', require('./routes/CourseRoutes'));

// app.use('/api/salaryclass', require('./routes/SalaryClassRoutes'));
// app.use('/api/salarygrade', require('./routes/SalaryGradeRoutes'));
// app.use('/api/salary', require('./routes/SalaryRoutes'));
// app.use('/api/increment', require('./routes/IncrementRoutes'));
// app.use('/api/rate', require('./routes/RateRoutes'));
// app.use('/api/scheduleclass', require('./routes/ScheduleClassRoutes'));
// app.use('/api/scheduleshift', require('./routes/ScheduleShiftRoutes'));
// app.use('/api/premiumpay', require('./routes/PremiumPayRoutes'));
// app.use('/api/holiday', require('./routes/HolidayRoutes'));
// app.use('/api/incidentclass', require('./routes/IncidentClassRoutes'));
// app.use('/api/incidentrole', require('./routes/IncidentRoleRoutes'));
// app.use('/api/signatorytype', require('./routes/SignatoryTypeRoutes'));
// app.use('/api/signatoryprofile', require('./routes/SignatoryRoutes'));
app.use('/api/recruitment', require('./routes/RecruitmentRoutes'));
app.use('/api/application', require('./routes/ApplicationRoutes'));
// app.use('/api/vacancy/signatory', require('./routes/VacancySignatoryRoutes'));

app.use('/api/employee', require('./routes/EmployeeRoutes'));
// app.use('/api/employment', require('./routes/EmploymentRoutes'));
// app.use('/api/face', require('./routes/FaceRoutes'));
// app.use('/api/leave', require('./routes/LeaveRoutes'));
// app.use('/api/dtr', require('./routes/DTRRoutes'));

app.use(express.static('public'));

require('./sockets')(io);

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
