const crypto = require("crypto");
var mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const dotenv = require("dotenv"),
  path = require("path");
dotenv.config({ path: path.join(__dirname, "../config./config.env") });

const register = async (req, res, next) => {
  // Check if req.file is undefined
  // if (!req.file) {
  //   return res.status(400).send('Error: photo field is missing or invalid');
  // }

  const { name, phoneNumber, email, password, role, companyName, photo } = req.body;
  console.log("req.body", req.body);
  // console.log("photo", req.file);
  
  var orgId = mongoose.mongo.ObjectId(companyName);

  // const file = req.file;
  // const imageName = file.originalname;
  // console.log("Image Name:", imageName);
  // Create user
  const user = await User.create({
    name,
    phoneNumber,
    email,
    password,
    role,
    photo,
    // photo: file.buffer,
    // imageName: imageName,
    companyName: orgId,
  });

  sendTokenResponse(user, 200, res);
};


const login = async (req, res, next) => {
  // var orgId = mongoose.mongo.ObjectId(req.org.id);
  const { email, password } = req.body;


  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  // console.log("Data", user);
  sendTokenResponse(user, 200, res);
};

const logout = async (req, res, next) => {
  console.log("Logged out successfully");
  res.status(200).json({
    success: true,
    data: {},
  });
};

const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // const user = null;
  // if (user !== null) {
  //   const userId = await User.findById(req.user.id); // This line will not throw an error
  // }
  // res.status(200).json({
  //   success: true,
  //   // token,
  //   data: user,
  // });
  sendTokenResponse(user, 200, res);
};

// const updateDetails = async (req, res, next) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ success: false, message: 'File not provided.' });
//   }
//   const imageName = file.originalname;
//   const fieldsToUpdate = {
//     name: req.body.name,
//     email: req.body.email,
//     phoneNumber: req.body.phoneNumber,
//     photo: file.buffer,
//     imageName: imageName,
//     companyName: orgId
//   };

  
//   console.log('File:', file); // Add this console.log statement
//   console.log('Fields to Update:', fieldsToUpdate); // Add this console.log statement

//   const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
//     new: true,
//     runValidators: true,
//   });

//   console.log('Updated User:', user); // Add this console.log statement
  
//   res.status(200).json({
//     success: true,
//     data: user,
//   });
// };

const updateDetails = async (req, res, next) => {
  // const file = req.file;
  const fieldsToUpdate = {};

  if (req.body.name) {
    fieldsToUpdate.name = req.body.name;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }
  if (req.body.phoneNumber) {
    fieldsToUpdate.phoneNumber = req.body.phoneNumber;
  }
  if (req.body.photo) {
    fieldsToUpdate.photo = req.body.photo;
  }

  // if (file) {
  //   fieldsToUpdate.photo = file.buffer;
  //   fieldsToUpdate.imageName = file.originalname;
  // }

  console.log('Fields to Update:', fieldsToUpdate);

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    // console.log('Updated User:', user);
    // res.status(200).json({
    //   success: true,
    //   token,
    //   data: user
    // });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

const resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// Get token from model, create cookie and send response
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

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.updateDetails = updateDetails;
exports.updatePassword = updatePassword;
