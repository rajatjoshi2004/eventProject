const User = require("../models/User.js");
const Org = require("../models/Organisation.js");
const ErrorResponse = require("../utils/errorResponse");
var mongoose = require("mongoose");
const jwt_decode = require("jwt-decode");
const addUser = async (req, res, next) => {
  // if (!req.file) {
  //   return res.status(400).send('Error: photo field is missing or invalid');
  // }
  const { name, phoneNumber, email, password, role, companyName, photo } = req.body;
  let user;
  console.log(req.body);
  // console.log("Image Name:", imageName);
  // console.log("photo", file);
  try {
    var orgId = mongoose.mongo.ObjectId(companyName);
    console.log("orgId", orgId)
    // const file = req.file;
    // const imageName = file.originalname;
    user = new User({
      name,
      phoneNumber,
      email,
      password,
      role,
      photo,
      // photo: file.buffer,
      // imageName: imageName,
      companyName: orgId
    });
    await user.save();
    sendTokenResponse(user, 200, res);
    // console.log("userData", user);
    // console.log("req.org.id", req.org.id);
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.status(404).json({ message: "Unable to Add User" });
  }
  return res.status(200).json({ user });
};
const getAllUsers = async (req, res) => {
  let users, userCount, allDesigners, designers, inkDesigners, freelancerDesigners, countD, countU;

  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  const startOfNextMonth = new Date();
  startOfNextMonth.setDate(1);
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

  console.log("getAllUsers loggedin user", req.body.user.companyName);

  const orgId = req.body.user.companyName;

  // const user = await User.find();
  try {
    countD = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfCurrentMonth,
            $lte: startOfNextMonth
          },
          role: 'designers',
          companyName: { $eq: orgId },
        }
      },
      {
        $group: {
          // _id: {$month: '$createdAt'},
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]).exec();
    // console.log('Number of designers', countD);
    // console.log(startOfCurrentMonth);
    // console.log(startOfNextMonth);
    designers = await User.find({
      role: 'designers',
      companyName: { $eq: orgId },
    }).populate({ path: 'companyName', select: 'companyName' });
    // console.log({designers})
    const nameOfCompany = 'Freelancer'; // replace with the actual company name
    const companyname = await Org.findOne({ companyName: nameOfCompany });
    // console.log(company);
    if (companyname) {
      freelancerDesigners = await User.find({
        role: 'designers',
        companyName: companyname._id,
      }).populate({ path: 'companyName', select: 'companyName' });
      // console.log({inkDesigners});
    } else {
      console.log('Company not found');
    }

    // console.log({freelancerDesigners})

    const companyName = 'Inkpen'; // replace with the actual company name
    const company = await Org.findOne({ companyName: companyName });
    // console.log(company);
    if (company) {
      inkDesigners = await User.find({
        role: 'designers',
        companyName: company._id,
      }).populate({ path: 'companyName', select: 'companyName' });
      // console.log({inkDesigners});
    } else {
      console.log('Company not found');
    }
    //console.log({inkDesigners})
    allDesigners = designers.concat(freelancerDesigners, inkDesigners);

    // console.log({allDesigners})

    userCount = await User.countDocuments({
      createdAt: {
        $gte: startOfCurrentMonth,
        $lt: startOfNextMonth
      },
      companyName: { $eq: orgId },
    });
    // console.log('Total of users', userCount);
    // console.log(startOfCurrentMonth);
    // console.log(startOfNextMonth);
    users = await User.find({ companyName: { $eq: orgId } });
    // console.log(users)
    countU = await User.countDocuments({ companyName: { $eq: orgId } });
    //console.log(`Number of users : ${countU}`);
  } catch (err) {
    console.log(err);
  }
  if (!users) {
    return res.status(404).json({ message: "No Users found" });
  }
  return res.status(200).json({ users, wholeDesigners: allDesigners, designersCount: countD, newCount: userCount, allInkpenDesigners: inkDesigners, allFreelancerDesigners: freelancerDesigners, allDesigners: designers });
};

const getById = async (req, res) => {
  let user;
  try {
    user = await User.findById(req.params.id);
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.status(404).json({ message: "No User found" });
  }
  return res.status(200).json({ user });
};

const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const { name, email, role } = req.body;

  let user;
  try {
    // const file = req.file;
    // const imageName = file.originalname;
    user = await User.findByIdAndUpdate(
      id,
      {
        name, 
        // phoneNumber, 
        email, 
        // password, 
        role, 
        // photo: file.buffer,
        // imageName: imageName,
      },
      { new: true }
    );

    user = await user.save();
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.status(404).json({ message: "Unable To Update By this ID" });
  }
  return res.status(200).json({ user });
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findByIdAndRemove(id);
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.status(404).json({ message: "Unable To Delete By this ID" });
  }
  return res.status(200).json({ message: "User Successfully Deleted" });
};

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  console.log("token", token);

  res.status(statusCode).json({
    success: true,
    secure: true,
    signed: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      photo: user.photo,
      phoneNumber: user.phoneNumber,
      imageName: user.imageName,
      createdAt: user.createdAt,
      companyName: user.companyName,
    },
  });
};

async function extractToken(req) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
}

const currentUser = async (req, res) => {
  try {
    const token = await extractToken(req);
    var decoded = await jwt_decode(token);
    var user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "Access!" });
    }
  } catch (error) {
    return res.status(400).json({ message: "You are not authorized!" });
  }
  return res.status(200).send(user);
};

const getUsersBasedOnRole = async (req, res) => {
  let users;
  const userRole = req.user.role;
  const currentUserId = req.user._id;
  try {
    if (userRole === "superadmin") {
      users = await User.find({
        _id: { $ne: currentUserId },
        role: { $nin: ["superadmin"] },
      }).select("-password");
    }
    if (userRole === "admin") {
      users = await User.find({
        _id: { $ne: currentUserId },
        role: { $nin: ["superadmin", "admin"] },
      }).select("-password");
    }

    if (userRole === "statelevel") {
      users = await User.find({
        _id: { $ne: currentUserId },
        role: { $nin: ["superadmin", "admin", "statelevel"] },
      }).select("-password");
    }

    if (userRole === "districtlevel") {
      users = await User.find({
        _id: { $ne: currentUserId },
        role: { $nin: ["superadmin", "admin", "statelevel", "districtlevel"] },
      }).select("-password");
    }

    if (userRole === "localarea" || userRole === "user") {
      users = await User.find({
        _id: { $ne: currentUserId },
        role: {
          $eq: "user",
        },
      }).select("-password");
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
  if (!users) {
    return res.status(404).json({ message: "No Users found" });
  }
  return res.status(200).json({ users });
};

// exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email
//     }

//     // Update avatar
//     if (req.body.avatar !== '') {
//         const user = await User.findById(req.user.id)

//         const image_id = user.avatar.public_id;
//         const res = await cloudinary.v2.uploader.destroy(image_id);

//         const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
//             folder: 'avatars',
//             width: 150,
//             crop: "scale"
//         })

//         newUserData.avatar = {
//             public_id: result.public_id,
//             url: result.secure_url
//         }
//     }


exports.addUser = addUser;
exports.getAllUsers = getAllUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.sendTokenResponse = sendTokenResponse;
exports.currentUser = currentUser;
exports.getUsersBasedOnRole = getUsersBasedOnRole;