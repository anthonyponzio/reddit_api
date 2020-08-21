require('./db/mongoose')
const express = require('express')
const usersRouter = require('./users/router')
const postsRouter = require('./posts/router')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(usersRouter)
app.use(postsRouter)


app.listen(port, () => {
	console.log(`Express running, access app at http://localhost:${port}`)
})