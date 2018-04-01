var express 	= require('express'),
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var socialmedia = {tweet: "", image:"largelogo.png", pos: "middleofeverything", tweethtml: "", scale: 100};
var twittercollections = {};

//Clock Functions
var stopwatch = new Stopwatch();

stopwatch.on('tick:stopwatch', function(time) {
	io.sockets.emit("clock:tick", time);
});



io.on('connection', function(socket) {
	console.log("Client Socket Connected");
	
    /*
	 * 		Social Media
	 */
	socket.on("socialmedia", function(msg) {
        socialmedia = msg;
		io.sockets.emit("socialmedia", msg);
	});

    socket.on("socialmedia:get", function(msg) {
        io.sockets.emit("socialmedia", socialmedia);
    });
    
    /*
	 * 		Twitter Collections
	 */
	socket.on("twittercollections", function(msg) {
        twittercollections = msg;
		io.sockets.emit("twittercollections", msg);
	});

    socket.on("twittercollections:get", function(msg) {
        io.sockets.emit("twittercollections", twittercollections);
    });


});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
console.log("Now listening on port 3000. Go to http://127.0.0.1:3000/admin to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG to start the graphics")
