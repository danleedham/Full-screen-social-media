var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        
    	$scope.menu.push({
            name: 'Live Control',
            url: '/live-control',
            type: 'link',
            icon: 'red circle',
        });

        $scope.menu.push({
            name: 'Twitter Search',
            url: '/twitter',
            type: 'link',
            icon: 'blue twitter',
        });

        $scope.menu.push({
            name: 'Instagram Search',
            url: '/instagram',
            type: 'link',
            icon: 'orange instagram',
        });

        $scope.menu.push({
            name: 'Manual Embed',
            url: '/manual',
            type: 'link',
            icon: 'black camera',
        });

    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('social-media');

        $routeProvider          
            .when("/live-control", {
                templateUrl: '/admin/templates/live-control.tmpl.html',
                controller: 'liveControlCGController'
            })
            .when("/twitter", {
                templateUrl: '/admin/templates/twitter.tmpl.html',
                controller: 'newTwitterCGController'
            })
            .when("/instagram", {
                templateUrl: '/admin/templates/instagram.tmpl.html',
                controller: 'instagramCGController'
            })
            .when("/manual", {
                templateUrl: '/admin/templates/manual.tmpl.html',
                controller: 'manualCGController'
            })
            .otherwise({redirectTo: '/live-control'});
    }
]);

app.controller('liveControlCGController', ['$scope', 'socket', 'localStorageService',
    function($scope, socket, localStorageService) {
        // Let's go get stuff from the memory        
        var stored = localStorageService.get('twitterList');
        if(stored === null) {
        } else {
            $scope.twitterList = stored;
        }

        var currentLiveTweet = localStorageService.get('currentLiveTweet');
        if(currentLiveTweet === null) {
        } else {
            $scope.currentLiveTweet = currentLiveTweet;
        }

        var twitterTopTweet = localStorageService.get('twitterTopTweet');
        if(twitterTopTweet === null) {
        } else {
            $scope.twitterTopTweet = twitterTopTweet;
        }
        var hideInstructions = localStorageService.get('hideInstructions');
        if(hideInstructions === null) {
        } else {
            $scope.hideInstructions = hideInstructions;
        }
        
        $scope.clearTwitterList = function(){
            $scope.twitterList = undefined;
            return localStorageService.remove('twitterList'); 
        }

        $scope.removeFromList = function($index){
            $scope.twitterList.splice($index,1);
            // Update local storage with remaining favs
            return localStorageService.set('twitterList',$scope.twitterList);
        }

        $scope.putTweetLive = function(){
            $scope.socialmedia.tweetLive = true;
        }

        $scope.hideLiveTweet = function(){
            $scope.socialmedia.tweetLive = false;
        }

        $scope.makeNextOnAir = function($index){
            $scope.twitterTopTweet = $scope.twitterList[$index];
            return localStorageService.set('twitterTopTweet',$scope.twitterTopTweet);
        }

        $scope.makeLive = function($index){
            $scope.makeNextOnAir($index);
            $scope.socialmedia.tweetLive = true;
        }

        $scope.hideLive = function($index){
            $scope.hideLiveTweet();
        }

        $scope.clearInstructions = function(){
            $scope.hideInstructions = true;
            return localStorageService.set('hideInstructions',true);
        }

        $scope.$watch('twitterTopTweet', function() {
            if ($scope.twitterTopTweet) {
                socket.emit("twitterTopTweet", $scope.twitterTopTweet);
            }
        }, true);

        socket.on("socialmedia", function (msg) {
            $scope.socialmedia = msg;
            $scope.socialmedia.scale = Number($scope.socialmedia.scalepc) / 100;	
            if($scope.socialmedia.imageactive == "none"){
                $scope.socialmedia.imageactiveShow = false;
            } else {
                $scope.socialmedia.imageactiveShow = true;
            }
            if($scope.socialmedia.image == "none"){
                $scope.socialmedia.imageShow = false;
            } else {
                $scope.socialmedia.imageShow = true;
            }
        });

        $scope.$watch('socialmedia', function() {
            if ($scope.socialmedia) {
                socket.emit("socialmedia", $scope.socialmedia);
            } else {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }

    }
]);

app.controller('instagramCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("instagramList", function (msg) {
            $scope.instagramList = msg;
        });

        $scope.$watch('instagramList', function() {
            if ($scope.instagramList) {
                socket.emit("instagramList", $scope.instagramList);
            } else {
                getInstagramListData();
            }
        }, true);

        function getInstagramListData() {
            socket.emit("instagramList:get");
        }

    }
]);

