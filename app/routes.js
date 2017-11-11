// require express
var express = require('express');
var path = require('path');
// create our router object
var router = express.Router();
var moment = require('moment');
var math = require('mathjs');
var CONFIG = require('../config.json');
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
router.get('/',
    function(requests, responses){
	responses.render('pages/index', { user: requests.user });
});

router.get('/login',
    function(requests, responses){
        responses.render('pages/login', { user: requests.user });
    });

router.get('/logout',
    function(requests, responses){
        requests.logout();
        responses.redirect('/');
    });

// route for our about
router.get('/wallets',
    function(requests, responses){
    http.get('http://'+ CONFIG.EaaS_host + ":" + CONFIG.EaaS_port + CONFIG.EaaS_API_nodes, (resp) => {
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
            responses.render('pages/wallets', { user: requests.user, nodes: datajson });
	});

	}).on("error", (err) => {
			console.log("Error: " + err.message);
	});

});

router.get('/balances',
    function(requests, responses){
    if (requests.user == undefined){
        responses.redirect('/login');
    }else {
        var post_req  = null,
            post_data = JSON.stringify({ user_id : requests.user.id, account: CONFIG.EaaS_account });

        var post_options = {
            hostname: CONFIG.EaaS_host,
            port    : CONFIG.EaaS_port,
            path    : CONFIG.EaaS_API_balances,
            method  : 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Content-Length': post_data.length
            }
        };

        post_req = http.request(post_options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ', chunk);
                var datajson = JSON.parse(chunk);
                for (var i = 0; i < datajson.length; i++) {
                    datajson[i].available = math.format(Number(datajson[i].amount) - Number(datajson[i].hold),  {notation: 'fixed', precision: 8});
                    datajson[i].amount = math.format(Number(datajson[i].amount), {notation: 'fixed', precision: 8});
                    datajson[i].hold = math.format(Number(datajson[i].hold), {notation: 'fixed', precision: 8});
                    datajson[i].est_usd = math.format(Number(datajson[i].est_usd), {notation: 'fixed', precision: 8});
                }
                responses.render('pages/balances', {balances: datajson, user: requests.user});
            });
        });

        post_req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        let data = '';

        // A chunk of data has been recieved.
        post_req.on('data', (chunk) => {
            data += chunk;
    });

        // The whole response has been received. Print out the result.
        post_req.on('end', () => {
            var datajson = JSON.parse(chunk);
        for (var i = 0; i < datajson.length; i++) {
            datajson[i].available = math.format(Number(datajson[i].amount) - Number(datajson[i].hold),  {notation: 'fixed', precision: 8});
            datajson[i].amount = math.format(Number(datajson[i].amount), {notation: 'fixed', precision: 8});
            datajson[i].hold = math.format(Number(datajson[i].hold), {notation: 'fixed', precision: 8});
            datajson[i].est_usd = math.format(Number(datajson[i].est_usd), {notation: 'fixed', precision: 8});
        }
        responses.render('pages/balances', {users: datajson, user: requests.user});
    });

        post_req.write(post_data);
        post_req.end();

    }

});

router.get('/pool',
    function(requests, responses){
	responses.render('pages/pool', { user: requests.user });
});

