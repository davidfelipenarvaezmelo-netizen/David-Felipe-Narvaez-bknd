const express = require('express');
const router = express.Router();
const {
  getActiveAlerts,
  createAlert,
  dismissAlert,
} = require('../controllers/alertController');

router.route('/')
  .get(getActiveAlerts)
  .post(createAlert);

router.route('/:id/dismiss')
  .patch(dismissAlert);

module.exports = router;

