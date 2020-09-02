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
	const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
	this.tokens = this.tokens.concat({ token })
	await this.save()

	return token
}

userSchema.methods.toJSON = function () {
	const user = this.toObject()
	delete user.password
	delete user.tokens
	delete user.email

	return user
}

userSchema.methods.joinSubreddit = function (subredditObjectId) {
	const subredditId = subredditObjectId.toString()
	if (this.subreddits.includes(subredditId)) {
		throw new Error('User is already a member of that subreddit')
	}
	
	this.subreddits = this.subreddits.concat(subredditId)
	await this.save()
}

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8)
	}
	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User