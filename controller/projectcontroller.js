const Project = require("../models/Project.js");
const User = require("../models/User.js");
var mongoose = require("mongoose");

const addProject = async (req, res, next) => {
  const {
    title,
    projectDescription,
    sampleImage,
    dueDate1,
    dueDate2,
    compulsoryWordings,
    primaryColor,
    secondaryColor,
    size,
    leaderPhoto,
    compulsoryPhoto,
    approvedStatus,
    createdBy,
    createdAt,
    fileUrl,
    designFile,
    description,
    visibility,
    allocatedDesigner,
    ratings
  } = req.body;

  // Change the format of dueDate1 and dueDate2
  const [day1, month1, year1] = dueDate1.split("/");
  const formattedDueDate1 = `${year1}-${month1}-${day1}`;

  const [day2, month2, year2] = dueDate2.split("/");
  const formattedDueDate2 = `${year2}-${month2}-${day2}`;

  let project;
  let allocatedDesignerId;
  if (allocatedDesigner) {
    allocatedDesignerId = mongoose.Types.ObjectId(allocatedDesigner);
  }
  try {
    var orgId = mongoose.mongo.ObjectId(req.user.companyName);
    var userId = mongoose.mongo.ObjectId(req.user.id);
    var userRole = req.user.role;

    project = new Project({
      title,
      projectDescription,
      sampleImage,
      dueDate1: formattedDueDate1, // Use the formatted date string
      dueDate2: formattedDueDate2, // Use the formatted date string
      compulsoryWordings,
      primaryColor,
      secondaryColor,
      size,
      leaderPhoto,
      compulsoryPhoto,
      user: userId,
      state: "InProgress",
      status: "Created",
      approvedStatus,
      createdAt,
      fileUrl,
      designFile,
      description,
      visibility,
      allocatedDesigner: allocatedDesignerId,
      allocatedToAllDesigners: true,
      ratings,
      companyName: orgId,
      role: userRole
    });

    console.log("Title", req.body);
    console.log("req.user.id", req.user.id);
    req.body.userData = req.user.id;
    console.log(req.user);
    await project.save();
  } catch (err) {
    console.log(err);
  }
  if (!project) {
    return res
      .status(500)
      .json({ message: "Unauthorized user Unable To Add Project" });
  }
  return res.status(201).json({ project });
};

