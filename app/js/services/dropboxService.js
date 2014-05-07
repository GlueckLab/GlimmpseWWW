/*
 * GLIMMPSE (General Linear Multivariate Model Power and Sample size)
 * Copyright (C) 2013 Regents of the University of Colorado.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */


glimmpseApp.factory('dropboxService', function($http, $q, config, $window, glimmpseConstants){
    var dropboxServiceInstance = {};

    // Dropbox processing status
    dropboxServiceInstance.dropboxStatus = 'READY';

    dropboxServiceInstance.dropboxAuthCode = null;

    dropboxServiceInstance.dropboxServiceToken = null;

    dropboxServiceInstance.customURL = undefined;

    /**
     *  Access dropbox for saving the file
     */

    /**
     *
     * @param code
     */
    dropboxServiceInstance.setStatus = function(status) {
        dropboxServiceInstance.dropboxStatus = status;
    };

    /**
     *
     * @param code
     */
    dropboxServiceInstance.getStatus = function() {
        return(dropboxServiceInstance.dropboxStatus);
    };

    /**
     * Store the authentication code for the lifetime of the
     * application.
     * @param code
     */
    dropboxServiceInstance.storeCode = function(code) {
        dropboxServiceInstance.dropboxAuthCode = code;
    };

    /**
     * Store the access token for the lifetime of the
     * application.
     * @param code
     */
    dropboxServiceInstance.storeToken = function(token) {
        dropboxServiceInstance.dropboxServiceToken = token;
    };

    dropboxServiceInstance.getToken = function() {
        return(dropboxServiceInstance.dropboxServiceToken);
    };

    /**
     * Save the specified file to the user's dropbox
     */
    dropboxServiceInstance.saveFile = function(filename, data) {
        // save to the glimmpseDesigns folder
        var url = 'https://api-content.dropbox.com/1/files_put/dropbox/glimmpseDesigns/' +
            filename;

        //Creating a deferred object
        var deferred = $q.defer();

        // add authentication headers
        $http.defaults.headers.common.Authorization = 'Bearer ' + dropboxServiceInstance.dropboxServiceToken;

        //Calling Web API to fetch shopping cart items
        $http.post(url, data).success(function(response){
                //Passing data to deferred's resolve function on successful completion
                deferred.resolve(response);
            }).error(function(response) {
                //Sending a friendly error message in case of failure
                deferred.reject(response);
            });

        //Returning the promise object
        return deferred.promise;

    };


    /**
     * Save the specified file to the user's dropbox
     * We use Ajax calls here instead of the defer/promise mechanism
     * since this is called directly from javascript
     */
    dropboxServiceInstance.getStudyDesignFileList = function(successCallback, errorCallback) {

        // search existing glimmpseDesigns folder for .json files.
        $.ajax({
            type: 'POST',
            beforeSend: function (request)
            {
                request.setRequestHeader("Authorization", 'Bearer' + ' ' + dropboxServiceInstance.dropboxServiceToken);
            },
            url: 'https://api.dropbox.com/1/search/dropbox/glimmpseDesigns/',
            data: {query: ".json"},
            dataType: "json"
        }).done(function(response) {
                successCallback(response);
            }).fail(function(response) {
                errorCallback(response);
            });

    };


    /**
     * Save the specified file to the user's dropbox
     * We use Ajax calls here instead of the defer/promise mechanism
     * since this is called directly from javascript
     */
    dropboxServiceInstance.getFile = function(filename) {

        // save to the glimmpseDesigns folder
        var url = 'https://api-content.dropbox.com/1/files/dropbox/' +
            filename;

        //Creating a deferred object
        var deferred = $q.defer();

        // add authentication headers
        $http.defaults.headers.common.Authorization = 'Bearer ' + dropboxServiceInstance.dropboxServiceToken;

        //Calling Web API to fetch shopping cart items
        $http.get(url).success(function(response){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(response);
        }).error(function(response) {
                //Sending a friendly error message in case of failure
                deferred.reject(response);
            });

        //Returning the promise object
        return deferred.promise;

    };


    return dropboxServiceInstance;

});

