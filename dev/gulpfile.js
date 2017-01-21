var _gulp = require("gulp"); 
var _less = require("gulp-less");
var _minifyCSS = require("gulp-minify-css");
var _uglifyJS = require("gulp-uglify");
var _concat = require("gulp-concat");
var _path = require("path");
var _rename = require("gulp-rename");
var _gutil = require( "gulp-util" );
var _zip = require("gulp-zip");
var _jeditor = require("gulp-json-editor");
var _plumber = require("gulp-plumber");
var _exec = require("child_process").exec;
var _argv = require("yargs").argv;

var builder = {
    CONFIG : require('./gulpconfig.json'),
    VERSION : require("./version.json"),
    actions : {
        "default" : {
            action : function() { builder.man(); }, 
            help : "builder manual"
        },
        "build" : {
            action : function() { builder.build(); }, 
            help : "build all less and js"
        },
        "watch" : {
            action : function() { builder.watch(); }, 
            help : "watch all less and js files"
        }
    },
    process : {},

    watch : function () {
        builder.watchStyles();
        builder.watchScripts();
    },

    build : function () {
        builder.buildStyles();
        builder.buildScripts();
    },

    buildStyles : function (file) {
        builder.startProcess("buildstyles");

        return _gulp.src(file || builder.CONFIG.styleinput)
            .pipe(_less().on("error", function(err) {
                console.log(err);
                this.emit("end");
            }))
            .pipe(_gulp.dest(builder.CONFIG.styleoutput))
            .pipe(_minifyCSS())
            .pipe(_rename({suffix: ".min"}))
            .pipe(_gulp.dest(builder.CONFIG.styleoutput))
            .on("error", function(err) {
                console.log(err);
            })
            .on("end", function() {
                builder.endProcess("buildstyles");
            });
    },

    watchStyles : function () {
        return _gulp.watch(builder.CONFIG.stylefiles, function(event) {
            console.log("Builder::File " + event.path + " was " + event.type + "...");
            return builder.buildStyles();
        });
    },

    buildScripts : function () {
        builder.startProcess("buildscripts");

        return _gulp.src(builder.CONFIG.scriptfiles)
            .pipe(_plumber())
            .pipe(_concat(builder.CONFIG.scriptspack))
            .pipe(_gulp.dest(builder.CONFIG.scriptsoutput))
            .pipe(_uglifyJS({mangle:false}))
            .pipe(_rename({suffix: ".min"}))
            .pipe(_gulp.dest(builder.CONFIG.scriptsoutput))
            .on("end", function() {
                builder.endProcess("buildscripts");
            });
    },

    watchScripts : function () {
        return _gulp.watch(builder.CONFIG.scriptfiles, function(event) {
            console.log("Builder::File " + event.path + " was " + event.type + "...");
            return builder.buildScripts();
        });
    },

    pack : function () {
        return _gulp.src('../*')
            .pipe(_zip('pack.zip', false))
            .pipe(_gulp.dest('dist'));
    },



    initialize : function() {
        if(!builder || !builder.actions)
            return;

        console.log("gulp initialize ...");
        for(var actionname in builder.actions) {
            if(!builder.actions.hasOwnProperty(actionname))
                continue;

            var aconfig = builder.actions[actionname];
            if(!aconfig || !aconfig.action)
                continue;

            _gulp.task(actionname, aconfig.action);
        }
    },

    man : function () {
        if(!builder || !builder.actions)
            return;

        console.log("---------------------------------------");
        console.log("Actions manual :");
        console.log("---------------------------------------");
        for(var actionname in builder.actions) {
            if(!builder.actions.hasOwnProperty(actionname))
                continue;

            var aconfig = builder.actions[actionname];
            if(!aconfig || !aconfig.action)
                continue;

            var tab = (actionname.length > 7) ? "\t\t: " : "\t\t\t: ";
            var help = aconfig.help || "";
            console.log(actionname + tab, help);
        }
        console.log("---------------------------------------");
    },

    startProcess : function(action) {
        if(!action || !builder || !builder.process)
            return;

        var start = new Date();
        builder.process[action] = start;
        var time = builder.formatDate(start);
        console.log("[" + time + "] Builder::Starting : '" + action + "' ...");
    },

    endProcess : function(action) {
        if(!action || !builder || !builder.process)
            return;

        var start = builder.process[action];
        builder.process[action] = null;
        delete builder.process[action];
        var end = new Date();
        var diff = Math.floor((end - start)/1000);
        var time = builder.formatDate(end);

        console.log("[" + time + "] Builder::Finished : '" + action + "' (" + diff + "s)");
    },

    formatDate : function(date) {
        if(!date)
            return "";

        var y = date.getFullYear();
        var M = (1 + date.getMonth());
        var d = date.getDate();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        if(M < 10) M = "0" + M;
        if(d < 10) d = "0" + d;
        if(h < 10) h = "0" + h;
        if(m < 10) m = "0" + m;
        if(s < 10) s = "0" + s;

        return "" + y + M + d + ":" + h + ":" + m + ":" + s;
    },

    createDate : function(str) {
        if(!str)
            return;

        var year = str.substring(0, 4);
        var month = str.substring(4, 2);
        var day = str.substring(6, 2);
        var hours = str.substring(8, 2) || "00";
        var minutes = str.substring(10, 2) || "00";
        var seconds = str.substring(12, 2) || "00";
        return new Date(year, month, day, hours, minutes, seconds);
    },

    saveFile : function(filename, data) {
        _gulp.src("./" + filename)
          .pipe(_jeditor(data))
          .pipe(_gulp.dest("./" + filename));
    }
}
builder.initialize();