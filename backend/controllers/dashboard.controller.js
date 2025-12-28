const patient = require('../models/patient.model');
const appointment = require('../models/appointment');
const Activity = require('../models/activity.model');
const os = require('os');
const mongoose = require('mongoose');

exports.getDashboardSummary = async (req, res) => {
    try {
        const totalPatientsDB = await patient.countDocuments();
        const activeRecordsDB = await patient.countDocuments({ isActive: true });
    
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
    
        const appointmentsTodayDB = await appointment.countDocuments({
          date: { $gte: todayStart, $lte: todayEnd }
        });
    
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newPatientsThisMonthDB = await patient.countDocuments({
          createdAt: { $gte: startOfMonth }
        });
    
        // Baseline values
        const BASE_TOTAL_PATIENTS = 1284;
        const BASE_NEW_PATIENTS = 68;
        const BASE_APPOINTMENTS = 42;
        const BASE_ACTIVE_RECORDS = 958;
    
        const totalPatients = BASE_TOTAL_PATIENTS + totalPatientsDB;
        const newPatientsThisMonth = BASE_NEW_PATIENTS + newPatientsThisMonthDB;
        const appointmentsToday = BASE_APPOINTMENTS + appointmentsTodayDB;
        const activeRecords = BASE_ACTIVE_RECORDS + activeRecordsDB;

    const io = req.app.get('io'); // 🔥 Access io from app context
    io.emit('dashboardUpdated', {
      totalPatients,
      appointmentsToday,
      newPatientsThisMonth,
      activeRecords
    });

    res.json({
      totalPatients,
      appointmentsToday,
      newPatientsThisMonth,
      activeRecords
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.getPatientsByDepartment = async (req, res) => {
    try {
      const result = await patient.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$department', 'Unknown'] },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            department: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
  
      res.json(result);
    } catch (err) {
      console.error('Error fetching patients by department:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getTodaysAppointments = async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const appointments = await appointment.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).sort({ time: 1 });
  
      res.json(appointments);
    } catch (err) {
      console.error('Error fetching today\'s appointments:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };


exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(4);
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    // Simulated metrics
    const databasePerformance = Math.floor(Math.random() * 10) + 90;
    const apiResponseTime = Math.floor(Math.random() * 20) + 80;
    const systemUptime = (os.uptime() / 3600).toFixed(1); // in hours
    const storageUsage = Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);

    res.json({
      success: true,
      data: {
        databasePerformance,
        apiResponseTime,
        systemUptime,
        storageUsage,
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

