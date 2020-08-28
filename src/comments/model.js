const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	body: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 500,
		trim: true,
	},
	parent: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	post_id: {
		type: Schema.Types.ObjectId,
		ref: 'Post',
		required: true,
	},
	votes: {
		type: Object,
		default: {},
	},
	karma: {
		type: Number,
		default: 0,
	}
}, { timestamps: true, toJSON: { virtuals: true }})

commentSchema.virtual('children', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'parent'
})

commentSchema.virtual('child_count', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'parent',
	count: true
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

commentSchema.statics.editableFields = ['body']

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment