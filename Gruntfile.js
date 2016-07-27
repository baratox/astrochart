"use strict";


module.exports = function(grunt) {
    // This is the default port that livereload listens on;
    // change it if you configure livereload to use another port.
    var LIVERELOAD_PORT = 35729;

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    var serveStatic = require('serve-static');
    var liveReload = require('connect-livereload')({ port: LIVERELOAD_PORT });

    grunt.initConfig({

        // Define Directory
        dirs: {
            js:     "src/js",
            build:  "dist"
        },

        // Metadata
        pkg: grunt.file.readJSON("package.json"),
        banner:
        "\n" +
        "/*\n" +
         " * -------------------------------------------------------\n" +
         " * Project: <%= pkg.title %>\n" +
         " * Version: <%= pkg.version %>\n" +
         " *\n" +
         " * Author:  <%= pkg.author.name %>\n" +
         " * Site:     <%= pkg.author.url %>\n" +
         " * Contact: <%= pkg.author.email %>\n" +
         " *\n" +
         " *\n" +
         " * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>\n" +
         " * -------------------------------------------------------\n" +
         " */\n" +
         "\n",

        // Copy static files
        copy: {
            main: {
                files: [{ 
                    expand: true, 
                    cwd: "src/image", 
                    src: ["*"], 
                    dest: "<%= dirs.build %>/image/" 
                  }, {
                    expand: true,
                    cwd: "<%= dirs.js %>",
                    src: "astrochart.js",
                    dest: "<%= dirs.build %>" }]
            }
        },

        // Minify and Concat archives
        uglify: {
            options: {
                mangle: false,
                banner: "<%= banner %>"
            },
            dist: {
              files: {
                  "<%= dirs.build %>/astrochart.min.js": "<%= dirs.js %>/astrochart.js"
              }
            }
        },

        // Notifications
        notify: {
          js: {
            options: {
              title: "Javascript - <%= pkg.title %>",
              message: "Minified and validated with success!"
            }
          }
        },

        connect: {
            main: {
                options: {
                    debug: true,
                    middleware: function (connect, options) {
                            return [
                                // Inject a livereloading script into static files.
                                liveReload,
                                // Serve static files.
                                serveStatic(".", {
                                    index: 'demo/AstroChart.html'
                                })
                            ];
                        },
                    open: true,
                    port: 9001,
                }
            }
        },

        watch: {
            // '**' is used to include all subdirectories
            // and subdirectories of subdirectories, and so on, recursively.
            files: ['src/**/*', 'demo/**/*'],
            tasks:["default"],
            options: {
              livereload:LIVERELOAD_PORT
            }
        }


    });


    // Register Taks
    // --------------------------

    // Observe changes, concatenate, minify and validate files
    grunt.registerTask( "default", [ "copy", "uglify", "notify:js" ]);

    grunt.registerTask( "serve", [ "default", "connect:main", "watch" ]);


};