app.controller('newTwitterCGController', ['$scope', 'TwitterService', 'socket', 'localStorageService',
    function($scope, TwitterService, socket, localStorageService){        
        // Get default options if they're not currently set
        if($scope.twitterOptions == undefined){
            socket.emit("twitterOptions:get");
        }

        // Listen to if the server gives us any update on the twitterOptions score.
        socket.on("twitterOptions", function (msg) {
            $scope.twitterOptions = msg;
        });

        // If the twitterOptions $scope updates, let's send that update to the server.
        $scope.$watch('twitterOptions', function() {
            if ($scope.twitterOptions) {
                socket.emit("twitterOptions", $scope.twitterOptions);
            }
        }, true);
        
        // Get previous tweets that have been found in the search, if they exist
        var stored = localStorageService.get('currentSearch');
        if(stored === null) {
        } else {
            $scope.results = stored;
        }

        // If there isn't a list of favorite tweets yet then make an empty one 
        if($scope.twitterList == undefined){
            var twitterList = localStorageService.get('twitterList');
            if(twitterList === null) {
                $scope.twitterList = [];
            } else {
                $scope.twitterList = twitterList;
            }
        }
       
        // Function for adding a particular tweet to the saved list
        $scope.addToList = function(item) {
            if (item.id_str && $scope.twitterList.includes(item) == false) {
                $scope.twitterList.unshift(item);
                return localStorageService.set('twitterList',$scope.twitterList); 
            }
        };

        $scope.makeLive = function(result){
            $scope.twitterTopTweet = result;
            socket.emit("socialmediashow", "showTweet");
            return localStorageService.set('twitterTopTweet',$scope.twitterTopTweet);
        }

        $scope.hideLive = function(result){
            socket.emit("socialmediahide", "hideTweet");
        }

        // If the twitterOptions $scope updates, let's send that update to the server.
        $scope.$watch('twitterTopTweet', function() {
            if ($scope.twitterTopTweet) {
                socket.emit("twitterTopTweet", $scope.twitterTopTweet);
            }
        }, true);

        // Function for clearning the search results
        $scope.clearCurrentSearch = function(){
            // console.log("Clearing Results");
            $scope.results = undefined;
            return localStorageService.remove('currentSearch'); 
        }

        // Main Tweet grabbing function. Also does some fiddling with the returned data. 
        $scope.getSearch = function(searchText,searchBy,searchMedia){
            console.log("Search string entered: ", searchText + " " + searchBy + " " + searchMedia);
            TwitterService.getSearch(searchText, searchBy, searchMedia)
                .then(function(data){
                    $scope.twitterErrors = undefined;
                    $scope.results = JSON.parse(data.result.userData);
                    
                    for(i=0; i<$scope.results.statuses.length; i++){
                        // Let's fix us some dates so we can use them
                        $scope.results.statuses[i].created_at_JSDate = new Date($scope.results.statuses[i].created_at);
                        // Now get rid of any picture links as we'll be displaying those!
                        var pos = $scope.results.statuses[i].full_text.lastIndexOf("https://t.co/");
                        if(pos > -1){
                            $scope.results.statuses[i].full_text = $scope.results.statuses[i].full_text.substring(0,pos);
                        }
                        // Split images
                            $scope.results.statuses[i].user.profile_image_url_bigger = $scope.results.statuses[i].user.profile_image_url.replace("normal","bigger");
                            $scope.results.statuses[i].user.profile_image_url_original = $scope.results.statuses[i].user.profile_image_url.replace("_normal","");
                        // Get rid of annoying &amps;
                        $scope.results.statuses[i].full_text = $scope.results.statuses[i].full_text.replace(new RegExp('&amp;', 'g'), '&');
                    }
                    // console.log($scope.results);
                    return localStorageService.set('currentSearch',$scope.results); 

                    // console.log($scope.results);
                })
                .catch(function(error){
                    console.error('there was an error retrieving data: ', error);
                    $scope.twitterErrors = error.error;
                })
            }
        
        $scope.$watch('twitter', function() {
            if ($scope.twitter) {
                socket.emit("twitter", $scope.twitter);
            } else {
                getTwitterData();
            }
        }, true);

        function getTwitterData() {
            socket.emit("twitter:get");
        }
            
    }
]);

app.controller('manualCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("manual", function (msg) {
            $scope.manual = msg;
            $scope.manual.scale = Number($scope.manual.scalepc) / 100;	
            if($scope.manual.imageactive == "none"){
                $scope.manual.imageactiveShow = false;
            } else {
                $scope.manual.imageactiveShow = true;
            }
            if($scope.manual.image == "none"){
                $scope.manual.imageShow = false;
            } else {
                $scope.manual.imageShow = true;
            }
        });

        $scope.$watch('manual', function() {
            if ($scope.manual) {
                socket.emit("manual", $scope.manual);
            } else {
                getmanualData();
            }
        }, true);

        function getmanualData() {
            socket.emit("manual:get");
        }

    }
]);

app.factory('TwitterService', function($http, $q){
  var getSearch = function(searchText,searchBy,searchMedia){
    var d = $q.defer();
    $http.post('/twitter/search', {searchText : searchText, searchBy : searchBy, searchMedia : searchMedia})
      .success(function(data){
        return d.resolve(data);
      })
      .error(function(error){
        return d.reject(error);
      });
    return d.promise;
  };

  return {
    getSearch : getSearch
  }
});