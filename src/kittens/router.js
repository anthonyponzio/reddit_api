const express = require('express')
const Kitten = require('./model')

const router = new express.Router()

router.post('/kittens', async (req, res) => {
	const kitten = new  Kitten(req.body)

	try {
		await kitten.save()
		res.status(201).send(kitten)
	} catch (e) {
		res.status(400).send(e)
	}
})

router.get('/kittens/:id', async (req, res) => {
	try {
		const kitten = await Kitten.findOne({ _id: req.params.id })

		if (!kitten) { return res.status(404).send() }

		res.send(kitten)
	} catch (e) {
		res.status(500).send()
	}
})

router.patch('/kittens/:id', async (req, res) => {
	try {		
		const kitten = await Kitten.findOne({ _id: req.params.id })
		if (!kitten) { return res.status(404).send() }

		kitten.name = req.body.name
		await kitten.save()
		res.send(kitten)
	} catch (e) {
		res.status(400).send(e)
	}
})

router.delete('/kittens/:id', async (req, res) => {
	try {
		const kitten = await Kitten.findOneAndDelete({ _id: req.params.id	})
		
		if (!kitten) { return res.status(404).send() }
		res.send(kitten)
	} catch (e) {
		res.status(500).send()
	}

})

module.exports = router

