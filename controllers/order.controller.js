const express = require('express');
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const { v1 } = require('uuid');
const moment = require('moment');
const qrcode = require('qrcode');
const NodeRSA = require('node-rsa');

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
		itename: 'kim nguyen bao',
		itemprice: 198400,
		itemquantity: 1,
	},
];

let data = '';
let paymentcodeRaw = '';
async function QR(req, res) {
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

	order.bankcode = '';
	data =
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
}
async function Quickpay(req, res) {
	const body = req.body;
	paymentcodeRaw = body.paymentcode;
	config.rsaPublicKey = `
    -----BEGIN PUBLIC KEY-----
    MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOfB6/x0b5UiLkU3pOdcnXIkuCSzmvlV
    hDJKv1j3yBCyvsgAHacVXd+7WDPcCJmjSEKlRV6bBJWYam5vo7RB740CAwEAAQ==
    -----END PUBLIC KEY-----
    `;
	const key = new NodeRSA(config.rsaPublicKey, {
		encryptionScheme: 'pkcs1',
	});
	const paymentcode = key.encrypt(paymentcodeRaw, 'base64');
	console.log(paymentcode);
	const order = {
		appid: config.appid,
		apptransid: `${moment().format('YYMMDD')}_${v1()}`, // mã giao dich có định dạng yyMMdd_xxxx
		appuser: 'demo',
		apptime: Date.now(), // miliseconds
		item: JSON.stringify(items),
		embeddata: JSON.stringify(embeddata),
		amount: 1000,
		description: body.description,
		userip: '127.0.0.1',
		paymentcode,
	};
	data =
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
		order.item +
		'|' +
		paymentcode;
	order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
	try {
		const callback = await axios.post(process.env.QUICKPAY, null, {
			params: order,
		});
		console.log(callback.data);
		if (callback.data.returncode !== 1 && callback.data.returncode !== 10) {
			res.render('home', {
				error: 'Hệ thống đang có lỗi vui lòng thử lại sau!',
			});
		}
		res.end();
	} catch (error) {
		console.log(error);
		res.render('index', { error });
	}
}
async function Gateway(req, res) {
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
		bankcode: body.bankcode,
	};
	data =
		order.appid +
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
	const orderJSON = JSON.stringify(order);
	const b64Order = Buffer.from(orderJSON).toString('base64');
	res.redirect(process.env.GATEWAY + encodeURIComponent(b64Order));
}
module.exports = {
	QR,
	Quickpay,
	Gateway,
};
