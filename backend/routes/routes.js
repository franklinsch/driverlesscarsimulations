const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

module.exports = router;
