const express = require('express');

const { QR, Quickpay, Gateway } = require('../controllers/order.controller');
const { GetBankList } = require('../utils/index.js');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('home', { error: null });
});

router
	.route('/createorder')
	.get(async (req, res) => {
		const banks = await GetBankList();
		res.render('index', { error: null, banklist: banks['banks'] });
	})
	.post(async (req, res) => {
		const body = req.body;
		switch (body.type) {
			case 'QR':
				QR(req, res);
				break;
			case 'Quickpay':
				Quickpay(req, res);
				break;
			case 'Gateway':
				Gateway(req, res);
				break;
		}
	});

router.get('/qr', (req, res) => {
	res.render('qr', { src: 'images/qr.png' });
});

module.exports = router;
