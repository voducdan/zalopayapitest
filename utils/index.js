const CryptoJS = require('crypto-js');
const axios = require('axios');
const config = {
	appid: process.env.APP_ID,
	key1: process.env.KEY_1,
	key2: process.env.KEY_2,
};

async function GetBankList() {
	const params = {
		appid: config.appid,
		reqtime: Date.now(),
	};
	const data = params.appid + '|' + params.reqtime;
	params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

	const result = await axios.post(process.env.GETBANKLIST, null, {
		params,
	});
	return result.data;
}

module.exports = {
	GetBankList,
};
