var gulp = require("gulp");
var browserSync = require("browser-sync");
var exec = require("child_process").exec;

gulp.task("default", ["serveApp"]);

gulp.task('serveApp', function () {
    var f1 = browserSync.create();

    f1.init({
        server : {
            baseDir: "./public"
        },
        port : 3000,
        ui: {
            port:3020
        }
    });
    //watch for changes of html, css and js in the public folder.
    gulp.watch("./public/**/*.{html, css, js}").on("change", f1.reload);
});

