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

/**
 * Global results object
 * Retrieved via JSON from the Power Web Service
 */


glimmpseApp.factory('powerService',function($http, $q, config, glimmpseConstants){
    var powerServiceInstance = {};

    // results from last call to one of the calculate functions
    powerServiceInstance.cachedResults = undefined;

    // error information from last call to one of the calculate functions
    powerServiceInstance.cachedError = undefined;

    // results from last call to get matrices
    powerServiceInstance.cachedMatrixHtml = undefined;

    // error information from last call to one of the calculate functions
    powerServiceInstance.cachedMatrixError = undefined;

    /**
     * Retrieve power results from the power service
     */
    powerServiceInstance.calculatePower = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(config.schemePower + config.hostPower + config.uriPower,
                studyDesignJSON).success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(data, status) {
            //Sending a friendly error message in case of failure
            deferred.reject(data != '' ? data : 'Error in retrieving results from "' + (config.schemePower + config.hostPower + config.uriPower) + '" (HTTP status code ' + status + ')');
        });

        //Returning the promise object
        return deferred.promise;
    };

    /**
     *  Retrieve sample size results from the power service
     */
    powerServiceInstance.calculateSampleSize = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(config.schemePower + config.hostPower + config.uriSampleSize,
                studyDesignJSON).success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(data, status) {
                //Sending a friendly error message in case of failure
                deferred.reject(data != '' ? data : 'Error in retrieving results (HTTP status code ' + status + ')');
            });

        //Returning the promise object
        return deferred.promise;
    };

    /**
     * Someday, this will do the Jiroutek math.
     * @param studyDesignJSON
     * @returns {*|Function|Function|Function|Function|Function|Function}
     */
    powerServiceInstance.calculateConfidenceIntervalWidth = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(config.schemePower + config.hostPower + config.uriCIWidth,
                studyDesignJSON).success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(data, status){
                //Sending a friendly error message in case of failure
                deferred.reject(data != '' ? data : 'Error in retrieving results (HTTP status code ' + status + ')');
            });

        //Returning the promise object
        return deferred.promise;
    };


    /**
     *  Retrieve sample size results from the power service
     */
    powerServiceInstance.getMatrices = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(config.schemePower + config.hostPower + config.uriMatrices,
                studyDesignJSON).success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(data, status){
                //Sending a friendly error message in case of failure
                deferred.reject(data != '' ? data : 'Error in retrieving results (HTTP status code ' + status + ')');
            });

        //Returning the promise object
        return deferred.promise;
    };


    /**
     * Clear cached results
     */
    powerServiceInstance.clearCache = function() {
        powerServiceInstance.cachedResults = undefined;
        powerServiceInstance.cachedError = undefined;
        powerServiceInstance.cachedMatrixHtml = undefined;
        powerServiceInstance.cachedMatrixError = undefined;
    };

    return powerServiceInstance;
});

