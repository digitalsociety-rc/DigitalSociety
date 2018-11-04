var express = require('express');
var myClient = require('../app');
var router = express.Router();

/* GET List of facilities of a society */
router.get('/', function(req, res, next) {
  console.log("In getFacilities");
  res.send(myClient.client.getEventList());

  console.log("Out getFacilities");
});

module.exports = router;