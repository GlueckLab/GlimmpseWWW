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
 * Service managing the study design object
 * Currently resides fully on the client side
 */
glimmpseApp.factory('studyDesignMetaData', function(glimmpseConstants, studyDesignService) {
    var metaDataInstance = {};

    // TODO: migrate power curve information out of main study design
    // since it is all client-side now
    metaDataInstance.plotOptions = {
        xAxis: glimmpseConstants.xAxisTotalSampleSize,
        availableDataSeries: []
    };

    // all combinations of predictor categories
    metaDataInstance.predictorCombinationList = [];

    // all combinations of response variables and
    metaDataInstance.responseCombinationList = [];

    /**
     * Clear the meta data
     */
    metaDataInstance.reset = function() {
        metaDataInstance.plotOptions = {
            xAxis: glimmpseConstants.xAxisTotalSampleSize,
            availableDataSeries: []
        };
        metaDataInstance.predictorCombinationList = [];
        metaDataInstance.responseCombinationList = [];
    };

    /**
     * Return the number of predictor combinations
     */
    metaDataInstance.getNumberOfPredictorCombinations = function() {
        if (metaDataInstance.predictorCombinationList.length > 0) {
            return metaDataInstance.predictorCombinationList[0].length;
        } else {
            return 1;
        }
    };

    /**
     * Return the number of predictor combinations
     */
    metaDataInstance.getNumberOfResponseCombinations = function() {
        if (metaDataInstance.responseCombinationList.length > 0) {
            return metaDataInstance.responseCombinationList[0].length;
        } else {
            return 0;
        }
    };

    /**
     * Rebuild the permutation table for the predictors
     * (used by the relative group size and means screen)
     */
    metaDataInstance.updatePredictorCombinations = function() {
        // clear the list
        metaDataInstance.predictorCombinationList = [];

        /* calculate the total number of combinations */
        var totalCombinations = 1;
        for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
            var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
            if (len >= 2 ) {
                totalCombinations = totalCombinations * len;
            } else {
                // user has not completed predictor information, so don't build
                // the table
                return;
            }
        }

        // now build the columns
        var numRepetitions = totalCombinations;
        for (var j = 0; j < studyDesignService.betweenParticipantFactorList.length; j++) {
            var categoryList = studyDesignService.betweenParticipantFactorList[j].categoryList;
            var column = [];
            if (categoryList !== undefined && categoryList.length >= 2) {
                numRepetitions /= categoryList.length;
                for(var combo = 0; combo < totalCombinations; ) {
                    for(var cat = 0; cat < categoryList.length; cat++) {
                        var value = categoryList[cat].category;
                        for(var rep = 0; rep < numRepetitions; rep++) {
                            column.push(value);
                            combo++;
                        }
                    }
                }
            }
            metaDataInstance.predictorCombinationList.push(column);
        }
    };


    /**
     * Rebuild the combination table for the responses
     * Unlike the predictors, the responses are organized into rows
     */
    metaDataInstance.updateResponseCombinations = function() {
        // clear the list
        metaDataInstance.responseCombinationList = [];

        /* calculate the total number of combinations */
        var totalCombinations = studyDesignService.responseList.length;
        if (totalCombinations === 0) {
            // if there are no response variables, we can't build the table
            return;
        }
        // multiply the repeated measures onto the total response count
        for (var i = 0; i < studyDesignService.repeatedMeasuresTree.length; i++) {
            totalCombinations = totalCombinations *
                studyDesignService.repeatedMeasuresTree[i].numberOfMeasurements;
        }

        // now build the display headers for the repeated measures
        var numRepetitions = totalCombinations;
        for (var rmIdx = 0; rmIdx < studyDesignService.repeatedMeasuresTree.length; rmIdx++) {
            var rmFactor = studyDesignService.repeatedMeasuresTree[rmIdx];
            var spacingList = rmFactor.spacingList;
            var row = [];
            if (spacingList !== undefined && spacingList.length >= 2) {
                numRepetitions = numRepetitions / spacingList.length;
                for(var combo = 0; combo < totalCombinations; ) {
                    for(var spacingIdx = 0; spacingIdx < spacingList.length; spacingIdx++) {
                        for(var rep = 0; rep < numRepetitions; rep++) {
                            row.push(spacingList[spacingIdx].value);
                            combo++;
                        }
                    }
                }
            }
            metaDataInstance.responseCombinationList.push(row);
        }
        // build the rows for the responses
        var responseRow = [];
        numRepetitions = totalCombinations / studyDesignService.responseList.length;
        for(var repIdx = 0; repIdx < numRepetitions; repIdx++) {
            for(var responseIdx = 0; responseIdx < studyDesignService.responseList.length; responseIdx++) {
                responseRow.push(studyDesignService.responseList[responseIdx].name);
            }
        }
        metaDataInstance.responseCombinationList.push(responseRow);

    };

    return metaDataInstance;
});
