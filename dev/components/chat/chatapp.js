ChatApp = (function(angular) {
    var chatapp = angular.module("ChatApp", ["ngRoute", "ngResource", "ngCookies"]);

    chatapp.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "components/chat/chatapp.html",
                controller : "ChatController",
                controllerAs : "cac"
            })
            .otherwise({redirectTo:"/"});
            //$locationProvider.html5Mode(true);
    }]);

    return chatapp;
})(angular);