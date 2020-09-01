const express = require('express')
const Comment = require('./model')
const Post = require('../posts/model')
const auth = require('../middleware/auth')
const allowedFields = require('../middleware/allowedFields')

// TODO: should comments be their own route or should comments
// live on the /posts route, ex: /posts/:id/comments
const router = new express.Router()

// create comment
router.post('/comments', auth, async (req, res) => {
	const comment = Comment({
		author: req.user._id,
		body: req.body.body,
		parent: req.body.parent,
		post_id: req.body.post_id,
	})

	try {
		await comment.vote(req.user._id, 1)
		await comment.save()
		res.status(201).send(comment)
	} catch (e) {
		res.status(500).send(e)
	}
})

router.get('/comments/me', auth, async (req, res) => {
	try {
		await req.user.populate('comments').execPopulate()
		res.send(req.user.comments)
	} catch (e) {
		res.status(500).send()
	}
})

// read comment by id
// TODO: is there a usecase for single comment reading?
// in the case of comment threads, or permalinking comment threads yes
router.get('/comments/:id', async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.id })
		if (!comment) { return res.status(404).send() }
		// TODO: do comments need child_count?
		// await comment.populate('child_count').execPopulate()
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

// update comment
router.patch('/comments/:id', auth, allowedFields(Comment.editableFields), async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.id, author: req.user._id })
		if (!comment) { return res.status(404).send() }
		
		req.fields.forEach(field => comment[field] = req.body[field])
		await comment.save()

		res.send(comment)
	} catch (e) {
		res.status(500).send()
	}
})

// delete comment
router.delete('/comments/:id', auth, async (req, res) => {
	try {
		const comment = await Comment.findOne({ _id: req.params.id, author: req.user._id })
		if (!comment) { return res.status(404).send() }
		if (comment.children.length > 0) {
			// if there are child comments we dont want to outright delete the comment
			// we instead remove the author and body information from the comment
			comment.author = undefined;
			comment.body = undefined;
			await comment.save()
		} else {
			// otherwise we delete the comment
			await comment.remove()
		}

		res.send(comment)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router