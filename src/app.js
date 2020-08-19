require('./db/mongoose')
const express = require('express')
const kittensRouter = require('./kittens/router')
const usersRouter = require('./users/router')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(kittensRouter)
app.use(usersRouter)


app.listen(port, () => {
	console.log(`Express running, access app at http://localhost:${port}`)
})