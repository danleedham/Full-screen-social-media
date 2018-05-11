var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io', 'Twitter']);

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
                controller: 'twitterCGController'
            })
            .when("/instagram", {
                templateUrl: '/admin/templates/instagram.tmpl.html',
                controller: 'instagramCGController'
            })
            .otherwise({redirectTo: '/twitter'});
    }
]);

app.controller('liveControlCGController', ['$scope', 'socket',
    function($scope, socket) {
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

app.controller('twitterCGController', ['$scope', 'socket', 'Twitter',
    function($scope, socket, Twitter) {

        // Replace with your infos: https://apps.twitter.com/app/new
        /* var client = new Twitter({
            consumer_key: '',
            consumer_secret: '',
            access_token_key: '',
            access_token_secret: ''
        });

        var params = {screen_name: 'nodejs'};
        client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (!error) {
                console.log(tweets);
            }
        }); */

        socket.on("twitterList", function (msg) {
            $scope.twitterList = msg;
        });

        $scope.$watch('twitterList', function() {
            if ($scope.twitterList) {
                socket.emit("twitterList", $scope.twitterList);
            } else {
                getTwitterListData();
            }
        }, true);

        function getTwitterListData() {
            socket.emit("twitterList:get");
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