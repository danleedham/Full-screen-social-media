var express 	= require('express'),
	http 		= require('http');

var app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io').listen(server);


// Get the Twitter Module
module.exports = require('./node_modules/twitter-node-client/lib/Twitter');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var error = function (err, response, body) {
    console.log('ERROR [%s]', JSON.stringify(err));
};
var success = function (data) {
    console.log('Data [%s]', data);
};

// Personal Twitter Keys from https://apps.twitter.com/
var config = {
    "consumerKey": "",
    "consumerSecret": "",
    "accessToken": "",
    "accessTokenSecret": ""
};

var twitter = new module.exports.Twitter(config);

var socialmedia = {pos: "middleofeverything", design: "defaultDesign", animate: "toggle", background: "fullImage"};
var twitterList = {};
var instagramList = {};
var manual = {tweet: "", image:"largelogo.png", pos: "middleofeverything", tweethtml: "", scale: 100};

// Do some connections wizardry
io.on('connection', function(socket) {
	console.log("Client Socket Connected");
	
    /*
	 * 		Live Control
	 */
	socket.on("socialmedia", function(msg) {
        socialmedia = msg;
		io.sockets.emit("socialmedia", msg);
	});

    socket.on("socialmedia:get", function(msg) {
        io.sockets.emit("socialmedia", socialmedia);
	});
	
	/*
	 * 		Twitter
	 */
	socket.on("twitterList", function(msg) {
        twitter = msg;
		io.sockets.emit("twitterList", msg);
	});
	
    socket.on("twitterList:get", function(msg) {
        io.sockets.emit("twitterList", twitterList);
	});
	
	/*
	 * 		Instagram
	 */
	socket.on("instagramList", function(msg) {
        instagramList = msg;
		io.sockets.emit("instagramList", msg);
	});
	
    socket.on("instagramList:get", function(msg) {
        io.sockets.emit("instagramList", instagramList);
	});
	
	/*
	 * 		Manual Control
	 */
	socket.on("manual", function(msg) {
        manual = msg;
		io.sockets.emit("manual", msg);
	});

    socket.on("manual:get", function(msg) {
        io.sockets.emit("manual", manual);
	});

});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

//post to retrieve search data
app.post('/twitter/search', function (req, res) {
	console.log(req.body);
	var searchText = req.body.searchText;
	var filterRetweets = '-filter:retweets';
	var filterImages ='+filter:images';
	var resultType = req.body.searchBy;
	var data = twitter.getSearch({ q: searchText+filterRetweets, 'count': 20, 'result\_type':resultType, 'lang':'en', 'include_entities':'true', 'tweet_mode':'extended'}, function(error, response, body){
		res.status(404).send({
			"error" : "Nothing Found"
		});
	}, function(data){
		res.send({
			result : {
				"userData" : data
			}
		});
	});
});

server.listen(3002);
console.log("Go to http://127.0.0.1:3002/admin to control the dashboard")
console.log("Open http://127.0.0.1:3002 in another Chrome Window and smash it full screen")