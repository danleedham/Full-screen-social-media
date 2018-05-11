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
        var client = new Twitter({
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
        });

        socket.on("twitter", function (msg) {
            $scope.twitter = msg;
        });

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

app.controller('instagramCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("instagram", function (msg) {
            $scope.instagram = msg;
        });

        $scope.$watch('instagram', function() {
            if ($scope.instagram) {
                socket.emit("instagram", $scope.instagram);
            } else {
                getInstagramData();
            }
        }, true);

        function getInstagramData() {
            socket.emit("instagram:get");
        }

    }
]);