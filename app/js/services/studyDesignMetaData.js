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
glimmpseApp.factory('studyDesignMetaData', function($http, glimmpseConstants, studyDesignService) {
    var metaDataInstance = {};

    // TODO: migrate power curve information out of main study design
    // since it is all client-side now
    metaDataInstance.powerCurveDescription = {};

    // all permutations of predictor categories
    metaDataInstance.predictorPermutationList = [];


    /**
     * Rebuild the permutation table for the predictors
     * (used by the relative group size and means screen)
     */
    metaDataInstance.updatePredictorPermutations = function() {
        // clear the list
        metaDataInstance.predictorPermutationList = [];

        /* calculate the total number of permutations */
        var totalPermutations = 1;
        for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
            var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
            if (len >= 2 ) {
                totalPermutations = totalPermutations * len;
            } else {
                // user has not completed predictor information, so don't build
                // the table
                return;
            }
        }

        // now build the columns
        var numRepetitions = totalPermutations;
        for (var i = 0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
            var categoryList = studyDesignService.betweenParticipantFactorList[i].categoryList;
            var column = [];
            if (categoryList != undefined && categoryList.length >= 2) {
                numRepetitions /= categoryList.size();
                for(var perm = 0; perm < totalPermutations; ) {
                    for(var cat = 0; cat < categoryList.length; cat++) {
                        var value = categoryList[cat].value;
                        for(var rep = 0; rep < numRepetitions; rep++) {
                            column.push(value);
                            perm++;
                        }
                    }
                }
            }
            predictorPermutationList.push(column);
        }
    }

    return metaDataInstance;
});