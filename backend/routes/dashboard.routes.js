const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getPatientsByDepartment,
    getTodaysAppointments,
    getRecentActivity,
    getSystemHealth
  } = require('../controllers/dashboard.controller');
  
  router.get('/summary', getDashboardSummary);
  router.get('/patients-by-department', getPatientsByDepartment);
  router.get('/todays-appointments', getTodaysAppointments);
  router.get('/activity', getRecentActivity);
  router.get('/system-health', getSystemHealth);

module.exports = router;
