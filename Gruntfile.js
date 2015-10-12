/**
  @fileoverview main Grunt task file
  **/
  'use strict';

  var fs = require("fs")
  , path = require("path");

  module.exports = function (grunt) {

    grunt.initConfig({
      dust: {

        defaults: {
          options:{
            wrapper: false,
            useBaseName: true
          },
          files: {
            "public/views/views.js": "views/**/*.dust"
          }
        }
      },

      watch:{
        dust: {
          files: ['views/**/*.dust'],
          tasks: ['dust'],
          options: {
            interrupt: true
          }
        }
      }
      

    });

    grunt.loadNpmTasks("grunt-dust");
    grunt.loadNpmTasks('grunt-contrib-watch');

   // Default task(s).
   grunt.registerTask('default', ['dust']);
 };
