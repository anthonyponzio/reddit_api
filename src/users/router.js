const express = require('express')
const User = require('./model')

const router = new express.Router()

router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try {
		await user.save()
		res.status(201).send(user)
	} catch (e) {
		res.status(400).send(e)
	}
})

router.get('/users/:id', async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id })
		if (!user) { return res.status(404).send() }
		res.send(user)
	} catch (e) {
		res.status(500).send()
	}
})

router.delete('/users/:id', async(req,res) => {
	try {
		const user = await User.findOneAndDelete({ _id: req.params.id })
		if (!user) { return res.status(404).send() }
		res.send(user)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router