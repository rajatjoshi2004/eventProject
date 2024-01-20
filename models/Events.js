const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventsSchema = new Schema({
  eventName: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },

  eventCategory: {
    type: String,
    required: true,
  },

  eventDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
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
  description: {
    type: String,
    required: true,
  },
  companyName: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  user: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

});

module.exports = mongoose.model("Events", eventsSchema);
