const express = require('express')
const { executeCode } = require('../controllers/executecontroller')

const executeRouter = express.Router()

executeRouter.post('/execute/:id' , executeCode)

module.exports = executeRouter