const getAllProjects = async (req, res) => {
  let result, activeResult, inProgressProjects, completedProjectsList, projects, completed, canceled, count, onGoing, overDue, countU, countD, countC;
  let { state } = req.query;
  var userId = mongoose.mongo.ObjectId(req.user.id);
  const orgId = req.body.user.companyName;

  const user = await User.findById(userId);
  const userRole = user?.role;

  console.log({ state });

  // let completedProjectsList = [];

  if (!!state) {
    if (req.user.role === "user") {
      if (state === "Self") {
        // Query for private projects created by the user
        const privateProjects = await Project.find({
          companyName: { $eq: orgId },
          user: req.user._id,
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });

        // Query for public projects created by any user in the company
        const publicProjects = await Project.find({
          companyName: { $eq: orgId },
          visibility: "Public", // Use the correct case for "public" visibility
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });

        // Merge private and public projects
        const projects = privateProjects.concat(publicProjects);

        return res.status(200).json({ projects });
      } else {
        projects = await Project.find({
          companyName: { $eq: orgId },
          state: { $in: [state] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      }
      return res.status(200).json({ projects });
    } else if (req.user.role === "designchecker") {
      // ... (existing code for designchecker)
      if (state === "Self") {
        projects = await Project.find({
          companyName: { $eq: orgId },
          status: {
            $in: ["ApprovedDChecker"],
          },
          approvedBy: { $in: [req.user._id] },
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else if (state === "Completed") {
        projects = await Project.find({
          companyName: { $eq: orgId },
          state: { $in: [state] },
          approvedBy: { $in: [req.user._id] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else {
        projects = await Project.find({
          companyName: { $eq: orgId },
          status: {
            $in: ["SubmittedDesigner", "ApprovedPChecker", "ProcessCheckers", "ApprovedCreator", "Created"],
          },
          state: { $in: [state] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      }
      return res.status(200).json({ projects });
    } else if (req.user.role === "designers") {
      if (state === "Self") {
        // Query for private projects allocated to the designer
        const privateProjects = await Project.find({
          allocatedDesigner: req.user._id,
          status: {
            $in: ["SubmittedDesigner", "ProcessCheckers"],
          },
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });

        // Query for public projects
        const publicProjects = await Project.find({
          visibility: "Public", // Use the correct case for "public" visibility
          allocatedDesigner: req.user._id,
          status: {
            $in: ["SubmittedDesigner", "ProcessCheckers"],
          },
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });

        // Merge private and public projects
        const projects = privateProjects.concat(publicProjects);

        return res.status(200).json({ projects });
      } else if (state === "Completed") {
        projects = await Project.find({
          allocatedDesigner: req.user._id,
          state: { $in: [state] },
          approvedBy: { $in: [req.user._id] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else if (state === "Canceled") {
        projects = await Project.find({
          // companyName: { $eq: orgId },
          allocatedDesigner: req.user._id,
          state: { $in: [state] },
          // approvedBy: { $in: [req.user._id] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else {
        projects = await Project.find({
          $or: [
            {
              $or: [
                { allocatedDesigner: req.user._id },
                { allocatedToAllDesigners: true }
              ],
              status: {
                $in: ["Created", "ApprovedCreator", "ApprovedPChecker", "ApprovedDChecker"],
              },
              state: { $in: [state] },
            },
            // {
            //   visibility: "Public", // Use the correct case for "public" visibility
            //   status: {
            //     $in: ["Created", "ApprovedCreator", "ApprovedPChecker", "ApprovedDChecker"],
            //   },
            //   state: { $nin: ["Canceled", "Completed"] },
            // },
          ],
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      }
      return res.status(200).json({ projects });
    } else if (req.user.role === "proofchecker") {
      // ... (existing code for proofchecker)
      if (state === "Self") {
        projects = await Project.find({
          companyName: { $eq: orgId },
          status: {
            $in: ["ApprovedPChecker"],
          },
          approvedBy: { $in: [req.user._id] },
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else if (state === "Completed") {
        projects = await Project.find({
          companyName: { $eq: orgId },
          state: { $in: [state] },
          approvedBy: { $in: [req.user._id] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
        // console.log(projects);
      } else {
        projects = await Project.find({
          companyName: { $eq: orgId },
          status: {
            $in: ["ProcessCheckers", "SubmittedDesigner", "ApprovedDChecker", "ApprovedCreator", "Created"],
          },
          // status: { $nin: ["ProcessDesigner", "ApprovedPChecker", "ApprovedDChecker&ApprovedCChecker"] },
          state: { $in: [state] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      }
      return res.status(200).json({ projects });
    } else {
      if (state === "Self") {
        projects = await Project.find({
          companyName: { $eq: orgId },
          user: req.user._id,
          state: { $nin: ["Canceled", "Completed"] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      } else {
        projects = await Project.find({
          companyName: { $eq: orgId },
          state: { $in: [state] },
        }).populate({ path: 'allocatedDesigner', select: 'name' });
      }
      return res.status(200).json({ projects });
    }

  }

  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  const startOfNextMonth = new Date();
  startOfNextMonth.setDate(1);
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

  const project = Project;
  try {
    result = await project.aggregate([
      {
        $match: {
          state: "Completed",
          companyName: { $eq: orgId },
        },
      },
      {
        $group: {
          _id: { $month: "$lastUpdatedOn" },
          count: { $sum: 1 },
        },
      },
    ]);
    //console.log(result);
    activeResult = await project.aggregate([
      {
        $match: {
          state: "InProgress",
          companyName: { $eq: orgId },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);
    // console.log(activeResult);
    projects = await Project.find({ companyName: { $eq: orgId } }).populate({ path: 'allocatedDesigner', select: 'name' });
    // console.log(projects);
    completed = await project
      .aggregate([
        {
          $match: {
            lastUpdatedOn: {
              $gte: startOfCurrentMonth,
              $lte: startOfNextMonth,
            },
            state: "Completed",
            companyName: { $eq: orgId },
          },
        },
        {
          $group: {
            // _id: {$month: '$createdAt'},
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    if (completed.length === 0) {
      completed = [{ _id: null, count: 0 }];
    }
    // console.log(`Number of Completed Projects ${JSON.stringify(completed)}`);
    onGoing = await project
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfCurrentMonth,
              $lte: startOfNextMonth,
            },
            state: "InProgress",
            companyName: { $eq: orgId },
          },
        },
        {
          $group: {
            // _id: {$month: '$createdAt'},
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    if (onGoing.length === 0) {
      onGoing = [{ _id: null, count: 0 }];
    }
    // console.log(`Number of Ongoing Projects ${JSON.stringify(onGoing)}`);
    overDue = await project
      .aggregate([
        {
          $match: {
            dueDate2: {
              $gte: startOfCurrentMonth,
              $lte: startOfNextMonth,
            },
            state: "Overdue",
            companyName: { $eq: orgId },
          },
        },
        {
          $group: {
            // _id: {$month: '$createdAt'},
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    if (overDue.length === 0) {
      overDue = [{ _id: null, count: 0 }];
    }
    //console.log(`Number of Overdue Projects ${JSON.stringify(overDue)}`);

    // console.log(startOfCurrentMonth);
    // console.log(startOfNextMonth);
    canceled = await project
      .aggregate([
        {
          $match: {
            lastUpdatedOn: {
              $gte: startOfCurrentMonth,
              $lte: startOfNextMonth,
            },
            state: "Canceled",
            companyName: { $eq: orgId },
          },
        },
        {
          $group: {
            // _id: {$month: '$createdAt'},
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    if (canceled.length === 0) {
      canceled = [{ _id: null, count: 0 }];
    }
    //console.log(`Number of Canceled Projects ${JSON.stringify(canceled)}`);
    // console.log(startOfCurrentMonth);
    // console.log(startOfNextMonth);
    inProgressProjects = await Project.find({ state: "InProgress", companyName: { $eq: orgId } });
    //console.log(inProgressProjects);

    // console.log("User role:", req.user.role);
    // console.log("Organization ID:", orgId);
    // console.log("Query for role", req.user.role);
    if (req.user.role === 'user') {
      // console.log("Query for role", req.user.role);
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: "user"
      }).populate({ path: 'allocatedDesigner', select: 'name' });

      // console.log("completedProjectsList", completedProjectsList);
    } else if (req.user.role === 'localarea') {
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: { $in: ['localarea', 'user'] }
      }).populate({ path: 'allocatedDesigner', select: 'name' });
    } else if (req.user.role === 'districtlevel') {
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: { $in: ['districtlevel', 'localarea', 'user'] }
      }).populate({ path: 'allocatedDesigner', select: 'name' });
    } else if (req.user.role === 'statelevel') {
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: { $in: ['statelevel', 'districtlevel', 'localarea', 'user'] }
      }).populate({ path: 'allocatedDesigner', select: 'name' });
    } else if (req.user.role === 'admin') {
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: { $in: ['admin', 'statelevel', 'districtlevel', 'localarea', 'user'] }
      }).populate({ path: 'allocatedDesigner', select: 'name' });
    } else if (req.user.role === 'superadmin') {
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId },
        role: { $in: ['superadmin', 'admin', 'statelevel', 'districtlevel', 'localarea', 'user'] },
      }).populate({ path: 'allocatedDesigner', select: 'name' });
      // console.log("completedProjectsList", completedProjectsList);
    } else {
      // Handle the case where the user role is not recognized or do something else as needed.
      completedProjectsList = await Project.find({
        state: "Completed",
        companyName: { $eq: orgId }
      }).populate({ path: 'allocatedDesigner', select: 'name' });
      // console.log("completedProjectsList", completedProjectsList);
    }

    count = await Project.countDocuments({ state: "Completed", companyName: { $eq: orgId } });
    //console.log(`Number of Project Completed: ${count}`);
    countU = await Project.countDocuments({ state: "InProgress", companyName: { $eq: orgId } });
    //console.log(`Number of Active Project : ${countU}`);
    countD = await Project.countDocuments({ state: "Overdue", companyName: { $eq: orgId } });
    //console.log(`Number of Project OverDue : ${countD}`);
    countC = await Project.countDocuments({ state: "Canceled", companyName: { $eq: orgId } });
    //console.log(`Number of Project Canceled : ${countC}`);
  } catch (err) {
    console.log(err);
  }

  if (!projects) {
    return res.status(404).json({ message: "No Projects found" });
  }

  return res.status(200)
    .json({
      countByMonth: result,
      countByActive: activeResult,
      inProgressProjects,
      completedList: completedProjectsList,
      projects,
      completedProjects: completed,
      onGoingProjects: onGoing,
      overdueProjects: overDue,
      canceledProjects: canceled,
      completed: count,
      totalActive: countU,
      projectOverdue: countD,
      canceledProject: countC,
    });
};


const getById = async (req, res) => {
  let project;
  try {
    project = await Project.findById(req.params.id).populate({ path: 'allocatedDesigner', select: 'name' });;
  } catch (err) {
    console.log(err);
  }

  if (!project) {
    return res.status(404).json({ message: "No Projects found" });
  }
  return res.status(200).json({ project });
};

const updateProject = async (req, res, next) => {
  const id = req.params.id;
  const {
    title,
    projectDescription,
    sampleImage,
    dueDate1,
    dueDate2,
    compulsoryWordings,
    primaryColor,
    secondaryColor,
    size,
    leaderPhoto,
    compulsoryPhoto,
    status,
    allotedFile,
    approvedStatus,
    lastUpdateBy,
    lastUpdatedOn,
    designFile,
    description,
    visibility,
    allocatedDesigner

  } = req.body;

  let project;
  try {
    project = await Project.findByIdAndUpdate(
      id,
      {
        title,
        projectDescription,
        sampleImage,
        dueDate1,
        dueDate2,
        compulsoryWordings,
        primaryColor,
        secondaryColor,
        size,
        leaderPhoto,
        compulsoryPhoto,
        status,
        allotedFile,
        approvedStatus,
        lastUpdateBy,
        lastUpdatedOn,
        designFile,
        description,
        visibility,
        allocatedDesigner

      },
      { new: true }
    );
    req.body.user = req.user.id;
    console.log(project);
    project = await project.save();
  } catch (err) {
    console.log(err);
  }
  if (!project && req.user.role !== "superadmin") {
    return res
      .status(500)
      .json({ message: "Unauthorized user Unable To Update By this ID" });
  }
  return res.status(201).json({ project });
};

const cancelProject = async (req, res) => {
  const id = req.params.id;
  try {
    project = await Project.findByIdAndUpdate(id, {
      state: "Canceled",
    });
  } catch (err) {
    return res.status(404).json({ message: `Project Not found` });
  }
  return res.status(201).json({ message: "Project Successfully Canceled" });
};

const deleteProject = async (req, res) => {
  const id = req.params.id;
  let project;
  try {
    project = await Project.findByIdAndRemove(id);
  } catch (err) {
    return res.status(404).json({ message: `Project Not found` });
  }
  return res.status(201).json({ message: "Project Successfully Deleted" });
};

const createAllotedFile = async (req, res, next) => {
  const _id = req.params._id;
  const { designerName } = req.body;
  const allotedFile = {
    designerName,
  };

  const project = await Project.findById(projectId);

  console.log(project.allotedFile);

  /* if (isAlloted) {
      project.allotedFiles.forEach(allotedFile => {
          if (allotedFile.user.toString() === req.user._id.toString()) {
              allotedFile.designerName = designerName;
              
          }
      })

  } else {
      project.allotedFiles.push(allotedFile);
      project.numOfAllotedFiles = project.allotedFiles.length
  }*/
  await project.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

const getAllAllotedFiles = async (req, res) => {
  let allotedfiles;
  try {
    allotedfiles = await AllotedFile.find();
  } catch (err) {
    console.log(err);
  }

  if (!allotedfiles) {
    return res.status(404).json({ message: "No Alloted Files found" });
  }
  return res.status(200).json({ allotedfiles });
};

const updateProjectFile = async (req, res) => {
  const id = req.params.id;
  const { projectFile } = req.body;

  try {
    // Update the projectFile field in the Project document
    const updatedProject = await Project.findByIdAndUpdate(id, { projectFile });

    // Handle role-specific logic (not related to the current issue)

    return res.status(200).json({ msg: "successfully updated", project: updatedProject });
  } catch (err) {
    // Log the error to the console for debugging
    console.log(err);
    return res.status(400).json({ err });
  }
};

const updateFieldForSubmitting = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user._id;
  const designFile = req.body.designFile;

  // const orgId = req.body.user.companyName;
  try {

    if (req.user.role === "designers") {
      const lastUpdatedOn = new Date();
      await Project.findByIdAndUpdate(id, {
        // companyName: { $eq: orgId },
        status: "SubmittedDesigner",
        state: "WaitForModification",
        designFile: designFile,
        lastUpdatedOn,
        $addToSet: {
          approvedBy: currentUserId,
        },
      });
    }
    console.log({ designFile });
    if (req.user.role === "user") {
      const lastUpdatedOn = new Date();
      const project = await Project.findById(id);
      if (project.status === "ApprovedPChecker" || project.status === "ApprovedDChecker") {
        await Project.findByIdAndUpdate(id, {
          state: "InProgress",
          lastUpdatedOn,
          // designFile: designFile,
        });
        // console.log(designFile);
      } else if (project.status === "SubmittedDesigner") {
        // console.log({ id, state: "InProgress", status: "ApprovedCreator", designFile });
        await Project.findByIdAndUpdate(id, {
          state: "InProgress",
          status: "ApprovedCreator",
          lastUpdatedOn,
          // designFile: designFile,
        });
        // console.log(designFile);
      } else {
        // console.log({ id, state: "InProgress", status: "ApprovedCreator", designFile });
        await Project.findByIdAndUpdate(id, {
          state: "InProgress",
          status: "ApprovedCreator",
          lastUpdatedOn,
          // designFile: designFile,
        });
        // console.log(designFile);
      }
    }

    if (req.user.role === "proofchecker") {
      const lastUpdatedOn = new Date();
      const project = await Project.findById(id);
      if (project.status == "ApprovedDChecker") {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ApprovedDChecker&ApprovedCChecker",
          state: "Completed",
          lastUpdatedOn,
          // designFile: designFile,
          $addToSet: {
            approvedBy: currentUserId,
          },
        });
        // console.log(designFile);
      } else {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ApprovedPChecker",
          state: "InProgress",
          lastUpdatedOn,
          // designFile: designFile,
          $addToSet: {
            approvedBy: currentUserId,
          },
        });
        // console.log(designFile);
      }
    }
    if (req.user.role === "designchecker") {
      const lastUpdatedOn = new Date();
      const project = await Project.findById(id);
      if (project.status == "ApprovedPChecker") {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ApprovedDChecker&ApprovedCChecker",
          state: "Completed",
          lastUpdatedOn,
          // designFile: designFile,
          $addToSet: {
            approvedBy: currentUserId,
          },
        });
        // console.log(designFile);
      } else {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ApprovedDChecker",
          state: "InProgress",
          lastUpdatedOn,
          // designFile: designFile,
          $addToSet: {
            approvedBy: currentUserId,
          },
        });
        // console.log(designFile);
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
  return res.status(200).json({ msg: "successfully updated", designFile });
};

const askForModification = async (req, res) => {
  const id = req.params.id;
  // const orgId = req.body.user.companyName;
  try {
    if (req.user.role === "user") {
      const lastUpdatedOn = new Date();
      await Project.findByIdAndUpdate(id, {
        // companyName: { $eq: orgId },
        status: "ProcessDesigner",
        state: "InProgress",
        description: req.body.description,
        lastUpdatedOn
      });
    }
    console.log(req.body.description);
    if (req.user.role === "proofchecker") {
      const project = await Project.findById(id);
      const lastUpdatedOn = new Date();
      if (project.status === "ApprovedDChecker") {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          state: "WaitForModification",
          description: req.body.description,
          lastUpdatedOn
        });
        console.log(req.body.description);
      } else {
        console.log("hebe");
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ProcessCheckers",
          state: "WaitForModification",
          description: req.body.description,
          lastUpdatedOn
        });
      }
      console.log(req.body.description);
    }
    if (req.user.role === "designchecker") {
      const project = await Project.findById(id);
      const lastUpdatedOn = new Date();
      if (project.status === "ApprovedPChecker") {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          state: "WaitForModification",
          description: req.body.description,
          lastUpdatedOn,
        });
        console.log(req.body);
      } else {
        await Project.findByIdAndUpdate(id, {
          // companyName: { $eq: orgId },
          status: "ProcessCheckers",
          state: "WaitForModification",
          description: req.body.description,
          lastUpdatedOn,
        });
        console.log(req.body);
      }
    }
  } catch (err) {
    return res.status(400).json({ err });
  }
  return res.status(200).json({ msg: "successfully updated" });
};

const submitRating = async (req, res) => {
  const id = req.params.id;
  const ratings = req.body.ratings;
  let project;
  try {
    project = await Project.findByIdAndUpdate(
      id,
      { ratings: ratings },
      { new: true }
    ).populate('allocatedDesigner');

    // console.log({ ratings });

    const allocatedDesignerId = project.allocatedDesigner._id;
    // console.log({ allocatedDesignerId });

    const user = await User.findById(allocatedDesignerId);

    // Calculate the average rating
    // const designerRatings = user.ratings || 0;
    // const totalRating = designerRatings + ratings;
    // const designerProjects = user.projects || [];
    // const averageRating = totalRating / (designerProjects.length + 1);
    const designerRatings = user.ratings || [];
    designerRatings.push(ratings);
    const totalRating = designerRatings.reduce((a, b) => a + b, 0);
    const averageRating = totalRating / designerRatings.length;
    // console.log({ averageRating })
    // console.log({ designerRatings: designerRatings });

    // Update the designer's average rating in the user model
    user.ratings = averageRating;
    await user.save();

    if (!project.allocatedDesigner) {
      console.log('allocatedDesigner is undefined');
      return;
    }

    // console.log({ designer })

    return res.status(200).json({
      msg: "Successfully submitted ratings",
      ratings,
      averageRating

    });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
};




exports.addProject = addProject;
exports.getAllProjects = getAllProjects;
exports.getById = getById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.createAllotedFile = createAllotedFile;
exports.getAllAllotedFiles = getAllAllotedFiles;
exports.updateFieldForSubmitting = updateFieldForSubmitting;
exports.askForModification = askForModification;
exports.cancelProject = cancelProject;
exports.submitRating = submitRating;
exports.updateProjectFile = updateProjectFile;