const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller.js");
const { protect, authorize } = require("../middleware/aauth");

router.get(
  "/user",
  protect,
  authorize(
    "user",
    "superadmin",
    "admin",
    "statelevel",
    "districtlevel",
    "localarea"
  ),
  userController.getUsersBasedOnRole
);

module.exports = router;
