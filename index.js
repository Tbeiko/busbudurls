/*jslint node: true */
'use strict';

// Declare variables used
var app, base_url, bodyParser, client, express, port, rtg, shortid;

// Define values
express = require('express');
app = express();
port = process.env.PORT || 5000;
shortid = require('shortid');
bodyParser = require('body-parser');
base_url = process.env.BASE_URL || 'localhost:5000';

// Set up connection to Redis
/* istanbul ignore if */
if (process.env.REDISTOGO_URL) {
  rtg  = require("url").parse(process.env.REDISTOGO_URL);
  client = require("redis").createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  client = require('redis').createClient();
}

// Set up templating
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Set URL
app.set('base_url', base_url);

// Handle POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Define index route
app.get('/', function (req, res) {
  res.render('index');
});

// Define submit route
app.post('/', function (req, res) {
    // Declare the variables
    var url, id, slug, callback, errorMessage;

    // Get URL
    url = req.body.url;
    slug = req.body.slug;


    // If there is no 'http://' at the beginning of the URL, it is added
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = "http://" + url;
    }

    if (!(req.body.url)) {
        errorMessage = "Oops, it seems you forgot to add a URL. Try again!";
        res.render('output', {base_url: "N", id: "A", url: "N/A", errorMessage: errorMessage});
    } else if (req.body.slug) {
        // If a slug is entered, we check to see whether it is already taken 
        client.get(slug, function (err, callback) {
            // If the callback is null, it means no other URL has that slug as id
            if (callback == null) { // *** The tests say to use "===" here but it breaks the live app when I do. ***
                 // Then we can use the slug as id
                id = slug;
                // And then we set it, and render the output page
                client.set(id, url, function (err, reply) {
                    console.log("Successfully created with slug.");
                    res.render('output', {id: id, base_url: base_url, url: url});
                });

            } else {
                // We generate a new slug
                id = shortid.generate();
                // And then we set it, and render the output page
                client.set(id, url, function (err, reply) {
                    console.log("Slug already taken. Successfully created with shortid");
                    errorMessage = "Oops, a custom URL with that slug already exists. We generated a random one for you instead!";
                    res.render('output', {id: id, base_url: base_url, url: url, errorMessage: errorMessage});
                });
            }
        });
    } else {
        // If no slug was passed, we simply generate an id with shortid
        id = shortid.generate();
        client.set(id, url, function (err, reply) {
            // Display the response 
            console.log("Successfully created with shortid.");
            res.render('output', {id: id, base_url: base_url, url: url});
        });
    }
});

// Define link route 
app.route('/:id').all(function (req, res) {
    // Get ID
    var id = req.params.id.trim();

    // Look up the URL
    client.get(id, function (err, reply) {
        if (!err && reply) {
            // Redirect the user 
            res.status(301);
            res.set('Location', reply);
            res.send();
        } else {
            // Confirm no such link in the database 
            res.status(404);
            res.render('error');
        }
    });
});

// Serve static files
app.use(express.static(__dirname + '/public'));

// Listen
app.listen(port);
console.log('Listening on port ' + port);
