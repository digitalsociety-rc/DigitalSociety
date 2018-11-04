var express = require('express');
var myClient = require('../app');
var router = express.Router();

// WORK IN PROGRESS

/* POST Create a booking for a facility with ID = eventId */
/*

@param Integer eventId (facility)
@param Integer unitId (provider eg. Sankul)
@param String date in Y-m-d format
@param String time in H:i:s format
@param Object clientData eg. {name: 'Name', email: 'test@gmail.com', phone: '+38099999999'}
@param array
@param Integer count bookings count, min. 1 (using for group bookings batch). (optional)
@param Integer batchId add booking to multiple bookings batch. (optional)
@param Array recurringData make booking recurrent. (optional)
@return Object

*/

var additionalFields = ['2bc5e30fd258cc4a89be5fe09396ca7caa481cf33e682abf200a55e8cdb3f80f','2e92bf595e6cb07b56510c057026bf16e9d2ff5d741acaeb7e287e92116047d0'];


router.get('/', function(req, res, next) {
  console.log("In createBooking");

  var eventId = req.eventId;
  var unitId = req.unitId;
  var date = req.date;
  var time = req.time;
  var clientData = req.clientData;

  var tmpClientData = {name: 'Name', email: 'test@gmail.com', phone: '+38099999999'}
  console.log(myClient.client)
  res.send(myClient.client.book(1, 1, "2018-11-02", "15:00:00", tmpClientData, additionalFields));

  console.log("Out createBooking");
});

module.exports = router;