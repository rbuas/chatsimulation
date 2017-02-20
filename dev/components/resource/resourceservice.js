ResourceService = (function(angular, app) {
    return app.service("ResourceService", ["$rootScope", "$http", function ($rootScope, $http) {
        var self = this;

        var resources = {};
        var state = {
            lang : "en",
            languages : ["en", "es", "fr", "pt"]
        };

        self.loadResLanguage = function (lang) {
            lang = lang || state.lang || "en";
            var langfile = "/resources/common-" + lang + ".json";

            if(resources[langfile])
                return resources[langfile];

            $http({
                method: "get",
                url: langfile,
                headers: {"Content-Type": "application/vnd.api+json"}
            }).then(function(response) {
                if (!response || !response.data) {
                    console.log("ERROR_COMMUNICATION");
                } else {
                    resources[langfile] = response.data;
                    state.common = resources[langfile];
                    $rootScope.$broadcast("common", state.common);
                }
            });
        }

        self.changeLanguage = function (lang) {
            if(!lang || state.languages.indexOf(lang) < 0)
                return;

            state.lang = lang;
            $rootScope.$broadcast("lang", lang);

            self.loadResLanguage();
        }

        self.text = function (key) {
            return state.common && state.common[key] || key;
        }
    }]);
})(angular, ChatApp);