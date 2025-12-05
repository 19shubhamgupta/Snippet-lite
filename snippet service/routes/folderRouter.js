const express = require('express')
const { addFolder, deleteFolder } = require('../controllers/folderControllers')
const validateToken = require('../middlewares/validateToken')

const folderRouter = express.Router()

folderRouter.post('/add-folder/:id', validateToken, addFolder )
folderRouter.delete('/delete-folder/:id', validateToken, deleteFolder)

module.exports = folderRouter  