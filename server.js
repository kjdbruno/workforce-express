// /**
//  * 
//  * 
//  * Dev
//  * 
//  */
// process.env.TZ = 'Asia/Manila'
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const socketIo = require('socket.io');
// const { Sequelize } = require('sequelize');
// const path = require('path');
// const app = express();
// const server = http.createServer(app);
// const { loginResetJob, yearlyLeaveBalance, dailyAutoCancel } = require('./utils/cron');

// const io = socketIo(server, {
//   pingInterval: 25000,
//   pingTimeout: 5000,
//     cors: {
//       origin: '*', // Change this to your frontend's origin http://localhost:9000
//       // origin: 'https://hris-ccmi.com',
//       // origin: [
//       //   'https://hris-ccmi.com',
//       //   'https://portal.hris-ccmi.com'
//       // ],
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['Content-Type'],
//       // credentials: true, // Optional, if you need to support credentials
//     }
// });

// // Middleware
// app.use(cors({
//   origin: '*', // Change this to your frontend's origin http://localhost:9000
//   // origin: 'https://hris-ccmi.com',
//   // origin: [
//   //   'https://hris-ccmi.com',
//   //   'https://portal.hris-ccmi.com'
//   // ],
//   methods: ['GET', 'POST'],
//   // credentials: true, // Optional, if you need to support credentials
// }));
// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ limit: '100mb', extended: true }));

// loginResetJob(io);
// yearlyLeaveBalance(io);
// dailyAutoCancel(io);

// // Initialize Sequelize
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   timezone: '+08:00',
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT,
//   dialectOptions: {
//     timezone: '+08:00'
//   }
// });

// sequelize.authenticate()
//   .then(() => {
//     console.log('✅ Database connected successfully');
//   })
//   .catch(err => {
//     console.error('❌ Database connection error:', err);
//   })
//   .finally(() => {
//     console.log('🔄 Sequelize authentication attempt completed');
//   });

// // Routes
// const AuthRoutes = require('./routes/AuthRoutes');
// const AuthController = require('./controllers/AuthController');
// const Auth = AuthController(io);
// app.use('/api', AuthRoutes(Auth));

// /**
//  * Socket
//  */
// const SocketRoutes = require('./routes/SocketRoutes');
// const SocketController = require('./controllers/SocketController');
// const Socket = SocketController(io);
// app.use('/api/socket', SocketRoutes(Socket));

// app.use('/api/user', require('./routes/UserRoutes'));
// app.use('/api/position', require('./routes/PositionRoutes'));
// app.use('/api/department', require('./routes/DepartmentRoutes'));
// app.use('/api/company', require('./routes/CompanyRoutes'));
// app.use('/api/schedule', require('./routes/ScheduleRoutes'));
// app.use('/api/signatory', require('./routes/SignatoryRoutes'));
// app.use('/api/leavetype', require('./routes/LeaveTypeRoutes'));
// app.use('/api/holiday', require('./routes/HolidayRoutes'));
// app.use('/api/shift', require('./routes/ShiftRoutes'));
// app.use('/api/school', require('./routes/SchoolRoutes'));
// app.use('/api/course', require('./routes/CourseRoutes'));

// app.use('/api/recruitment', require('./routes/RecruitmentRoutes'));
// app.use('/api/application', require('./routes/ApplicationRoutes'));

// app.use('/api/employee', require('./routes/EmployeeRoutes'));
// app.use('/api/leave', require('./routes/LeaveRoutes'));
// app.use('/api/attendance', require('./routes/AttendanceRoutes'));
// app.use('/api/overtime', require('./routes/OvertimeRoutes'));

// app.use('/api/salary', require('./routes/SalaryRoutes'));

// app.use('/api/log', require('./routes/LogRoutes'));

// /**
//  * PORTAL
//  */
// app.use('/api/portal', require('./routes/PortalRoutes'));

// app.use(express.static('public'));

// require('./sockets')(io);

// const MainPath   = path.join(__dirname, "..", "..", "workforce-quasar", "dist", "spa");

// // Serve static assets (JS, CSS, images)
// app.use(express.static(MainPath));

