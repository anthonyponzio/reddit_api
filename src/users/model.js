const mongoose = require('mongoose')
const validator = require('validator')

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
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value) {
			// do some validation for minimum password strength
		}
	}
}, { timestamps: true })

userSchema.methods.toJSON = function () {
	const user = this.toObject()
	delete user.password
	// delete user.email // probably want to hide email

	return user
}

userSchema.pre('save', function (next) {
	if (this.isModified('password')) {
		console.log('password was modified')
	}
	next()
})

const User = mongoose.model('User', userSchema)
module.exports = User