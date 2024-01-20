var cron = require("node-cron");
const Project = require("../models/Project");

// If Project created ad over 15day make this state Overdue
async function addOverDueToProject() {
  // Send Request Every 3 hour => 0 0 */3 * * *
  cron.schedule("0 0 */3 * * *", async function () {
    var dateOffset = 24 * 60 * 60 * 1000 * 15; //15 days
    var myDate = new Date();
    myDate.setTime(myDate.getTime() - dateOffset);
    await Project.updateMany(
      {
        dueDate2: {
          $lt: myDate,
        },
        state: "Inprogress",
      },
      {
        state: "Overdue",
      },
      { multi: true }
    );
  });
}
exports.addOverDueToProject = addOverDueToProject;
