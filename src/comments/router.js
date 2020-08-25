const express = require('express')
const Comment = require('./model')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/comments', auth, async (req, res) => {
	const comment = Comment({
		author: req.user._id,
		body: req.body.body,
	})

	try {
		comment.vote(req.user._id, 1)
		await comment.save()
		res.status(201).send(comment)
	} catch (e) {
		res.status(500).send(e)
	}
})

router.get('/comments/:id', async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.id })
		if (!comment) { res.status(404).send() }
		res.send(comment)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router