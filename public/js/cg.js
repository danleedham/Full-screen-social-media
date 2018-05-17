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