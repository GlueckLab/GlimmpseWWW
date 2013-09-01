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


glimmpseApp.factory('powerService',function($http, $q){
    var powerServiceInstance = {};

    // URI of power service
    powerServiceInstance.apiPath = '/power/';

    // results from last call to one of the calculate functions
    powerServiceInstance.cachedResults = undefined;

    // error information from last call to one of the calculate functions
    powerServiceInstance.cachedError = undefined;

    /**
     * Retrieve power results from the power service
     */
    powerServiceInstance.calculatePower = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();
        window.alert("sending power");
        //Calling Web API to fetch shopping cart items
        $http.post(this.apiPath + "power", studyDesignJSON).success(function(response){
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
     *  Retrieve sample size results from the power service
     */
    powerServiceInstance.calculateSampleSize = function(studyDesignJSON) {
        //Creating a deferred object
        var deferred = $q.defer();

        //Calling Web API to fetch shopping cart items
        $http.post(this.apiPath + "samplesize").success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(){
                //Sending a friendly error message in case of failure
                deferred.reject("An error occured while fetching items");
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
        $http.post(this.apiPath + "ciwidth").success(function(data){
            //Passing data to deferred's resolve function on successful completion
            deferred.resolve(data);
        }).error(function(){
                //Sending a friendly error message in case of failure
                deferred.reject("An error occured while fetching items");
            });

        //Returning the promise object
        return deferred.promise;
    };

    return powerServiceInstance;
});

