const allowedFields = allowedFields => {
	return (req, res, next) => {
		const fields = Object.keys(req.body)
		
		if (fields.length < 1) {
			return res.status(400).send({ error: 'Missing fields' })
		}

		const allFieldsValid = fields.every(field => allowedFields.includes(field))
		if (!allFieldsValid) {
			return res.status(400).send({ error: 'Invalid fields' })
		}

		req.fields = fields
		next()
	}
}

module.exports = allowedFields