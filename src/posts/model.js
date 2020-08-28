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
}, { timestamps: true })

postSchema.virtual('comments', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'parent'
})

postSchema.statics.editableFields = ['title', 'body']

const Post = mongoose.model('Post', postSchema)

module.exports = Post