//
// GLIMMPSE (General Linear Multivariate Model Power and Sample size)
// Copyright (C) 2013 Regents of the University of Colorado.
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

// Grunt file
module.exports = function(grunt) {

    // load options
    if (grunt.option('mobileDefaults')) {
        // set standard defaults for mobile
        if (!grunt.option('hostPower')) {
            grunt.option('hostPower', 'glimmpse.samplesizeshop.org');
        }
        if (!grunt.option('hostFile')) {
            grunt.option('hostFile', 'glimmpse.samplesizeshop.org');
        }
        if (!grunt.option('hostScripts')) {
            // we need the trailing slash only on the scripts host
            grunt.option('hostScripts', 'glimmpse.samplesizeshop.org/');
        }
        if (!grunt.option('schemePower')) {
            grunt.option('schemePower', 'http://');
        }
        if (!grunt.option('schemeFile')) {
            grunt.option('schemeFile', 'http://');
        }
        if (!grunt.option('schemeScripts')) {
            grunt.option('schemeScripts', 'http://');
        }
    } else {
        if (!grunt.option('hostPower')) {
            grunt.option('hostPower', '');
        }
        if (!grunt.option('hostFile')) {
            grunt.option('hostFile', '');
        }
        if (!grunt.option('hostScripts')) {
            grunt.option('hostScripts', '');
        }
        if (!grunt.option('schemePower')) {
            grunt.option('schemePower', '');
        }
        if (!grunt.option('schemeFile')) {
            grunt.option('schemeFile', '');
        }
        if (!grunt.option('schemeScripts')) {
            grunt.option('schemeScripts', '');
        }
    }



    grunt.log.writeln("Building release for hosts power=" +
        grunt.option('hostPower') +
        ", file=" + grunt.option('hostFile') +
        ", and scripts=" + grunt.option('hostScripts')
    );

    // initialize tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                configFile: 'karma.config.js'
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'app/js/**/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'karma']
        },


        // Empties folders to start fresh
        clean: {
            tmp: ['.tmp'],
            www: ['build/www'],
            dist: ['build/dist'],
            artifacts: ['build/artifacts/**']
        },
        // copy the files needed for production release
        copy: {
            dist: {
                files: [
                    {expand: true, flatten: true, src: ['app/*.html'], dest: 'build/dist/', filter: 'isFile'},
                    {expand: true, flatten: true, src: ['app/fonts/**'], dest: 'build/dist/fonts'},
                    {expand: true, flatten: true, src: ['app/img/**'], dest: 'build/dist/img'},
                    {expand: true, flatten: true, src: ['app/partials/**'], dest: 'build/dist/partials'},
                    {expand: true, flatten: true, src: ['app/templates/**'], dest: 'build/dist/templates'},
                    {expand: true, flatten: true, src: ['app/*.php'], dest: 'build/dist/'}
                ]
            },
            libs: {
                cwd: 'app/lib/',
                expand: true,
                src: ['MathJax/**', 'PHPMailer/**'],
                dest: 'build/dist/lib/'
            },
            config: {
                files: [
                    {expand: false, flatten: true, src: ['build/config.xml'], dest: 'build/dist/config.xml'}
                ]
            },
            www: {
                files: [
                    {expand: true, cwd: 'build/dist/', src: ['**'], dest: 'build/www/'},
                    {expand: true, flatten: true, src: ['resources/icons/GlimmpseIcon*.png'], dest: 'build/www/res/icons/'},
                    {expand: true, flatten: true, src: ['resources/icons/*.png'], dest: 'build/www/res/screen/'}
                ]
            },
            // hack to avoid uglify problem in usemin
            minfiles: {
                files: [
                    {expand: true, flatten: true, src: ['.tmp/concat/js/*'], dest: 'build/dist/js'}
                ]
            }
        },
        replace: {
            hosts: {
                src: ['build/dist/js/glimmpse.js'], // source files array (supports minimatch)
                overwrite: true,
                replacements: [
                    {
                        from: "hostPower: ''",
                        to: "hostPower: '<%= grunt.option('hostPower') %>'"
                    },
                    {
                        from: "hostFile: ''",
                        to: "hostFile: '<%= grunt.option('hostFile') %>'"
                    },
                    {
                        from: "hostScripts: ''",
                        to: "hostScripts: '<%= grunt.option('hostScripts') %>'"
                    },
                    {
                        from: "schemePower: ''",
                        to: "schemePower: '<%= grunt.option('schemePower') %>'"
                    },
                    {
                        from: "schemeFile: ''",
                        to: "schemeFile: '<%= grunt.option('schemeFile') %>'"
                    },
                    {
                        from: "schemeScripts: ''",
                        to: "schemeScripts: '<%= grunt.option('schemeScripts') %>'"
                    }
                ]
            },
            mobile: {
                src: ['build/dist/js/glimmpse.js'], // source files array (supports minimatch)
                overwrite: true,
                replacements: [
                    {
                        from: "isMobile: false",
                        to: "isMobile: true"
                    }
                ]
            },
            phonegapjs: {
                src: ["build/dist/index.html"],
                overwrite: true,
                replacements: [
                    {
                        from: '<!-- PHONEGAPJS -->',
                        to: '<script type="text/javascript" charset="utf-8" src="cordova.js"></script>'
                    }
                ]
            },
            version: {
                src: ['build/dist/index.html', 'build/dist/feedback.html', 'build/dist/config.xml'],
                overwrite: true,
                //dest: 'build/dist/',  // destination directory or file
                replacements: [
                    {
                        from: '@VERSION@',                   // string replacement
                        to: '<%= pkg.version %>'
                    }
                ]
            }
        },
        // cleanup the scripts and includes to use minified, concatenated files
        useminPrepare: {
            html: ['app/index.html','app/feedback.html'],
            options: {
                dest: 'build/dist'
            }
        },
        usemin: {
            html: ['build/dist/index.html','build/dist/feedback.html']
        },
        // build the release distribution to install on the server
        zip: {
            'glimmpse': {
                cwd: 'build/dist/',
                src: ['build/dist/**'],
                dest: 'build/artifacts/glimmpsewww-<%= pkg.version %>.zip'
            },
            'glimmpse-mobile': {
                cwd: 'build/www/',
                src: ['build/www/**'],
                dest: 'build/artifacts/glimmpsewww-mobile-<%= pkg.version %>.zip'
            }
        },
        // builds the app in phonegap remotely
        exec: {
            phonegap_ios: {
                cwd: 'build',
                command: 'phonegap remote build ios'
            },
            phonegap_android: {
                cwd: 'build',
                command: 'phonegap remote build android'
            },
            phonegap_blackberry: {
                cwd: 'build',
                command: 'phonegap remote build blackberry'
            },
            phonegap_symbian: {
                cwd: 'build',
                command: 'phonegap remote build symbian'
            },
            phonegap_wp7: {
                cwd: 'build',
                command: 'phonegap remote build wp7'
            },
            phonegap_wp8: {
                cwd: 'build',
                command: 'phonegap remote build wp8'
            }
        },
        // note: at present, you need to unlock the keys online
        "phonegap-build": {
            debug: {
                options: {
                    archive: "build/artifacts/glimmpsewww-mobile-<%= pkg.version %>.zip",
                    "appId": "704192",
                    "user": {
                        "email": "samplesizeshop@gmail.com",
                        "password": "<%= grunt.option('pgPassword') %>"
                    },
                    download: {
                        ios: 'build/artifacts/ios-debug.ipa',
                        android: 'build/artifacts/android-debug.apk'
                    }
                }
            },
            release: {
                options: {
                    timeout: 300000,
                    archive: "build/artifacts/glimmpsewww-mobile-<%= pkg.version %>.zip",
                    "appId": "704192",
                    "user": {
                        "email": "samplesizeshop@gmail.com",
                        "password": "<%= grunt.option('pgPassword') %>"
                    },
                    download: {
                        ios: 'build/artifacts/glimmpse-ios-<%= pkg.version %>.ipa',
                        android: 'build/artifacts/glimmpse-android-<%= pkg.version %>.apk'
                    }
                }
            }
        }

    });


    // load modules
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-phonegap-build');

    // builds the release distribution of the code
    grunt.registerTask('release',
        [
            'jshint',
            'clean',
            'copy:dist',
            'copy:libs',
            'useminPrepare',
            'concat',
            'cssmin',
            'copy:minfiles',
            'usemin',
            'replace:hosts',
            'replace:version',
            'zip:glimmpse'
        ]
    );
    // creates a release distribution in the www directory
    // and runs phonegap build remotely
    grunt.registerTask('phonegap',
        [
            'jshint',
            'clean',
            'copy:dist',
            'copy:libs',
            'copy:config',
            'useminPrepare',
            'concat',
            'cssmin',
            'copy:minfiles',
            'usemin',
            'replace',
            'copy:www',
            'zip:glimmpse-mobile',
            'phonegap-build:release'
        ]
    );
    //grunt.registerTask('build_mobile', ['release']);
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('default', [
        'jshint',
        'clean',
        'copy:dist',
        'useminPrepare',
        'concat',
        'cssmin',
        'copy:minfiles',
        'usemin',
        'zip:glimmpse'
    ]);

};
