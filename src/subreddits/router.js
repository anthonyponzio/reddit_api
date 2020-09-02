const express = require('express')
const router = new express.Router()
const Subreddit = require('./model')
const auth = require('../middleware/auth')

// create subreddit
router.post('/subreddits', auth, async (req, res) => {
	const subreddit = new Subreddit({
		...req.body,
		owner: req.user._id,
	})

	try {
		await subreddit.save()
		res.status(201).send(subreddit)
	} catch (e) {
		if (e.code === 11000) {
			res.status(400).send({ error: 'Subreddit with that name already exists' })
		} else {
			res.status(400).send(e)
		}
	}
})

// get subreddit by id
router.get('/subreddits/:id', async (req, res) => {
	try {
		const subreddit = await Subreddit.findOne({ _id: req.params.id})
		if (!subreddit) { return res.status(404).send() }
		res.send(subreddit)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router