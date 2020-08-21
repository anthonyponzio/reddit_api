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

const Post = mongoose.model('Post', postSchema)

module.exports = Post