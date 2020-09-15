const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Schema } = require( 'mongoose' )

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		maxlength: 20,
		minlength: 3,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
		trim: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid!')
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		maxlength: 100,
	},
	tokens: [{
		token: {
			type: String,
			required: true,
		},
	}],
	subreddits: [{
		type: Schema.Types.ObjectId,
		ref: 'Subreddit',
	}]
}, { timestamps: true })

userSchema.virtual('comments', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'author',
})

userSchema.virtual('posts', {
	ref: 'Post',
	localField: '_id',
	foreignField: 'author',
})

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })
	if (!user) { throw new Error('Unable to login') }

	const validPassword = await bcrypt.compare(password, user.password)
	if (!validPassword) { throw new Error('Unable to login') }

	return user
}

userSchema.statics.editableFields = ['username', 'password', 'email']

userSchema.methods.generateAuthToken = async function () {
	const user = this
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
	user.tokens = user.tokens.concat({ token })
	await user.save()

	return token
}

userSchema.methods.toJSON = function () {
	const user = this.toObject()
	delete user.password
	delete user.tokens
	delete user.email

	return user
}

userSchema.methods.belongsToSubreddit = function (subredditId) {
	return this.subreddits.some(id => id.equals(subredditId))
}

userSchema.methods.joinSubreddit = async function (subredditId) {
	const user = this
	if (user.belongsToSubreddit(subredditId)) {
		throw new Error('User is already a member of that subreddit')
	}

	user.subreddits = user.subreddits.concat([subredditId])
	await user.save()
}

userSchema.methods.leaveSubreddit = async function (subredditId) {
	const user = this
	if (!user.belongsToSubreddit(subredditId)) {
		throw new Error('User is not a member of that subreddit')
	}

	user.subreddits = user.subreddits.filter(id => !id.equals(subredditId))
	await user.save()
}


userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User