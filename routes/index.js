const express = require('express');
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const { v1 } = require('uuid');
const moment = require('moment');
const qrcode = require('qrcode');

const router = express.Router();

const config = {
	appid: process.env.APP_ID,
	key1: process.env.KEY_1,
	key2: process.env.KEY_2,
};
const embeddata = {
	merchantinfo: 'embeddata123',
};

const items = [
	{
		itemid: 'knb',
		itemname: 'kim nguyen bao',
		itemprice: 198400,
		itemquantity: 1,
	},
];

router.get('/createorder', async (req, res) => {
	console.log(process.env.APP_ID);
	res.render('index.ejs');
});

router.post('/createorder', async (req, res) => {
	const body = req.body;

	let order = {
		appid: config.appid,
		apptransid: `${moment().format('YYMMDD')}_${v1()}`, // mã giao dich có định dạng yyMMdd_xxxx
		appuser: 'demo',
		apptime: Date.now(),
		item: JSON.stringify(items),
		embeddata: JSON.stringify(embeddata),
		amount: body.amount,
		description: body.description,
		bankcode: '',
	};
	switch (body.type) {
		case 'QR':
			order.bankcode = '';
			break;
		case 'Gateway':
			order.bankcode = body.bank;
			break;
		case 'Quickay':
			order.bankcode = '';
			break;
	}

	const data =
		config.appid +
		'|' +
		order.apptransid +
		'|' +
		order.appuser +
		'|' +
		order.amount +
		'|' +
		order.apptime +
		'|' +
		order.embeddata +
		'|' +
		order.item;
	order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

	try {
		const callback = await axios.post(process.env.CREATE_ORDER, null, {
			params: order,
		});
		await qrcode.toFile('public/images/qr.png', callback.data.orderurl, {
			color: {
				dark: '#000000', // Blue dots
				light: '#fff', // Transparent background
			},
		});
		res.redirect('/qr');
	} catch (error) {
		console.log(error);
		res.render('index', { error: error });
	}
});

router.get('/qr', (req, res) => {
	res.render('qr', { src: 'images/qr.png' });
});
module.exports = router;
