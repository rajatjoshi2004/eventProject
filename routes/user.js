const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller.js");
const { protect, authorize } = require("../middleware/aauth");
const { getUserFromToken } = require("../middleware/aauth.js");
const addFileToStroage = require("../controller/addFileToStroage.js");
const Multer = require("multer");

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
    },
  });



// router.post("/", upload.single('photo'), userController.addUser);
router.post("/", userController.addUser);
router.route("/upload").post(multer.array("files"), addFileToStroage.upload);
router.get("/", getUserFromToken, userController.getAllUsers);
router.route("/current").get(userController.currentUser);
router.get("/:id", userController.getById);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
