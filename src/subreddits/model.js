const mongoose = require('mongoose');
const { Schema } = mongoose;

const subredditSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	name: {
		type: String,
		unique: true,
		required: true,
		minlength: 3,
		maxlength: 20,
		validate (value) {
			const alphanumeric = /^[A-Za-z0-9_-]*$/;
			const space = /\s/;

			if (space.test(value)) {
				throw new Error('Subreddit name cannot contain spaces')
			} else if (!alphanumeric.test(value)) {
				throw new Error('Subreddit name can only contain alphanumeric characters, underscores, or dashes')
			}
		},
	},
	description: {
		type: String,
		maxlength: 500,
	},
	title: {
		type: String,
		required: true,
		maxlength: 150,
		minlength: 3,
	},
	members: {
		type: Object,
		default: {}
	},
})

subredditSchema.methods.joinSubreddit = async function (userObjectId) {
	const userId = userObjectId.toString()
	if (this.members[userId]) {
		console.log('something ran here')
		throw new Error('User is already a member of that subreddit')
	}

	this.members[userId] = true
	await this.markModified(`members.${userId}`)
	await this.save()
}

const Subreddit = mongoose.model('Subreddit', subredditSchema)

module.exports = Subreddit