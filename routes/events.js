const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventcontroller.js");
const { protect, authorize, getUserFromToken } = require("../middleware/aauth.js");


router
  .route("/")
  .get(getUserFromToken, eventController.getAllEvents)
  .post(    protect,
    authorize(
      "user",
      "superadmin",
      "admin",
      "statelevel",
      "districtlevel",
      "localarea",
      "designers",
      "designchecker",
      "proofchecker"
    ),eventController.create);

router
  .route("/:id")
  .get(eventController.getEventById)
  .put(protect,
    //  authorize("superadmin"), 
     eventController.updateEvent)
  .delete(protect,
    //  authorize("superadmin"),
      eventController.deleteEvent);


module.exports = router;
