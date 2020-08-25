const express = require('express')
const User = require('./model')
const auth = require('../middleware/auth')
const allowedFields = require('../middleware/allowedFields')

const router = new express.Router()

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

// read authenticated user
router.get('/users/me', auth, (req, res) => {
	res.send(req.user)
})

// read user by id
router.get('/users/:id', async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id })
		if (!user) { return res.status(404).send() }
		res.send(user)
	} catch (e) {
		res.status(500).send()
	}
})

// update authenticated user
router.patch('/users/me', auth,	allowedFields(User.editableFields), async (req, res) => {
		try {
			req.fields.forEach(field => req.user[field] = req.body[field])
			await req.user.save()
			res.send(req.user)
		} catch (e) {
			res.status(400).send(e)
		}
	}
)

// delete authenticated user
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		res.send(req.user)
	} catch (e) {
		res.status(500).send()
	}
})

// login user
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()

		res.send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}
})

// logout authenticated user
router.post('/users/me/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(({ token }) => req.token !== token)
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

// logout all authenticated user instances
router.post('/users/me/logout-all', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

// TODO: read users posts by id

// TODO: read users comments by id

module.exports = router