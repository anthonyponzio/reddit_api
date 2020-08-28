const express = require('express')
const Comment = require('./model')
const Post = require('../posts/model')
const auth = require('../middleware/auth')

// TODO: should comments be their own route or should comments
// live on the /posts route, ex: /posts/:id/comments
const router = new express.Router()

// create comment
router.post('/comments', auth, async (req, res) => {
	const comment = Comment({
		author: req.user._id,
		body: req.body.body,
		parent: req.body.parent || undefined,
		post_id: req.body.post_id,
	})

	try {
		await comment.vote(req.user._id, 1)
		await comment.save()
		if (comment.parent) {
			// comment is a reply, append to parent comments children
			await Comment.appendChild(comment.parent, comment._id)
		} else {
			// comment is a root level comment, append to posts comments
			await Post.appendComment(req.body.post_id, comment._id)
		}
		res.status(201).send(comment)
	} catch (e) {
		res.status(500).send(e)
	}
})

// read comment by id
// TODO: is there a usecase for single comment reading?
// in the case of comment threads, or permalinking comment threads yes
router.get('/comments/:id', async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.id })
		if (!comment) { return res.status(404).send() }
		res.send(comment)
	} catch (e) {
		res.status(500).send()
	}
})

// vote comment
router.post('/comments/:id/:voteAction', auth, async (req, res) => {
	const allowedActions = ['upvote', 'downvote', 'unvote']
	const { voteAction, id } = req.params
	
	try {
		if (!allowedActions.includes(voteAction)) {
			return res.status(400).send({ error: 'Invalid action' })
		}

		const comment = await Comment.findOne({ _id: id })
		if (!comment) { return res.status(404).send() }
		
		await comment.vote(req.user._id, Comment.voteValues[voteAction])
		await comment.save()

		res.send(comment)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router