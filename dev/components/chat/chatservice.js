ChatService = (function(angular, jsext, app) {
    return app.service("ChatService", ["$rootScope", "$http", "$cookies", "$window", "$interval", "UserService", function ($rootScope, $http, $cookies, $window, $interval, UserService) {
        var self = this;

        var db = $cookies; //TODO : refact with bd interface and implementation in cookies - still ugly but at least aceptable

        var state = {
            history : []
        };

        self.connect = function () {
            self.readHistoryDB();

            self.pulling = $interval(function() { return self.verifyUpdates(); }, 2000);
        }

        self.deconnect = function() {
            if(!self.pulling)
                return;

            $interval.cancel(self.pulling);
        }

        self.readHistoryDB = function () {
            state.history = db.getObject("ca-history") || [];
        }

        self.writeHistoryDB = function (senddata) {
            db.putObject("ca-history", state.history);
        }

        self.sendMessage = function(message) {
            // test exceptions
            var loggedUser = UserService.loggedUser();
            if(!loggedUser)
                return "ERROR_MESSAGEWITHOUTUSER";

            if(!jsext.trim(message))
                return "ERROR_INVALIDMESSAGE";

            // send the message
            var date = new Date();
            var dateString = date.toISOString();
            var entry = {s:loggedUser, d:dateString, m:message};

            self.readHistoryDB();
            state.history.push(entry);
            self.writeHistoryDB();

            $rootScope.$broadcast("history", state.history);
        }

        self.verifyUpdates = function() {
            self.readHistoryDB();
            $rootScope.$broadcast("history", state.history);
        }
    }]);
})(angular, jsext, ChatApp);