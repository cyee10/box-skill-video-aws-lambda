// Set up environment variables
require("dotenv").config();
const bodyParser = require('body-parser')
const cors =require("cors")
const prettyjson = require("prettyjson");
const requestLogger = require("morgan");
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const express = require("express");

const VideoAnalyzer = require("./video-analyzer");
const { AzureEventHandler, BoxEvents } = require("./event-handler");
const { FilesReader } = require("./skills-kit-2.0");

// Set up request logger
requestLogger.token("body", (req, res) => {
  return "\n" + prettyjson.render(req.body, { noColor: true });
});

// Set up Express
const app = express();
// app.set("trust proxy", process.env.PROXY == "true");
app.use(cors())
app.use(bodyParser.json())
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({ extended: false }));
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(
  requestLogger(":method :remote-addr :date[clf] :body", { immediate: true })
);

// Handle requests
app.all("/", AzureEventHandler, async (req, res) => {
  if (BoxEvents.isSkillInvocationEvent(req.body))
    res.status(200).send("Unrecognized request");

  let filesReader = new FilesReader(req.body);
  let videoAnalyzer = new VideoAnalyzer(filesReader.getFileContext());
  await videoAnalyzer.init();
  await videoAnalyzer.createJob();
  res.status(200).send("Event request processed");
});


module.exports = app;
