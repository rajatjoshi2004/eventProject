const express = require("express");
const app = express();
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const src = path.join(__dirname, "views");
app.use(express.static(src));
var uuid = require("uuid-random");

let projectId = " project-dashboard-386806  "; // Get this from Google Cloud
let keyFilename = path.join(__dirname, "../google-cloud-stroage-key.json"); // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
  
const bucket = storage.bucket("dash1-files"); // Get this from Google Cloud -> Storage

async function setBucketCorsConfiguration() {
  await bucket.setCorsConfiguration([
    {
      origin: ['*'],
      responseHeader: ['Content-Type'],
      method: ['GET', 'POST'],
      maxAgeSeconds: 3600,
    },
  ]);

  console.log(`CORS configuration set for bucket ${bucket.name}`);
}

setBucketCorsConfiguration();


const upload = (req, res) => {
  try {
    if (req.files) {
      console.log(req.files);
      console.log("Files found, trying to upload...");
      const urls = [];
      req.files.forEach((file) => {
        const randomUuid = uuid();
        let extension;
        switch (file.mimetype) {
          case "image/jpeg":
            extension = ".jpeg";
            break;
          case "image/png":
            extension = ".png";
            break;
          case "application/pdf":
            extension = ".pdf";
            break;
          default:
            throw new Error(`Unsupported file type: ${file.mimetype}`);
        }
        const randomName = `${randomUuid}_project${extension}`;
        const blob = bucket.file(randomName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });
        blobStream.on("finish", () => {
          const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          urls.push(url);
          if (urls.length === req.files.length) {
            res.status(200).json({ urls });
          }
        });
        blobStream.end(file.buffer);
      });
    } else throw "error with img";
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
exports.upload = upload;
