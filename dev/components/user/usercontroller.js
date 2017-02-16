UserController = (function(angular, app) {
    return app.controller("UserController", ["$scope", "$http", "$location", "$interval", "$window", "UserService", function ($scope, $http, $location, $interval, $window, UserService) {
        var uc = $scope;
        uc.registerError = "";
        uc.loggedUser = null;

        uc.register = function() {
            uc.registerError = UserService.register(uc.userNickname);
        }

        uc.updateUserState = function (loggedUser) {
            uc.loggedUser = loggedUser;
        }

        uc.updateUsers = function (e, users) {
            uc.users = users;
        }



        // listeners 

        uc.$on("users", uc.updateUsers );
        uc.$on("user", uc.updateUserState );

        UserService.connect();
        $window.addEventListener("beforeunload", function() { 
            return UserService.deconnect(); 
        });
    }]);
})(angular, ChatApp);