// // SPA fallback (VERY IMPORTANT for Vue Router)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(MainPath, "index.html"));
// });

// // Start server
// server.listen(process.env.PORT, () => {
//   console.log(`Server is running on http://localhost:${process.env.PORT} date: ${new Date()}`);
// });

// /**
//  * 
//  * 
//  * ***********************************************************************************************
//  * 
//  * 
//  */
/**
 * 
 * 
 * Dev
 * 
 */
// process.env.TZ = 'Asia/Manila'
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const https = require('https');
// const fs = require('fs');
// const path = require('path');
// const socketIo = require('socket.io');
// const { Sequelize } = require('sequelize');
// const app = express();

// // --- HTTPS certs (generated via mkcert or openssl into /certs) ---
// const sslOptions = {
//     key: fs.readFileSync(path.join(__dirname, 'certs', 'localhost-key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.pem')),
// };

// const server = https.createServer(sslOptions, app);

// const { loginResetJob, yearlyLeaveBalance, dailyAutoCancel } = require('./utils/cron');

// const io = socketIo(server, {
//   pingInterval: 25000,
//   pingTimeout: 5000,
//     cors: {
//       // origin: '*', // Change this to your frontend's origin http://localhost:9000
//       // origin: 'https://hris-ccmi.com',
//       origin: [
//         'https://hris-ccmi.com',
//         'https://portal.hris-ccmi.com'
//       ],
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['Content-Type'],
//       // credentials: true, // Optional, if you need to support credentials
//     }
// });

// // Middleware
// app.use(cors({
//   // origin: '*', // Change this to your frontend's origin http://localhost:9000
//   // origin: 'https://hris-ccmi.com',
//   origin: [
//     'https://hris-ccmi.com',
//     'https://portal.hris-ccmi.com'
//   ],
//   methods: ['GET', 'POST'],
//   // credentials: true, // Optional, if you need to support credentials
// }));
// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ limit: '100mb', extended: true }));

// loginResetJob(io);
// yearlyLeaveBalance(io);
// dailyAutoCancel(io);

// // Initialize Sequelize
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   timezone: '+08:00',
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT,
//   dialectOptions: {
//     timezone: '+08:00'
//   }
// });

// sequelize.authenticate()
//   .then(() => {
//     console.log('✅ Database connected successfully');
//   })
//   .catch(err => {
//     console.error('❌ Database connection error:', err);
//   })
//   .finally(() => {
//     console.log('🔄 Sequelize authentication attempt completed');
//   });

// // Routes
// const AuthRoutes = require('./routes/AuthRoutes');
// const AuthController = require('./controllers/AuthController');
// const Auth = AuthController(io);
// app.use('/api', AuthRoutes(Auth));

// /**
//  * Socket
//  */
// const SocketRoutes = require('./routes/SocketRoutes');
// const SocketController = require('./controllers/SocketController');
// const Socket = SocketController(io);
// app.use('/api/socket', SocketRoutes(Socket));

// app.use('/api/user', require('./routes/UserRoutes'));
// app.use('/api/position', require('./routes/PositionRoutes'));
// app.use('/api/department', require('./routes/DepartmentRoutes'));
// app.use('/api/company', require('./routes/CompanyRoutes'));
// app.use('/api/schedule', require('./routes/ScheduleRoutes'));
// app.use('/api/signatory', require('./routes/SignatoryRoutes'));
// app.use('/api/leavetype', require('./routes/LeaveTypeRoutes'));
// app.use('/api/holiday', require('./routes/HolidayRoutes'));
// app.use('/api/shift', require('./routes/ShiftRoutes'));
// app.use('/api/school', require('./routes/SchoolRoutes'));
// app.use('/api/course', require('./routes/CourseRoutes'));

// app.use('/api/recruitment', require('./routes/RecruitmentRoutes'));
// app.use('/api/application', require('./routes/ApplicationRoutes'));

// app.use('/api/employee', require('./routes/EmployeeRoutes'));
// app.use('/api/leave', require('./routes/LeaveRoutes'));
// app.use('/api/attendance', require('./routes/AttendanceRoutes'));
// app.use('/api/overtime', require('./routes/OvertimeRoutes'));

