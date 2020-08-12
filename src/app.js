require('./db/mongoose')
const express = require('express')
const kittensRouter = require('./kittens/router')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(kittensRouter)

app.get('/', (req, res) => {
	res.send('<h1>Hello World</h1>')
})


app.listen(port, () => {
	console.log(`Express running, access app at http://localhost:${port}`)
})