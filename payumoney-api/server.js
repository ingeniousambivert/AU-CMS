const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function(req,res) {	
	const ord = JSON.stringify(Math.random()*1000);
	const i = ord.indexOf('.');
	ord = 'ORD'+ ord.substr(0,i);	
	res.render(__dirname + '/checkout.html', {orderid:ord});
	
});
	

app.post('/', function(req, res){
	const strdat = '';
	
	req.on('data', function (chunk) {
        strdat += chunk;
    });
	
	req.on('end', function()
	{
		const data = JSON.parse(strdat);
		const cryp = crypto.createHash('sha512');
		const text = data.key+'|'+data.txnid+'|'+data.amount+'|'+data.pinfo+'|'+data.fname+'|'+data.email+'|||||'+data.udf5+'||||||'+data.salt;
		cryp.update(text);
		const hash = cryp.digest('hex');		
		res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(hash));		
	});
	
	
});

app.post('/response.html', function(req, res){
	const key = req.body.key;
	const salt = req.body.salt;
	const txnid = req.body.txnid;
	const amount = req.body.amount;
	const productinfo = req.body.productinfo;
	const firstname = req.body.firstname;
	const email = req.body.email;
	const udf5 = req.body.udf5;
	const mihpayid = req.body.mihpayid;
	const status = req.body.status;
	const resphash = req.body.hash;
	
	const keyString 		=  	key+'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|||||'+udf5+'|||||';
	const keyArray 		= 	keyString.split('|');
	const reverseKeyArray	= 	keyArray.reverse();
	const reverseKeyString=	salt+'|'+status+'|'+reverseKeyArray.join('|');
	
	const cryp = crypto.createHash('sha512');	
	cryp.update(reverseKeyString);
	const calchash = cryp.digest('hex');
	
	const msg = 'Payment failed for Hash not verified...';
	if(calchash == resphash)
		msg = 'Transaction Successful and Hash Verified...';
	
	res.render(__dirname + '/response.html', {key: key,salt: salt,txnid: txnid,amount: amount, productinfo: productinfo, 
	firstname: firstname, email: email, mihpayid : mihpayid, status: status,resphash: resphash,msg:msg});
});
app.listen(3000);