const express = require('express')
const router = new express.Router()
const Subreddit = require('./model')
const auth = require('../middleware/auth')

// create subreddit
router.post('/subreddits', auth, async (req, res) => {
	const { user } = req
	const subreddit = new Subreddit({...req.body, owner: user._id })

	try {
		await subreddit.save()
		await subreddit.joinSubreddit(user._id)
		await user.joinSubreddit(subreddit._id)
		res.status(201).send(subreddit)
	} catch (e) {
		if (e.code === 11000) {
			res.status(400).send({ error: 'Subreddit with that name already exists' })
		} else {
			res.status(400).send(e)
		}
	}
})

// get authenticated user subreddits
router.get('/subreddits/me', auth, async (req, res) => {
	try {
		await req.user.populate('subreddits', 'name').execPopulate()
		res.send(req.user.subreddits)
	} catch (e) {
		res.status(500).send()
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

// join subreddit
router.post('/subreddits/:id/join', auth, async (req, res) => {
	try {
		const { user } = req
		const subreddit = await Subreddit.findOne({ _id: req.params.id })
		if (!subreddit) { return res.status(404).send() }

		await subreddit.joinSubreddit(user._id)
		await req.user.joinSubreddit(subreddit._id)
		res.send()
	} catch (e) {
		res.status(500).send(e)
	}
})

module.exports = router