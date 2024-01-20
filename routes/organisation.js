const express = require("express");
const router = express.Router();
const orgController = require("../controller/organisation.js");
const addFileToStroage = require("../controller/addFileToStroage.js");
const Multer = require("multer");

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
    },
  });

router.post("/", orgController.addOrg);
router.get("/", orgController.getAllOrgs);
router.get("/:id", orgController.getById);
router.route("/upload").post(multer.array("files"), addFileToStroage.upload);
// router.put("/:id", protect, orgController.updateorg);
// router.delete("/:id", orgController.deleteorg);

module.exports = router;
