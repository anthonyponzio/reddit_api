const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
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
		validate(value) {
			// TODO: validate minimum password strength
		},
	},
	tokens: [{
		token: {
			type: String,
			required: true,
		},
	}],
}, { timestamps: true })

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })
	if (!user) { throw new Error('Unable to login') }

	const validPassword = await bcrypt.compare(password, user.password)
	if (!validPassword) { throw new Error('Unable to login') }

	return user
}

userSchema.methods.generateAuthToken = async function () {
	// TODO: get secret from process.env
	const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
	this.tokens = this.tokens.concat({ token })
	await this.save()

	return token
}

userSchema.methods.toJSON = function () {
	const user = this.toObject()
	delete user.password
	delete user.tokens
	// TODO: hide email?
	// delete user.email

	return user
}

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8)
	}
	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User