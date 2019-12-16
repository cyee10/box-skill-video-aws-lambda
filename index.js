'use strict';

const awsServerlessExpress = require('aws-serverless-express')
const app = require("./app")
const server = awsServerlessExpress.createServer(app)
const { AzureEventHandler, BoxEvents } = require("./event-handler");

module.exports.handler = (event, context,callback) => {
  awsServerlessExpress.proxy(server,event,context)
}