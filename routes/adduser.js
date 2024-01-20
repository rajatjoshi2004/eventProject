const express = require("express");
const router = express.Router();
const adduserController = require("../controller/addusercontroller.js");

router.get("/", adduserController.getAllForms);
router.post("/", adduserController.addForm);
router.get("/:id", adduserController.getById);

module.exports = router;
