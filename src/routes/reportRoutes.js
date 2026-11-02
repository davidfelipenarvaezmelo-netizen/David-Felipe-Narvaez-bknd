const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportById,
  createReport,
  confirmReport,
  deleteReport,
} = require('../controllers/reportController');

router.route('/')
  .get(getReports)
  .post(createReport);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

router.route('/:id/confirm')
  .patch(confirmReport);

module.exports = router;

