var express 	= require('express'),
	http 		= require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var Twitter = require('twitter');


var socialmedia = {tweet: "", image:"largelogo.png", pos: "middleofeverything", tweethtml: "", scale: 100};
var twitterList = {};
var instagramList = {};

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

});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3002);
console.log("Go to http://127.0.0.1:3002/admin to control the dashboard")
console.log("Open http://127.0.0.1:3002 in another Chrome Window and smash it full screen")
