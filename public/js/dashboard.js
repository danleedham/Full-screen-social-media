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
            name: 'General Settings',
            url: '/settings',
            type: 'link',
            icon: 'black settings',
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
			.when("/settings", {
                templateUrl: '/admin/templates/settings.tmpl.html',
                controller: 'settingsCGController'
            })
            .otherwise({redirectTo: '/social-media'});
    }
]);


app.controller('socialmediaCGController', ['$scope', 'socket', 'localStorageService',
    function($scope, socket, localStorageService) {
       
        var stored = localStorageService.get('socialmedia');
        
        socket.on("socialmedia", function (msg) {
            if(msg === "hide"){
                $scope.socialmedia.lastVisibility = false;
            } else { 
                if(msg.lastVisibility !== false){
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
                }
            }
        });

        $scope.$watch('socialmedia', function() {
            if ($scope.socialmedia) {
                if($scope.autoUpdate !== false){
                    socket.emit("socialmedia", $scope.socialmedia);
                }
            } else {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }
        
        $scope.show = function() {
            console.log($scope.socialmedia);
            $scope.socialmedia.lastVisibility = true;
            socket.emit('socialmedia', $scope.socialmedia);
        };
        
         $scope.hide = function() {
            console.log("Hide");
            $scope.socialmedia.lastVisibility = false;
            socket.emit('socialmedia', 'hide');
        };

    }
]);

app.controller('settingsCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("settings", function (msg) {
            $scope.settings = msg;	
        });

        $scope.$watch('settings', function() {
            if ($scope.settings) {
                socket.emit("settings", $scope.settings);
            } else {
                getSettingsData();
            }
        }, true);

        function getSettingsData() {
            socket.emit("settings:get");
        }

    }
]);

