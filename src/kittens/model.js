const mongoose = require('mongoose')

const kittenSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
})

kittenSchema.methods.speak = function () {
	const greeting = this.name ? 'Meow name is ' + this.name : 'I dont have a name'
	console.log(greeting)
}

const Kitten = mongoose.model('Kitten', kittenSchema)

module.exports = Kitten
