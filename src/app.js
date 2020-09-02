require('./db/mongoose')
const express = require('express')
const usersRouter = require('./users/router')
const subredditsRouter = require('./subreddits/router')
const postsRouter = require('./posts/router')
const commentsRouter = require('./comments/router')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(usersRouter)
app.use(subredditsRouter)
app.use(postsRouter)
app.use(commentsRouter)


app.listen(port, () => {
	console.log(`Express running, access app at http://localhost:${port}`)
})