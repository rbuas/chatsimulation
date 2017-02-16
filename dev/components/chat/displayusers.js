ChatDisplayUsers = (function(angular, app) {
    return app.directive("chatDisplayUsers", function () {
        return {
            restrict : "AE",
            templateUrl : "/components/chat/displayusers.html",
            scope : true
        }
    });
})(angular, ChatApp);