// app.use('/api/salary', require('./routes/SalaryRoutes'));

// app.use('/api/log', require('./routes/LogRoutes'));

// /**
//  * PORTAL
//  */
// app.use('/api/portal', require('./routes/PortalRoutes'));

// app.use(express.static('public'));

// require('./sockets')(io);

// const MainPath   = path.join(__dirname, "..", "..", "workforce-quasar", "dist", "spa");

// // Serve static assets (JS, CSS, images)
// app.use(express.static(MainPath));

// // SPA fallback (VERY IMPORTANT for Vue Router)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(MainPath, "index.html"));
// });

// // Start server (now HTTPS)
// server.listen(process.env.PORT, '0.0.0.0', () => {
//   console.log(`Server is running on https://localhost:${process.env.PORT} date: ${new Date()}`);
// });

/**
 * 
 * 
 * ***********************************************************************************************
 * 
 * 
 */


/**
 * 
 * 
 * Dev
 * 
 */
process.env.TZ = 'Asia/Manila'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize } = require('sequelize');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { loginResetJob, yearlyLeaveBalance, dailyAutoCancel } = require('./utils/cron');

const io = socketIo(server, {
  pingInterval: 25000,
  pingTimeout: 5000,
    cors: {
      // origin: '*', // Change this to your frontend's origin http://localhost:9000
      // origin: 'https://hris-ccmi.com',
      origin: [
        'https://hris-ccmi.com',
        'https://portal.hris-ccmi.com'
      ],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      // credentials: true, // Optional, if you need to support credentials
    }
});

// Middleware
app.use(cors({
    origin: [
        'https://hris-ccmi.com',
        'https://portal.hris-ccmi.com'
    ],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
}));

app.options('*', cors());

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

loginResetJob(io);
yearlyLeaveBalance(io);
dailyAutoCancel(io);

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  timezone: '+08:00',
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectOptions: {
    timezone: '+08:00'
  }
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

/**
 * Socket
 */
const SocketRoutes = require('./routes/SocketRoutes');
const SocketController = require('./controllers/SocketController');
const Socket = SocketController(io);
app.use('/api/socket', SocketRoutes(Socket));

app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/position', require('./routes/PositionRoutes'));
app.use('/api/department', require('./routes/DepartmentRoutes'));
app.use('/api/company', require('./routes/CompanyRoutes'));
app.use('/api/schedule', require('./routes/ScheduleRoutes'));
app.use('/api/signatory', require('./routes/SignatoryRoutes'));
app.use('/api/leavetype', require('./routes/LeaveTypeRoutes'));
app.use('/api/holiday', require('./routes/HolidayRoutes'));
app.use('/api/shift', require('./routes/ShiftRoutes'));
app.use('/api/school', require('./routes/SchoolRoutes'));
app.use('/api/course', require('./routes/CourseRoutes'));

app.use('/api/recruitment', require('./routes/RecruitmentRoutes'));
app.use('/api/application', require('./routes/ApplicationRoutes'));

app.use('/api/employee', require('./routes/EmployeeRoutes'));
app.use('/api/leave', require('./routes/LeaveRoutes'));
app.use('/api/attendance', require('./routes/AttendanceRoutes'));
app.use('/api/overtime', require('./routes/OvertimeRoutes'));

app.use('/api/salary', require('./routes/SalaryRoutes'));

app.use('/api/log', require('./routes/LogRoutes'));

/**
 * PORTAL
 */
app.use('/api/portal', require('./routes/PortalRoutes'));

app.use(express.static('public'));

require('./sockets')(io);

// const MainPath   = path.join(__dirname, "..", "..", "workforce-quasar", "dist", "spa");

// // Serve static assets (JS, CSS, images)
// app.use(express.static(MainPath));

// // SPA fallback (VERY IMPORTANT for Vue Router)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(MainPath, "index.html"));
// });

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT} date: ${new Date()}`);
});

/**
 * 
 * 
 * ***********************************************************************************************
 * 
 * 
 */