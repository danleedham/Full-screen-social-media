var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('liveControlCtrl', ['$scope', '$http', 'socket',
    function($scope, $http, socket){
        // Social Media contains most of the general settings
        socket.on("socialmedia", function (msg) {
            $scope.socialmedia = msg;
        });
        			
        $scope.$watch('socialmedia', function() {
            if (!$scope.socialmedia) {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }

        // Twitter Top Tweet contains the tweet content of the current top/live tweet      			
        socket.on("twitterTopTweet", function (msg) {
            $scope.twitterTopTweet = msg;
            // Shuffling of multi-image tweets
            if($scope.twitterTopTweet.extended_entities.media.length > 1){
                $scope.currentImageValue = 0;
                setInterval($scope.rotateImages,3000);
            }

            $scope.rotateImages = function (){
                if($scope.currentImageValue < $scope.twitterTopTweet.extended_entities.media.length - 1){
                    $scope.currentImageValue = $scope.currentImageValue + 1;
                    $scope.currentImage = $scope.twitterTopTweet.extended_entities.media[$scope.currentImageValue].id_str;
                } else {
                    $scope.currentImageValue = 0;
                    $scope.currentImage = $scope.twitterTopTweet.extended_entities.media[0].id_str;
                }
            }
        });
        

        $scope.$watch('twitterTopTweet', function() {
            if (!$scope.twitterTopTweet) {
                getTwitterTopTweetData();
            } else {

            }
        }, true);

        function getTwitterTopTweetData() {
            socket.emit("twitterTopTweet:get");
        }

    }

]);

// Original Social Media Controller, as developed by Dan Leedham with help from the amazing Tom J
// Initialise with the usual plus http for grabbing data from social media sites
// SCE allows us to use Trust HTML for the data we get back from social media sites
app.controller('manualControlCtrl', ['$scope', '$http', 'socket', '$sce',
    function($scope, $http, socket, $sce){
        var showTweet = false;
        socket.on("manual", function (msg) {
            tweetUrl = msg.tweet;
            $scope.manual = msg;
            showTweet = msg.show;
            if (!showTweet) {
                $scope.showTweet = false;
            }
            if(tweetUrl !== ""){
                fetchTweetHTML(msg.tweet);
            }
        });

        // Now let's go get the html code from our provider
        // tweetUrl in the function is the text entered by the user in the backend
        // tweetUrl requires a full post/video url to work. References to 'tweet' usually mean post
		var fetchTweetHTML = function (tweetUrl) {
          var config = {headers:  {
              'Accept': 'application/jsonp',
              'Content-Type': 'application/jsonp',
            }
          };
          
        // Checks the user provided url, determines which oEmbed engine to use
        // For more oEmbed sites, add another else if        
         if (tweetUrl.indexOf('instagram.com') >= 0) {
                  oEmbedUrl = 'http://api.instagram.com/oembed?url=';
          } else if (tweetUrl.indexOf('facebook.com') >= 0) {
                  // Facebook has two endpoints, one for post and one for video, hence the nested if
                  if     (tweetUrl.indexOf('video') >= 0) {
                  oEmbedUrl = 'https://www.facebook.com/plugins/video/oembed.json/?url=';
                  }
                  else {
                  oEmbedUrl = 'https://www.facebook.com/plugins/post/oembed.json/?url=';
                  }
          } else {
                  oEmbedUrl = 'https://api.twitter.com/1/statuses/oembed.json?url=';
          }
         
		if ($scope.manual.hidemedia) {
			var suffix = '&hide_media=true&hidecaption=true';
		}
		else {
			var suffix = "";
		}
        // $http.jsonp goes gets the data from oEmbed
        $http.jsonp(oEmbedUrl+tweetUrl+'&callback=JSON_CALLBACK'+suffix, config)
            .success(function(data) {
                $scope.tweetHTML = $sce.trustAsHtml(data.html);		// trustAsHtml stops the app adding '' around the html code
                $scope.tweetAuthor = data.author_name;				// Not used yet, but could be handy
                $scope.tweetType = data.type;						// Not used yet, but could be handy for the client side
                setTimeout(function() { 
                // Once a post is called, it needs to be styled correctly by initialising some cleverness
                // Each service requires its own function determined by the content of the url    
                   if (tweetUrl.indexOf("instagram.com") >= 0) { instgrm.Embeds.process(); }
                   else if (tweetUrl.indexOf("facebook.com") >= 0) { window.fbAsyncInit = function() {
								FB.init({
								  xfbml      : true,
								  version    : 'v2.8'
								});
							  }; 
							  (function(d, s, id){
								var js, fjs = d.getElementsByTagName(s)[0];
								if (d.getElementById(id)) {return;}
								js = d.createElement(s); js.id = id;
								js.src = "//connect.facebook.net/en_US/sdk.js";
								fjs.parentNode.insertBefore(js, fjs);
							  }(document, 'script', 'facebook-jssdk')); }
                   else { twttr.widgets.load(); }
                    if (showTweet) {
                        $scope.showTweet = showTweet;
                    }
                });
             }
          );
        };
        			
        $scope.$watch('manual', function() {
            if (!$scope.manual) {
                getManualData();
            }
        }, true);

        function getManualData() {
            socket.emit("manual:get");
        }
    }

]);
