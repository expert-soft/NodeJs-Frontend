// require express
var express = require('express');
var path = require('path');
// create our router object
var router = express.Router();
var moment = require('moment');
var math = require('mathjs');
const http = require('http');

// export router
 module.exports = router;

function roundNumber(num, scale) {
    if(!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale)  + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if(+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}
// route for our homepage
router.get('/', function(requests, responses){
	responses.render('pages/index', { user: requests.user });
});

router.get('/login',
    function(requests, responses){
        responses.render('pages/login');
    });

router.get('/logout',
    function(requests, responses){
        requests.logout();
        responses.redirect('/');
    });

// route for our about
router.get('/wallets', function(requests, responses){
    http.get('http://localhost:9001/iapi/1/node', (resp) => {
        let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
	});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			var datajson = JSON.parse(data);
			for (var i = 0; i < datajson.length; i++) {
                datajson[i].block_time = moment(Number(datajson[i].block_time)).format("YYYY-MM-DD HH:mm:ss");
                datajson[i].net = roundNumber(datajson[i].net*100,2);
			}
            responses.render('pages/wallets', {users: datajson});
	});

	}).on("error", (err) => {
			console.log("Error: " + err.message);
	});

});

router.get('/balances', function(requests, responses){
    http.get('http://localhost:9001/iapi/1/balance', (resp) => {
        let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
});

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        var datajson = JSON.parse(data);
        for (var i = 0; i < datajson.length; i++) {
            datajson[i].available = math.format(Number(datajson[i].amount) - Number(datajson[i].hold),  {notation: 'fixed', precision: 8});
            datajson[i].amount = math.format(Number(datajson[i].amount), {notation: 'fixed', precision: 8});
            datajson[i].hold = math.format(Number(datajson[i].hold), {notation: 'fixed', precision: 8});
            datajson[i].est_usd = math.format(Number(datajson[i].est_usd), {notation: 'fixed', precision: 8});
        }
    responses.render('pages/balances', {users: datajson});
});

}).on("error", (err) => {
        console.log("Error: " + err.message);
});

});

router.get('/contact', function(requests, responses){
	responses.render('pages/contact');
});

router.post('/contact',function(requests, responses){
	responses.send('Thanks for contacting us ' + requests.body.name +'! We will respond shortly.');
});

