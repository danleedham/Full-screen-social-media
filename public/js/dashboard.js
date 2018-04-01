var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        
    	$scope.menu.push({
            name: 'Social Media',
            url: '/social-media',
            type: 'link',
            icon: 'blue twitter',
        });
		
		$scope.menu.push({
            name: 'Twitter Collections',
            url: '/twitter-collections',
            type: 'link',
            icon: 'blue twitter',
        });

    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('la1tv');

        $routeProvider          
            .when("/social-media", {
                templateUrl: '/admin/templates/social-media.tmpl.html',
                controller: 'socialmediaCGController'
            })
			.when("/twitter-collections", {
                templateUrl: '/admin/templates/tweet-collections.tmpl.html',
                controller: 'twittercollectionsCGController'
            })
            .otherwise({redirectTo: '/social-media'});
    }
]);


app.controller('socialmediaCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("socialmedia", function (msg) {
            $scope.socialmedia = msg;
            $scope.socialmedia.scale = Number($scope.socialmedia.scalepc) / 100;			
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

app.controller('twittercollectionsCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("socialmedia", function (msg) {
            $scope.socialmedia = msg;	
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

