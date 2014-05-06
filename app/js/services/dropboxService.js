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

    dropboxServiceInstance.dropboxAuthCode = undefined;

    dropboxServiceInstance.dropboxServiceToken = undefined;

    dropboxServiceInstance.fileListFromDropbox = null;

    dropboxServiceInstance.status = false;

    dropboxServiceInstance.studyDesignFileName = undefined;

    dropboxServiceInstance.resultsFileName = undefined;

    dropboxServiceInstance.customURL = undefined;

    dropboxServiceInstance.studyDesignData = undefined;

    dropboxServiceInstance.resultsData = undefined;

    /**
     *  Access dropbox for saving the file
     */

    /**
     * Store the authentication code for the lifetime of the
     * application.
     * @param code
     */
    dropboxServiceInstance.storeCode = function(code) {
        dropboxAuthCode = code;
    };

    /**
     * Store the authentication code for subsequent requests,
     * and get a new token.
     *
     * @param codeValue code obtained from the Oauth2 protocol
     * @returns {*}
     */
    dropboxServiceInstance.getToken = function() {

        //Creating a deferred object
        var deferred = $q.defer();

        var entityBody = {
            code: dropboxAuthCode,
            client_id: config.dropboxClientId,
            client_secret: config.dropboxClientSecret,
            redirect_uri: 'http://localhost',
            grant_type: 'authorization_code'
        };

        window.alert("BODY: " + angular.toJson(entityBody));
        //Calling Web API to fetch shopping cart items
        $http.post("https://api.dropbox.com/1/oauth2/token",
                angular.toJson(entityBody)).success(function(response){
                var accessTokenInfo = angular.parseJSON(response);
                // store the token
                dropboxServiceToken = accessTokenInfo.access_token;
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
     * Save the specified study design information to the user's dropbox
     */
    dropboxServiceInstance.saveStudyDesign = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(config.schemePower + config.hostPower + config.uriPower,
                studyDesignJSON).success(function(response){
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

