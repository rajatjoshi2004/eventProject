var cron = require("node-cron");
const Task = require("../models/Task");

// If task created ad over 15day make this state Overdue
async function addOverDueToTask() {
  // Send Request Every 3 hour => 0 0 */3 * * *
  cron.schedule("0 0 */3 * * *", async function () {
    var dateOffset = 24 * 60 * 60 * 1000 * 15; //15 days
    var myDate = new Date();
    myDate.setTime(myDate.getTime() - dateOffset);
    await Task.updateMany(
      {
        createdAt: {
          $lt: myDate,
        },
        state: "Ongoing",
      },
      {
        state: "Overdue",
      },
      { multi: true }
    );
  });
}
exports.addOverDueToTask = addOverDueToTask;
