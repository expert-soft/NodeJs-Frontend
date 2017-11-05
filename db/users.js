//Sequential execution for node.js using ES6 ECMAScript
const http = require('http');
var CONFIG = require('../config.json');

exports.findById = function(id, cb) {
    process.nextTick(function() {
        var post_req  = null,
            post_data = JSON.stringify({ id : id });

        var post_options = {
            hostname: CONFIG.EaaS_host,
            port    : CONFIG.EaaS_port,
            path    : CONFIG.EaaS_API_finduser,
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
                console.log(datajson);
                if (datajson != null) {
                    cb(null, datajson);
                } else {
                    cb(new Error('User ' + id + ' does not exist'));
                }
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
            var datajson = JSON.parse(data);
            console.log(datajson);
        if (datajson != null) {
            cb(null, datajson);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
        });

        post_req.write(post_data);
        post_req.end();


    });
};

exports.findByUsername = function(username, password,  cb) {
  process.nextTick(function() {
      var post_req  = null,
          post_data = JSON.stringify({ email : username, passwd: password });

      var post_options = {
          hostname: CONFIG.EaaS_host,
          port    : CONFIG.EaaS_port,
          path    : CONFIG.EaaS_API_authenticate,
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
              console.log(datajson);
              if (datajson != null) {
                  cb(null, datajson);
              } else {
                  cb(new Error('User ' + id + ' does not exist'));
              }
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
          var datajson = JSON.parse(data);
      console.log(datajson);
      if (datajson != null) {
          cb(null, datajson);
      } else {
          cb(new Error('User ' + id + ' does not exist'));
      }
  });

      post_req.write(post_data);
      post_req.end();

  });

};
