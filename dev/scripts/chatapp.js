ChatApp = (function($, angular) {
    var chatapp = angular.module("ChatApp", ["ngRoute", "ngResource", "ngCookies"]);

    chatapp.state = {
        loggedUser : "",
        common : {},
        ready : false,
        users : [],
        history : []
    };

    chatapp.broadcast = function (event, data) {
        var self = this;
        if(!self.root || !self.state.ready)
            return;

        //DEBUG console.log("ChatApp::broadcast: ", event, data);
        self.root.$broadcast(event, data);
    }

    chatapp.request = function(path, data) {
        var self = this;
        return self.res({
                method: "get",
                url: path,
                data: data,
                headers: {"Content-Type": "application/vnd.api+json"}
        });
    }

    chatapp.connect = function () {
        var self = this;
        self.updateFromDB();
        self.request("/common.json").then(function(response) {
            if (!response || !response.data) {
                console.log("ERROR_COMMUNICATION");
            } else {
                self.state.ready = true;
                self.state.common = response.data;
                self.broadcast("common", response.data);
            }
        });
        self.pulling = self.interval(function() { return self.broadcastUpdates(); }, 2000);
    }

    chatapp.deconnect = function() {
        var self = this;
        if(self.pulling)
            self.interval.cancel(self.pulling);

        if(!self.hasLoggedUser())
            return;

        self.updateFromDB();
        var userIndex = self.state.users.indexOf(self.state.loggedUser);
        if(userIndex < 0)
            return;

        self.state.users.splice(userIndex, 1);
        self.updateDB();
    }

    chatapp.common = function (key) {
        var self = this;
        return self.state.common && self.state.common[key] || key;
    }

    chatapp.broadcastUpdates = function(sameInstanceCall) {
        var self = this;

        var oldUserCount = self.state.users.length;
        var oldHistoryCount = self.state.history.length;
        if(!sameInstanceCall) self.updateFromDB();
        var userCount = self.state.users.length;
        var historyCount = self.state.history.length;

        if(sameInstanceCall || oldHistoryCount != historyCount) self.broadcast("history", self.state.history);
        if(sameInstanceCall || oldUserCount != userCount) self.broadcast("users", self.state.users);
    }

    chatapp.updateFromDB = function () {
        var self = this;
        self.state.users = self.db.getObject("ca-users") || [];
        self.state.history = self.db.getObject("ca-history") || [];
    }

    chatapp.updateDB = function (senddata) {
        var self = this;
        self.db.putObject("ca-users", self.state.users);
        self.db.putObject("ca-history", self.state.history);
    }

    chatapp.register = function (nickname) {
        var self = this;

        // test exceptions

        if(!trim(nickname))
            return "Invalid nickname, please try another one.";

        if(self.state.loggedUser)
            return "Instance with registered user, please open another window to chat with a new user.";

        if(self.state.loggedUser == nickname)
            return "You are already logged. What do you do here ?";

        if(self.state.users.indexOf(nickname) >= 0)
            return "There is already a user connected with this nickname, please try again with another nickname.";

        // register a new user

        self.state.loggedUser = nickname;

        self.updateFromDB();
        self.state.users.push(nickname);
        self.updateDB();
        self.broadcastUpdates(true);
    }

    chatapp.hasLoggedUser = function () {
        var self = this;
        return self.state.loggedUser ? true : false;
    }

    chatapp.sendMessage = function(message) {
        var self = this;

        // test exceptions

        if(!trim(message))
            return "Invalid message, please write a valid message.";

        if(!self.hasLoggedUser())
            return "I'm sorry, I cant delivery your message, please try again.";

        // send the message
        var date = new Date();
        var dateString = date.toISOString();
        var entry = {s:self.state.loggedUser, d:dateString, m:message};

        self.updateFromDB();
        self.state.history.push(entry);
        self.updateDB();
        self.broadcastUpdates(true);
    }

    chatapp.start = function () {
        var self = this;
        self.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
            $routeProvider
                .when("/", {
                    templateUrl : "views/chatapp.html",
                    controller : "ChatAppController",
                    controllerAs : "cac"
                })
                .otherwise({redirectTo:"/"});

            //$locationProvider.html5Mode(true);
        }]);
        self.run(["$rootScope", "$http", "$cookies", "$window", "$interval", function ($rootScope, $http, $cookies, $window, $interval) {
            self.root = $rootScope;
            self.db = $cookies;
            self.res = $http;
            self.interval = $interval;
            self.state.ready = false;
            self.connect();
            $window.addEventListener("beforeunload", function() { return self.deconnect(); });
        }]);
    }

    chatapp.start();

    chatapp.controller("ChatAppController", ["$scope", "$http", "$location", "$interval", function ($scope, $http, $location, $interval) {
        var cac = this;

        cac.initialize =  function () {
            cac.registerError = "";
            cac.newMessage = "";
            cac.messageError = "";
            cac.updateState();
        }

        cac.I = function (key) {
            return chartapp.coomon(key);
        }

        cac.register = function() {
            cac.registerError = chatapp.register(cac.userNickname);
            cac.updateUserState();
        }

        cac.updateState = function() {
            cac.updateCommon();
            cac.updateHistory();
            cac.updateUserState();
        }

        cac.updateCommon = function(e, common) {
            cac.ready = chatapp.state.ready;
        }

        cac.updateUserState = function () {
            cac.loggedUser = chatapp.state.loggedUser;
            cac.hasUser = chatapp.hasLoggedUser();
            cac.updateUsers(null, chatapp.state.users);
        }

        cac.updateUsers = function (e, users) {
            cac.users = users;
        }

        cac.sendMessage = function () {
            var error = chatapp.sendMessage(cac.newMessage);
            if(error) {
                cac.messageError = error;
                return;
            }

            cac.messageError = "";
            cac.newMessage = "";
        }

        cac.updateHistory = function (e, history) {
            cac.history = Object.assign({}, history);
        }

        $scope.$on("common", cac.updateCommon );
        $scope.$on("history", cac.updateHistory );
        $scope.$on("users", cac.updateUsers );

        cac.initialize();
    }]);

    function trim (text) {
        return text && text.replace(/^\s+|\s+$/g, '');
    }

    return chatapp;
})(jQuery, angular);