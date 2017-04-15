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
     * Retrieve results from the power service.
     */
    powerServiceInstance._retrieveResults = function(studyDesignJSON, uri) {
        //Create a deferred object.
        var deferred = $q.defer();

        //Call the web API.
        $http.post(config.schemePower + config.hostPower + uri,
                studyDesignJSON).success(function(data){
            //Pass data to deferred object's resolve function on successful completion.
            deferred.resolve(data);
        }).error(function(data, status) {
            //Send a friendly error message in case of failure.
            deferred.reject(data !== '' ? data : 'Error in retrieving results (HTTP status code ' + status + ').');
        });

        //Return the promise object.
        return deferred.promise;
    };

    /**
     * Retrieve power results from the power service.
     */
    powerServiceInstance.calculatePower = function(studyDesignJSON) {
        return powerServiceInstance._retrieveResults(studyDesignJSON, config.uriPower);
    };

    /**
     *  Retrieve sample size results from the power service.
     */
    powerServiceInstance.calculateSampleSize = function(studyDesignJSON) {
        return powerServiceInstance._retrieveResults(studyDesignJSON, config.uriSampleSize);
    };

    /**
     *  Retrieve matrices results from the power service.
     */
    powerServiceInstance.getMatrices = function(studyDesignJSON) {
        return powerServiceInstance._retrieveResults(studyDesignJSON, config.uriMatrices);
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
