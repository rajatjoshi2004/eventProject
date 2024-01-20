const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskcontroller.js");
const { protect, authorize, getUserFromToken } = require("../middleware/aauth.js");

router
  .route("/")
  .get(
    protect,
    getUserFromToken,
    authorize(
      "superadmin",
      "admin",
      "statelevel",
      "districtlevel",
      "localarea",
      "designers",
      "designchecker",
      "proofchecker",
      "user"
    ),
    taskController.getAllTasks
  )
  .post(
    protect,
    getUserFromToken,
    authorize(
      "superadmin",
      "admin",
      "statelevel",
      "districtlevel",
      "localarea",
      "designers",
      "designchecker",
      "proofchecker",
      "user"
    ),
    taskController.addTask
  );

router.route("/cancel/:id").put(taskController.cancelTask);

router.route("/approve/:id").put(taskController.completeTask);

router
  .route("/:id")
  .get(
    protect,
    authorize(
      "superadmin",
      "admin",
      "statelevel",
      "districtlevel",
      "localarea",
      "designers",
      "designchecker",
      "proofchecker",
      "user"
    ),
    taskController.getById
  )

  .put(
    protect,
    authorize(
      "superadmin",
      "admin",
      "statelevel",
      "districtlevel",
      "localarea",
      "designers",
      "designchecker",
      "proofchecker",
      "user"
    ),
    taskController.updateTask
  )
  .delete(
    protect,
    authorize("superadmin", "admin", "statelevel", "districtlevel"),
    taskController.deleteTask
  );

module.exports = router;
