const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const formSchema = new  Schema({ 
  name: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true  
  },
  qualification: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  constituencyloksabha: {
    type: String,
    required: true
  },
  constituencyassembly: {
    type: String,
    required: true
  },
  phonenumber: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  facebook: {
    type: String,
    required: true
  },
  instagram: {
    type: String,
    required: true
  },
  image1: {
    type: String,
    required: true
  },
  image2: {
    type: String,
    required: true
  },
  image3: {
    type: String,
    required: true
  },
  image4: {
    type: String,
    required: true
  },
  companyName: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
});

module.exports = mongoose.model("Form", formSchema);


