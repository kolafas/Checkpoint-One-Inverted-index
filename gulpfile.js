var gulp = require("gulp");
var browserSync = require("browser-sync");
var exec = require("child_process").exec;

gulp.task("default", ["BrowserTest","serveApp"]);

gulp.task('serveApp', function () {
    var f1 = browserSync.create();

    f1.init({
        server : {
            baseDir: "./public"
        },
        port : 3060,
        ui: {
            port:3020
        }
    });
    //watch for changes of html, css and js in the public folder.
    gulp.watch("./public/**/*.{html,js,css}").on("change", f1.reload);
});

gulp.task("BrowserTest", function () {
    var f2 = browserSync.create();

    f2.init({
        server: {
          baseDir: ["./public/src/", "./jasmine"],
          port: 3060,
          ui: {
              port: 3050
          }
      }
    });

    gulp.watch('./jasmine/spec/*.js').on("change",f2.reload);
    gulp.watch("./public/src/*.js").on("change", f2.reload);
});


