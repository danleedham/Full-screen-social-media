var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

// Social Media Controller, as developed by Dan Leedham with help from the amazing Tom J
// Initialise with the usual plus http for grabbing data from social media sites
// SCE allows us to use Trust HTML for the data we get back from social media sites
app.controller('liveControlCtrl', ['$scope', '$http', 'socket', '$sce',
    function($scope, $http, socket, $sce){
        var showTweet = false;
        socket.on("socialmedia", function (msg) {
            tweetUrl = msg.tweet;
            $scope.socialmedia = msg;
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
         
		if ($scope.socialmedia.hidemedia) {
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
        			
        $scope.$watch('socialmedia', function() {
            if (!$scope.socialmedia) {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }
    }

]);

app.controller('twittercollectionsCtrl', ['$scope', '$interval', '$http', 'socket', '$sce',
    function($scope, $interval, $http, socket,  $sce){        
        socket.on("twittercollections", function (msg) {
            $scope.twittercollections = msg;
            if(msg.show){
                var screenname = msg.screenname;
                var collectionid = msg.collectionid;
                var collectionCode = '<a class="twitter-grid" href="https://twitter.com/'+screenname+'/timelines/'+collectionid+'"> Embedded Tweets </a>';
                $scope.collectionHTML = $sce.trustAsHtml(collectionCode);
                // console.log(collectionCode);
                twttr.widgets.load();
            }
        });
        
        $scope.$watch('twittercollections', function() {
            if (!$scope.twittercollections) {
                getTwitterCollectionsData();
            }
        }, true);

        function getTwitterCollectionsData() {
            socket.emit("twittercollections:get");
        }
    }

]);