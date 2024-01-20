const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const jwt_decode = require("jwt-decode");

const dotenv = require("dotenv"),
  path = require("path");
dotenv.config({ path: path.join(__dirname, "../config./config.env") });

function extractToken(req) {
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
// Protect routes
// Protect routes
exports.protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    console.log(token);
    if (token === "null" || token === null) {
      return next(
        new ErrorResponse("Login first to access this resource.", 401)
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (error) {
    // Handle errors thrown by jwt.verify
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token has expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    } else {
      // Handle other errors
      return next(new ErrorResponse(error.message, 500));
    }
  }
  next();
};


// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

exports.getUserFromToken = async (req, res, next) => {
  try {
    const token = await extractToken(req);
    var decoded = await jwt_decode(token);
    var user = await User.findById(decoded.id)
    req.body.user = user;
  } catch (error) {
    // Handle errors thrown by jwt_decode
    if (error.name === 'InvalidTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    } else {
      // Handle other errors
      return next(new ErrorResponse(error.message, 500));
    }
  }
  next();
}
