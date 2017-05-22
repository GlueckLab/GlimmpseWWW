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
        delete metaDataInstance.sharedCorrelation_Blank;
        delete metaDataInstance.sharedCorrelation_All;
        delete metaDataInstance.sharedMean_Blank;
        delete metaDataInstance.sharedMean_All;
        delete metaDataInstance.sharedRelativeGroupSize_Blank;
        delete metaDataInstance.sharedRelativeGroupSize_All;
    };

    /**
     * Rebuild the combination table for the predictors
     * (used by the relative group size and means screen)
     */
    metaDataInstance.updatePredictorCombinations = function() {
        /* calculate the total number of combinations */
        var totalCombinations = 1;
        for (var l = 0; l < studyDesignService.betweenParticipantFactorList.length; l++) {
            var len = studyDesignService.betweenParticipantFactorList[l].categoryList.length;
            if (len >= 2) {
                totalCombinations *= len;
            } else {
                // user has not completed predictor information, so don't build
                // the table
                return;
            }
        }

        // clear the list
        metaDataInstance.predictorCombinationList = [];

        var column;
        var j, jMax;
        var i, iMax;
        var r, rMax;

        // build the columns
        rMax = totalCombinations;
        for (var k = 0; k < studyDesignService.betweenParticipantFactorList.length; k++) {
            var categoryList = studyDesignService.betweenParticipantFactorList[k].categoryList;
            column = [];
            if (categoryList !== undefined && categoryList.length >= 2) {
                iMax = categoryList.length;
                jMax = totalCombinations / rMax;
                rMax /= iMax;
                for (j = 0; j < jMax; j++) {
                    for (i = 0; i < iMax; i++) {
                        var value = categoryList[i].category;
                        for (r = 0; r < rMax; r++) {
                            column.push(value);
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
        for (var l = 0; l < studyDesignService.repeatedMeasuresTree.length; l++) {
            totalCombinations *= studyDesignService.repeatedMeasuresTree[l].numberOfMeasurements;
        }

        var row;
        var j, jMax;
        var i, iMax;
        var r, rMax;

        // build the display header rows for the repeated measures
        rMax = totalCombinations;
        for (var k = 0; k < studyDesignService.repeatedMeasuresTree.length; k++) {
            var spacingList = studyDesignService.repeatedMeasuresTree[k].spacingList;
            row = [];
            if (spacingList !== undefined && spacingList.length >= 2) {
                iMax = spacingList.length;
                jMax = totalCombinations / rMax;
                rMax /= iMax;
                for (j = 0; j < jMax; j++) {
                    for (i = 0; i < iMax; i++) {
                        var value = spacingList[i].value;
                        for (r = 0; r < rMax; r++) {
                            row.push(value);
                        }
                    }
                }
            }
            metaDataInstance.responseCombinationList.push(row);
        }

        // build the display header row for the responses
        row = [];
        iMax = studyDesignService.responseList.length;
        jMax = totalCombinations / iMax;
        for (j = 0; j < jMax; j++) {
            for (i = 0; i < iMax; i++) {
                row.push(studyDesignService.responseList[i].name);
            }
        }
        metaDataInstance.responseCombinationList.push(row);
    };

    return metaDataInstance;
});
