ChatController = (function(angular, app) {
    return app.controller("ChatController", ["$scope", "$http", "$location", "$interval", "$window", "ChatService", "ResourceService", function ($scope, $http, $location, $interval, $window, ChatService, ResourceService) {
        var cac = $scope;
        cac.newMessage = "";
        cac.messageError = "";
        cac.status = "WAITING";
        cac.history = [];

        cac.i = function (key) {
            return ResourceService.text(key);
        }

        cac.changeLanguage = function (lang) {
            if(!lang)
                return;

            ResourceService.changeLanguage(lang);
        }

        cac.updateLanguage = function(e, lang) {
            cac.lang = lang;
        }

        cac.updateCommon = function(e, common) {
            cac.status = common != null ? "READY" : "ERROR";
        }

        cac.ready = function() {
            return cac.status == "READY";
        }

        cac.updateState = function() {
            cac.updateHistory();
        }

        cac.sendMessage = function () {
            debugger;
            var error = ChatService.sendMessage(cac.newMessage);
            if(error) {
                cac.messageError = error;
                return;
            }

            cac.messageError = "";
            cac.newMessage = "";
        }

        cac.updateHistory = function (e, history) {
            var oldHistoryCount = cac.history.length;
            var historyCount = history.length;
            if(oldHistoryCount == historyCount)
                return;

            cac.history = Object.assign({}, history);
        }



        // listeners 

        cac.$on("lang", cac.updateLanguage );
        cac.$on("common", cac.updateCommon );
        cac.$on("history", cac.updateHistory );
        cac.$on("user", function(e, loggedUser) { cac.loggedUser = loggedUser; });

        ResourceService.loadResLanguage();
        ChatService.connect();
        $window.addEventListener("beforeunload", function() { 
            return ChatService.deconnect(); 
        });
    }]);
})(angular, ChatApp);