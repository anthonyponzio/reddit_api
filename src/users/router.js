const express = require('express')
const User = require('./model')

const router = new express.Router()

// TODO: create authentication functionality
// - user model should have function to create jwt tokens with the users
//   id saved in them
// - in the middleware the function should check and see if the request
//   has a bearer token attached
//   - if it does decrypt and get the users id, then find a user based on
//     the id and the token

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()

		res.send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}
})

// create user
router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try {
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}
})

// read user
router.get('/users/:id', async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id })
		if (!user) { return res.status(404).send() }
		res.send(user)
	} catch (e) {
		res.status(500).send()
	}
})

// update user
router.patch('/users/:id', async (req, res) => {
	const editableFields = ['password', 'email', 'username']
	const fields = Object.keys(req.body)
	const allFieldsValid = fields.every(field => editableFields.includes(field))

	if (!allFieldsValid) {
		return res.status(400).send({ error: 'Invalid fields' })
	}

	try {
		const user = await User.findOne({ _id: req.params.id })
		
		if (!user) { return res.status(404).send() }
		
		fields.forEach(field => user[field] = req.body[field])
		
		await user.save()
		res.send(user)
	} catch (e) {
		res.status(400).send(e)
	}
})

// delete user
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