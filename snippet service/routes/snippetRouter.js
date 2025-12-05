const express = require('express')
const validateToken = require('../middlewares/validateToken')
const { updateSnippet, addSnippet, deleteSnippet, getSnippet, getrootsnippets} = require('../controllers/snippetController')

const snippetRouter = express.Router()

snippetRouter.post('/add-snippet/:id', validateToken, addSnippet )
snippetRouter.delete('/delete-snippet/:id', validateToken, deleteSnippet)
snippetRouter.get('/get-snippet/:id', validateToken, getSnippet)
snippetRouter.get('/getrootsnippets', validateToken, getrootsnippets)
snippetRouter.post('/update-snippet/:id' , validateToken , updateSnippet)

module.exports = snippetRouter