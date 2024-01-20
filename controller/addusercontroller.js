const Form = require("../models/Adduser");
const csv = require("fast-csv");
const fs = require("fs");

const HOSTNAME = "http://localhost:5000";

const getAllForms = async (req, res, next) => {
  let forms;
  try {
    forms = await Form.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export/")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const writableStream = fs.createWriteStream(
      "public/files/export/forms.csv"
    );

    csvStream.pipe(writableStream);

    writableStream.on("finish", function () {
      res.json({
        downloadUrl: `${HOSTNAME}/files/export/forms.csv`,
      });
    });

    if (forms.length > 0) {
      forms.map((form) => {
        csvStream.write({
          Name: form.name ? form.name : "-",
          Position: form.position ? form.position : "-",
          District: form.district ? form.district : "-",
          Village: form.village ? form.village : "-",
        });
      });
    }
    csvStream.end();
    writableStream.end();
  } catch (err) {
    console.log(err);
  }

  if (!forms) {
    return res.status(404).json({ message: "No Forms found" });
  }
  //return res.status(200).json({ forms });
  return;
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  let form;
  try {
    form = await Form.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!form) {
    return res.status(404).json({ message: "No Form found" });
  }
  return res.status(200).json({ form });
};

const addForm = async (req, res, next) => {
  const {
    name,
    nickname,
    qualification,
    position,
    state,
    district,
    village,
    constituencyloksabha,
    constituencyassembly,
    villagenumber,
    email,
    facebook,
    instagram,
    image1,
    image2,
    image3,
    image4,
    uploadFile,
  } = req.body;
  let form;
  try {
    form = new Form({
      name,
      nickname,
      qualification,
      position,
      state,
      district,
      village,
      constituencyloksabha,
      constituencyassembly,
      villagenumber,
      email,
      facebook,
      instagram,
      image1,
      image2,
      image3,
      image4,
      uploadFile,
    });
    await form.save();
  } catch (err) {
    console.log(err);
  }

  if (!form) {
    return res.status(500).json({ message: "Unable To Add" });
  }
  return res.status(201).json({ form });
};

exports.getAllForms = getAllForms;
exports.addForm = addForm;
exports.getById = getById;
