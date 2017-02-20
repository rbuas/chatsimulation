UserService = (function(angular, jsext, app) {
    return app.service("UserService", ["$rootScope", "$http", "$cookies", "$window", "$interval", function ($rootScope, $http, $cookies, $window, $interval) {
        var self = this;

        var db = $cookies; //TODO : refact with bd interface and implementation in cookies - still ugly but at least aceptable

        var state = {
            loggedUser : "",
            users : []
        };

        self.connect = function () {
            self.readUsersDB();

            self.pulling = $interval(function() { return self.verifyUpdates(); }, 2000);
        }

        self.deconnect = function() {
            if(self.pulling)
                $interval.cancel(self.pulling);

            if(!state.loggedUser)
                return;

            self.readUsersDB();
            var userIndex = state.users.indexOf(state.loggedUser);
            if(userIndex < 0)
                return;

            state.users.splice(userIndex, 1);
            self.writeUsersDB();
        }

        self.readUsersDB = function () {
            state.users = db.getObject("ca-users") || [];
        }

        self.writeUsersDB = function (senddata) {
            db.putObject("ca-users", state.users);
        }

        self.register = function (nickname) {
            // test basic exceptions
            if(!jsext.trim(nickname))
                return "ERROR_NICKNAME";

            if(state.loggedUser)
                return "ERROR_HASUSER";

            if(state.loggedUser == nickname)
                return "ERROR_USERTWICE";

            // test registered user
            self.readUsersDB();
            if(state.users.indexOf(nickname) >= 0)
                return "ERROR_USERLOGGED";

            // register a new user
            state.loggedUser = nickname;
            state.users.push(nickname);
            self.writeUsersDB();

            $rootScope.$broadcast("user", state.loggedUser);
            $rootScope.$broadcast("users", state.users);
        }

        self.loggedUser = function() {
            return state.loggedUser;
        }

        self.verifyUpdates = function() {
            var oldUserCount = state.users.length;
            self.readUsersDB();
            var userCount = state.users.length;

            if(oldUserCount != userCount) $rootScope.$broadcast("users", state.users);
        }
    }]);
})(angular, jsext, ChatApp);