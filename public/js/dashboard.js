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
        var stored = localStorageService.get('twitterList');
        if(stored === null) {
            $scope.twitterList = [];
        } else {
            $scope.twitterList = stored;
        }
        
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
        // Get previous tweets that have been found in the search, if they exist
        var stored = localStorageService.get('currentSearch');
        if(stored === null) {
            $scope.results = [];
        } else {
            $scope.results = stored;
        }

        // If there isn't a list of tweets yet then make an empty one 
        if($scope.twitterList == undefined){
            $scope.twitterList = [];
        }

        //  If we dunno what to search by, let's go by popular tweets. This is set by the user
        if($scope.searchBy == undefined){
            $scope.searchBy = "popular";
        }
        
        // Function for adding a particular tweet to the saved list
        $scope.addToList = function(item) {
            if (item.id_str && $scope.twitterList.includes(item) == false) {
                $scope.twitterList.unshift(item);
                return localStorageService.set('twitterList',$scope.twitterList); 
            }
        };

        // Function for clearning the search results
        $scope.clearCurrentSearch = function(){
            console.log("Clearing Results");
            $scope.results = undefined;
            return localStorageService.set('currentSearch',[]); 
        }


        // Main Tweet grabbing function. Also does some fiddling with the returned data. 
        $scope.getSearch = function(searchText,searchBy){
            console.log("Search string entered: ", searchText);
            TwitterService.getSearch(searchText, searchBy)
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
                    return localStorageService.set('currentSearch',$scope.results); 
                    }

                    // console.log($scope.results);
                })
                .catch(function(error){
                    console.error('there was an error retrieving data: ', error);
                    $scope.twitterErrors = error.error;
                })
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
  var getSearch = function(searchText,searchBy){
    var d = $q.defer();
    $http.post('/twitter/search', {searchText : searchText, searchBy : searchBy})
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