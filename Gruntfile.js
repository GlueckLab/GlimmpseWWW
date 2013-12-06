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
    if (!grunt.option('hostPower')) {
        grunt.option('hostPower', 'localhost');
    }
    if (!grunt.option('hostFile')) {
        grunt.option('hostFile', 'localhost');
    }

    grunt.log.writeln("Building release for hosts power=" +
        grunt.option('hostPower') +
        ", and file=" + grunt.option('hostFile')
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
                    {expand: true, flatten: true, src: ['app/templates/**'], dest: 'build/dist/templates'}
                ]
            },
            www: {
                files: [
                    {expand: true, cwd: 'build/dist/', src: ['**'], dest: 'build/www/'}
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
            config: {
                src: ['build/dist/js/glimmpse.js'], // source files array (supports minimatch)
                overwrite: true,
                replacements: [
                    {
                        from: "hostPower: 'localhost'",
                        to: "hostPower: '<%= grunt.option('hostPower') %>'"
                    },
                    {
                        from: "hostFile: 'localhost'",
                        to: "hostFile: '<%= grunt.option('hostFile') %>'"
                    }
                ]
            },
            version: {
                src: ['build/dist/index.html', 'build/dist/feedback.html'], // source files array (supports minimatch)
                dest: 'build/dist/',  // destination directory or file
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

    // builds the release distribution of the code
    grunt.registerTask('release',
        [
            'jshint',
            'clean',
            'copy:dist',
            'useminPrepare',
            'concat',
            'cssmin',
            'copy:minfiles',
            'usemin',
            'replace',
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
            'replace',
            'useminPrepare',
            'concat',
            'cssmin',
            'copy:minfiles',
            'usemin',
            'copy:www',
            'exec:phonegap_ios',
            'exec:phonegap_android'
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