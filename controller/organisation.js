const Org = require("../models/Organisation.js");
const ErrorResponse = require("../utils/errorResponse");

const addOrg = async (req, res, next) => {
  const {
  companyName,
  numberOfBranches,
  numberOfEmployees,
  email1,
  email2,
  companyAddress,
  role,
  fileUrl,
  createdAt
  } = req.body;
  let org;
  console.log(req.body);
  try {
    org = await Org.findOne({companyName});
    console.log(org)
    if (org == null) {
      org = new Org
    
    ({
      companyName,
      numberOfBranches,
      numberOfEmployees,
      email1,
      email2,
      companyAddress,
      fileUrl,
      role,
      createdAt
    });
    await org.save();
    console.log({org})
    }
    

    console.log("Title", req.body);
    // console.log("req.body.user", req.body.userData);
    // console.log("req.user.id", req.user.id);
    // req.body.userData = req.user.id;
    //console.log(req.user);
    
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
    if (!org) {
    return res
      .status(500)
      .json({ message: "Unable To Add Organisation" });
  }
  return res.status(201).json({ org });
};

const getAllOrgs = async (req, res) => {
  let orgs, allRoles;
 
  try {
    orgs = await Org.find();
    // allRoles = await Org.find({ role: "", org: { $eq: orgId }, });
  } catch (err) {
    return res.status(400).json({ err });
  }
  if (!orgs) {
    return res.status(404).json({ message: "No Organisations found" });
  }
  return res.status(200).json({ orgs });
};
const getById = async (req, res) => {
  let org;
  try {
    org = await Org.findById(req.params.id);
  } catch (err) {
    console.log(err);
  }

  if (!org) {
    return res.status(404).json({ message: "No Organisations found" });
  }
  return res.status(200).json({ org });
};

// const updateTask = async (req, res, next) => {
//   const id = req.params.id;
//   const {
//     taskName,
//     description,
//     dueDate,
//     allocatedTo,
//     lastUpdateBy,
//     lastUpdatedOn,
//     state,
//     reportDescription,
//     reportUrl,
//   } = req.body;

//   let task;
//   try {
//     task = await Task.findByIdAndUpdate(
//       id,
//       {
//         taskName,
//         description,
//         dueDate,
//         allocatedTo,
//         lastUpdateBy,
//         lastUpdatedOn,
//         reportDescription,
//         state,
//         reportUrl,
//       },
//       { new: true }
//     );
//     req.body.user = req.user.id;
//     console.log(task);
//     task = await task.save();
//   } catch (err) {
//     console.log(err);
//   }
//   if (!task && req.user.role !== "superadmin") {
//     return res
//       .status(500)
//       .json({ message: "Unauthorized user Unable To Update By this ID" });
//   }
//   return res.status(201).json({ task });
// };

// const deleteTask = async (req, res) => {
//   const id = req.params.id;
//   let task;
//   try {
//     task = await Task.findByIdAndRemove(id);
//   } catch (err) {
//     return res.status(404).json({ message: `Pask Not found` });
//   }
//   return res.status(201).json({ message: "Pask Successfully Deleted" });
// };


exports.addOrg = addOrg;
exports.getAllOrgs = getAllOrgs;
exports.getById = getById;
// exports.updateTask = updateTask;
// exports.deleteTask = deleteTask;

