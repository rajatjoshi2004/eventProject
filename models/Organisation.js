const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const organisationSchema = new Schema({
  companyName: {
    type: String,
    //required : true
  },
  numberOfBranches: {
    type: Number,
    //required : true
  },
  numberOfEmployees: {
    type: Number,
    //required : true
  },
  email1: {
    type: String,
    required: "Please add an email",
    trim: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  email2: {
    type: String,
    required: "Please add an email",
    trim: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  companyAddress: {
    type: String,
    //required : true
  },
  role: {
    type: [String],
    //required : true
  },
  fileUrl: {
    type: String,
  },
   createdAt: {
    type: Date,
    default: Date.now,
  },
  });

module.exports = mongoose.model("Organisation", organisationSchema);
