jsext = (function () {
    jsext = {
        isNullOrUndefined : function (variable){
            return (typeof (variable) === "undefined" || variable === null)
        },

        getObjectValues : function (dataObject) {
            if (!dataObject)
                return;
            var dataArray = Object.keys(dataObject).map(function (k) { return dataObject[k] });
            return dataArray;
        },

        serializeDictionary : function (obj, connector) {
            if (!obj)
                return;

            connector = connector || ",";
            var builder = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i) || typeof (i) === 'function') continue;

                builder.push(i + "=" + obj[i]);
            }
            return builder.join(connector);
        },

        buildUrl : function (link, params, starter) {
            var serializedParams = typeof (params) == "string" ? params : _querystring.stringify(params);
            var url = link || "";
            if (serializedParams) {
                starter = starter || "?";
                if (url.indexOf(starter) < 0) {
                    url += starter + serializedParams;
                } else {
                    url = url.endsWith("&") ? url + serializedParams : url + "&" + serializedParams;
                }
            }

            return url;
        },

        first : function (obj) {
            for (var i in obj) {
                if (!obj.hasOwnProperty(i) || typeof (i) === 'function') continue;

                return obj[i];
            }
        },

        trim : function (text) {
            return text && text.replace(/^\s+|\s+$/g, '');
        },

        escape : function (text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },

        format : function (format, args) {
            if(!format) 
                return;

            for (var i = 0; i < args.length; i++) {
                var replacement = '{' + i + '}';
                format = format.replace(replacement, args[i]);
            }
            return format;
        },

        unique : function (arr) {
            var a = arr.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }
            return a;
        },

        removeArray : function (arr, killer) {
            var a = arr.concat();
            for (var i = 0; i < killer.length; ++i) {
                var val = killer[i];
                var index = a.indexOf(val);
                if (index >= 0) {
                    a.splice(index, 1);
                }
            }
            return a;
        },

        tryParseDate : function (sDate) {
            return (
                sDate.constructor === Date ? sDate :
                sDate.constructor === Array ? new Date(sDate[0], sDate[1], sDate[2]) :
                sDate.constructor === Number ? new Date(sDate) :
                sDate.constructor === String ? new Date(sDate) :
                typeof sDate === "object" ? new Date(sDate.year, sDate.month, sDate.date) :
                NaN
            );
        },

        parseDate : function (sDate) {
            var date = sDate ? this.tryParseDate(sDate) : new Date();
            return date.toISOString();
        },

        parseDateGMT : function (sDate) {
            var date = sDate ? this.tryParseDate(sDate) : new Date();
            return date.toGMTString()
        },

        parseDateGMTAddDays : function (sDate, days) {
            var date = sDate ? this.tryParseDate(sDate) : new Date();
            if (!days)
                return date.toGMTString()

            date.addDays(days);
            return date.toGMTString();
        },

        parseDateGMTAddHours : function (sDate, hours) {
            var date = sDate ? this.tryParseDate(sDate) : new Date();
            if (!hours)
                return date.toGMTString()

            date.addHours(hours);
            return date.toGMTString();
        },

        parseDateDDMMYYY : function (sDate, separator) {
            if(!sDate)
                return;

            var dateParts = sDate.split(separator || "/");
            if (!dateParts || dateParts.length != 3)
                return;

            var dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            return dateObj;
        },

        dateToString : function (date) {
            if(!date)
                return;

            var dd = date.getDate();
            var mm = date.getMonth()+1; //January is 0!

            var yyyy = date.getFullYear();
            if(dd < 10) dd ='0'+dd;
            if(mm < 10) mm ='0'+mm;
            var stringDate = dd + '/' + mm + '/' + yyyy;
            return stringDate;
        },

        compareDate : function (a, b) {
            //  -1 : if a < b
            //   0 : if a = b
            //   1 : if a > b
            return (
                isFinite(a = this.formatDate(a).valueOf()) &&
                isFinite(b = this.formatDate(b).valueOf()) ?
                (a > b) - (a < b) :
                NaN
            );
        },

        inRangeDate : function (d, start, end) {
            // Checks if date in d is between dates in start and end.
            // Returns a boolean or NaN:
            //    true  : if d is between start and end (inclusive)
            //    false : if d is before start or after end
            //    NaN   : if one or more of the dates is illegal.
            // NOTE: The code inside isFinite does an assignment (=).
            return (
                isFinite(d = this.formatDate(d).valueOf()) &&
                isFinite(start = this.formatDate(start).valueOf()) &&
                isFinite(end = this.formatDate(end).valueOf()) ?
                start <= d && d <= end :
                NaN
            );
        },

        getMonthName : function (lang) {
            var monthTab;
            switch (lang) {
                case 'fr':
                    monthTab = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
                    break;
                case 'en':
                default:
                    monthTab = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    break;
            }
            return monthTab;
        },

        getCurrentMonthName : function (lang) {
            if (!lang) lang = "en";
            var today = new Date();
            var monthes = this.getMonthName(lang);
            return monthes[today.getMonth()];
        }
    }

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return jsext.trim(this);
        }
    }

    if(!Function.prototype.extends) {
        Function.prototype.extends = function (ParentClass) {
            if (ParentClass.constructor == Function) {
                this.prototype = new ParentClass;
                this.prototype.constructor = this;
                this.prototype.parent = ParentClass.prototype;
            } else {
                this.prototype = ParentClass;
                this.prototype.constructor = this;
                this.prototype.parent = ParentClass;
            }
        }
    }
 
    if(!String.prototype.format) {
        String.prototype.format = function () {
            return jsext.format(this, arguments);
        }
    }
    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        }
    }

    if(!RegExp.escape) {
        RegExp.escape = function (text) {
            return jsext.escape(text);
        }
    }

    if(!Array.prototype.unique) {
        Array.prototype.unique = function () {
            return jsext.unique(this);
        }
    }

    if(!Array.prototype.removeArray) {
        Array.prototype.removeArray = function (killer) {
            return jsext.removeArray(this, killer);
        }
    }

    if(!Date.prototype.addHours) {
        Date.prototype.addHours = function(h) {    
            this.setTime(this.getTime() + (parseInt(h)*60*60*1000)); 
            return this;   
        }
    }

    if(!Date.prototype.addDays) {
        Date.prototype.addDays = function (days) {
            this.setTime(this.getTime() + (parseInt(days) * 24 * 60 * 60 * 1000));
            return this;
        }
    }

    if(!Date.prototype.minusHours) {
        Date.prototype.minusHours = function (h) {
            this.setTime(this.getTime() - (parseInt(h) * 60 * 60 * 1000));
            return this;
        }
    }

    if(!Date.prototype.minusDays) {
        Date.prototype.minusDays = function (days) {
            this.setTime(this.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
            return this;
        }
    }

    return jsext;
})();
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
ChatDisplayUsers = (function(angular, app) {
    return app.directive("chatDisplayUsers", function () {
        return {
            restrict : "AE",
            templateUrl : "/components/chat/displayusers.html",
            scope : true
        }
    });
})(angular, ChatApp);