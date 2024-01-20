const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  taskName: {
    type: String,
    //required : true
  },

  description: {
    type: String,
    //required: [true, 'Please add a description'],
    maxlength: [500, "Description can not be more than 500 characters"],
  },

  dueDate: {
    type: Date,
    //required : true
  },
  allocatedTo: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Created", "ProcessDesigner", "ApprovedCreator"],
    // required : true
  },
  state: {
    type: String,
    enum: ["Ongoing", "Completed", "Overdue", "Cancelled"],
  },
  createdBy: {
    type: String,
    // required : true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdateBy: {
    type: String,
    //required : true
  },
  lastUpdatedOn: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  companyName: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  fileUrl: {
    type: [String],
  },
  reportDescription: {
    type: String,
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  reportUrl: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Task", taskSchema);
