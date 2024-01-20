const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    //required : true
  },

  projectDescription: {
    type: String,
    //required: [true, 'Please add a description'],
    maxlength: [500, "Description can not be more than 500 characters"],
  },

  sampleImage: {
    type: [String]
    //default: 'no-image.jpg'
  },
  dueDate1: {
    type: Date,
    // required : true
  },
  dueDate2: {
    type: Date,
    // required : true
  },
  compulsoryWordings: {
    type: String,
    // required : true
  },
  primaryColor: {
    type: String,
  },
  secondaryColor: {
    type: String,
  },
  size: {
    type: String,
  },
  leaderPhoto: {
    type: [String]
    // required : true,
    // maxsize : 400
  },
  compulsoryPhoto: {
    type: [String]
  },
  status: {
    type: String,
    enum: [
      "Created",
      "ProcessDesigner",
      "SubmittedDesigner",
      "ApprovedCreator",
      "ProcessCheckers",
      "ApprovedPChecker",
      "ApprovedDChecker",
      "ApprovedDChecker&ApprovedCChecker",
    ],
    // required : true
  },

  state: {
    type: String,
    enum: ["InProgress", "WaitForModification", "Completed", "Canceled"],
  },
  role: {
    type: String,
  },
  approvedStatus: {
    type: String,
    // required : true
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
    // required : true
  },
  lastUpdatedOn: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  companyName: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  fileUrl: {
    type: [String],
  },
  designFile: {
    type: [String],
  },
  description: {
    type: String,
  },
  visibility: {
    type: String,
    enum: ["Public", "Private"],
  },
  ratings: {
    type: Number,
    // default: 0
  },
  allocatedDesigner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: false
  },
  allocatedToAllDesigners: {
    type: Boolean,
    default: false
  },
  projectFile: [
    {
      psd: {
        type: String
      },
      psdFileAfterModification: {
        type: String
      },
      samplePhoto: {
        type: String
      },
      sampleTxtFile: {
        type: String
      },
      automatedStatus: {
        type: String
      },
      projectFile: {
        type: String
      },
      createdBy: {
        type: String,
        // required : true
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      dateOfAutomation: {
        type: Date,
      },
      requestCreatedBy: {
        type: String,
      }

    }

  ]
});

module.exports = mongoose.model("Project", projectSchema);