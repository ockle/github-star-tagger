module.exports = function(grunt) {
  grunt.initConfig({
    ngtemplates: {
      githubStarTagger: {
        cwd: 'src/',
        src: 'templates/*',
        dest: 'build/templates.js',
        options: {
          htmlmin: {
            removeComments: true,
            collapseWhitespace: true
          }
        }
      }
    },
    concat: {
      build: {
        src: ['src/js/app.js', 'src/js/controllers.js', 'src/js/directives.js', 'src/js/services.js', 'src/js/filters.js', 'build/templates.js'],
        dest: 'build/concat.js',
      }
    },
    ngmin: {
      build: {
        src: 'build/concat.js',
        dest: 'build/ngmin.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        src: 'build/ngmin.js',
        dest: 'dist/js/app.min.js'
      }
    },
    clean: ['build/'],
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'src/index.html'
        }
      }
    },
    cssmin: {
      build: {
        files: {
          'dist/css/app.min.css': 'src/css/app.css'
        }
      }
    },
    bowercopy: {
      options: {
        runBower: false
      },
      css: {
        options: {
          destPrefix: 'public/css'
        },
        files: {
          'bootstrap.min.css': 'bootstrap/dist/css/bootstrap.min.css',
          'font-awesome.min.css': 'fontawesome/css/font-awesome.min.css',
          'selectize.bootstrap3.css': 'selectize/dist/css/selectize.bootstrap3.css'
        }
      },
      js: {
        options: {
          destPrefix: 'public/js'
        },
        files: {
          'bootstrap.min.js': 'bootstrap/dist/js/bootstrap.min.js',
          'angular.min.js': 'angular/angular.min.js',
          'jquery.min.js': 'jquery/dist/jquery.min.js',
          'selectize.min.js': 'selectize/dist/js/standalone/selectize.min.js',
          'ui-bootstrap-tpls.min.js': 'angular-bootstrap/ui-bootstrap-tpls.min.js',
          'ui-bootstrap.min.js': 'angular-bootstrap/ui-bootstrap.min.js'
        }
      },
      fonts: {
        options: {
          destPrefix: 'public/fonts'
        },
        files: {
          '': 'fontawesome/fonts/*'
        }
      }
    },
    copy: {
      install: {
        files: [
          {
            src: 'dist/js/*',
            dest: 'public/js/',
            expand: true,
            flatten: true
          },
          {
            src: 'dist/css/*',
            dest: 'public/css/',
            expand: true,
            flatten: true
          },
          {
            src: 'dist/index.html',
            dest: 'public/index.html'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['ngtemplates', 'concat', 'ngmin', 'uglify', 'clean', 'htmlmin', 'cssmin']);
  grunt.registerTask('install', ['bowercopy', 'copy']);
};
