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

commentSchema.methods.vote = function (objectId, value) {
	const id = objectId.toString()
	const { votes } = this
	const oldVote = votes[id]
	if (oldVote) { this.karma -= oldVote }
	if (value === 0) {
		delete votes[id]
	} else {
		votes[id] = value
		this.karma += value
	}
}

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment