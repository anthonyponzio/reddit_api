const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
	title: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 100,
		trim: true,
	},
	body: {
		type: String,
		maxlength: 2000,
		trim: true,
	},
	author: {
		type:Schema.Types.ObjectId,
		ref: 'User',
	},
	comments: [{
		type:Schema.Types.ObjectId,
		ref: 'Comment'
	}],
}, { timestamps: true })

postSchema.methods.editableByUser = function (user) {
	return this.author.toString() === user._id.toString()
}

postSchema.statics.editableFields = ['title', 'body']

postSchema.statics.appendComment = async function (post_id, comment_id) {
	const post = await Post.findOne({ _id: post_id })
	post.comments = post.comments.concat([comment_id])
	await post.save()
}

const Post = mongoose.model('Post', postSchema)

module.exports = Post