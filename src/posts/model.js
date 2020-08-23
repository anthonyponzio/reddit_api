const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
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
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	}
}, { timestamps: true })

postSchema.methods.editableByUser = function (user) {
	return this.author.toString() === user._id.toString()
}

postSchema.statics.editableFields = ['title', 'body']

const Post = mongoose.model('Post', postSchema)

module.exports = Post