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

commentSchema.methods.vote = async function (userObjectId, voteValue) {
	const userId = userObjectId.toString()
	const oldVote = this.votes[userId]
	if (oldVote) { this.karma -= oldVote }
	
	this.votes[userId] = voteValue
	this.karma += voteValue

	await this.markModified(`votes.${userId}`)
	await this.save()
}

commentSchema.statics.voteValues = {
	'upvote': 1,
	'downvote': -1,
	'unvote': 0,
}


const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment