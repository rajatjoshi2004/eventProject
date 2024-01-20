const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
//const path = require("path");

dotenv.config();

//user router
const orgRouter = require("./routes/organisation.js");
const eventsRouter = require("./routes/events.js");
const projectRouter = require("./routes/project.js");
const taskRouter = require("./routes/task.js");
const userRouter = require("./routes/user.js");
const authRouter = require("./routes/auth.js");
const formRouter = require("./routes/adduser.js");
const allocatedRouter = require("./routes/allocated.js");
const { addOverDueToTask } = require("./helpers/addOverDueToTask.js");
//const countDataRouter = require("./routes/countdata.js");

const app = express();

if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // app.use(express.static(path.join(_dirname,"./client/build")));
  app.use(express.static("client/build"));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html")); // change as per your index.html
  });
}
if (process.env.NODE_ENV !== "PRODUCTION")
  require("dotenv").config({ path: "server/config/config.env" });

  mongoose.set('strictQuery', false);
  const connectDatabase = () => {
    mongoose
      .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((con) => {
        console.log(
          `MongoDB Database connected with HOST: ${con.connection.host}`
        );
      });
  };
  
  const PORT = process.env.PORT || 5000;
const corsOptions = {
  // origin: ["http://localhost:3000","https://dashboard-dtms.onrender.com"],
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
  connectDatabase();
 
app.use(cookieParser("secret"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors(
     corsOptions
//     //     {
//     //     credentials: true,
//     //     origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
//     //     optionsSuccessStatus: 200,
//     //   }
  )
);
app.use("/organisation", orgRouter);
app.use("/events", eventsRouter);
app.use("/project", projectRouter);
app.use("/task", taskRouter);
app.use("/user", userRouter);
app.use("/adduser", formRouter);
app.use("/auth", authRouter);
app.use("/allocated", allocatedRouter);

//app.use('/data-count', countDataRouter);

// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static(path.join(__dirname, '../client/build')));

//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
//     });
//   }

addOverDueToTask();
app.listen(PORT, () => {
  console.log(`Server  is running on port  ${PORT}`);
});
