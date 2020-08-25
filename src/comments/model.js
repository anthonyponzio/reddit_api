const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	body: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 500,
		trim: true,
	},
	children: [{
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	votes: {
		type: Object,
		default: {},
	},
	karma: {
		type: Number,
		default: 0,
	}
})

commentSchema.methods.vote = async function (objectId, value) {
	const id = objectId.toString()
	const oldVote = this.votes[id]
	if (oldVote) {
		this.karma -= oldVote
	}
	
	this.votes[id] = value
	this.karma += value

	await this.markModified(`votes.${id}`)
	await this.save()
}

commentSchema.statics.voteValues = {
	'upvote': 1,
	'downvote': -1,
	'unvote': 0,
}



// router.post('/comments/:id/upvote', auth, async (req, res) => {

// })

// router.post('/comments/:id/downvote', auth, async (req, res) => {

// })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment