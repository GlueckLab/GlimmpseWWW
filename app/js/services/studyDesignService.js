/*
 * GLIMMPSE (General Linear Multivariate Model Power and Sample size)
 * Copyright (C) 2016 Regents of the University of Colorado.
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
glimmpseApp.factory('studyDesignService', function(glimmpseConstants, matrixUtilities) {
    var studyDesignInstance = {};

    /* Unique id for the study design */
    studyDesignInstance.uuid = [];

    /** The name. */
    studyDesignInstance.name = null;

    /** Flag indicating if the user wishes to control for a
     * Gaussian covariate
     * */
    studyDesignInstance.gaussianCovariate = false;

    /** Indicates what the user is solving for */
    studyDesignInstance.solutionTypeEnum = glimmpseConstants.solutionTypePower;

    /** The term to be used for a participant in the study */
    studyDesignInstance.participantLabel = null;

    /** Indicates whether the design was built in matrix or guided mode */
    studyDesignInstance.viewTypeEnum = null;

    /** The confidence interval descriptions. */
    studyDesignInstance.confidenceIntervalDescriptions = null;

    /** The power curve descriptions. */
    studyDesignInstance.powerCurveDescriptions = null;

    /* separate sets for list objects */
    /** The alpha list. */
    studyDesignInstance.alphaList = [];

    /** The beta scale list. */
    studyDesignInstance.betaScaleList = [];

    /** The sigma scale list. */
    studyDesignInstance.sigmaScaleList = [];

    /** The relative group size list. */
    studyDesignInstance.relativeGroupSizeList = [];

    /** The sample size list. */
    studyDesignInstance.sampleSizeList = [];

    /** The statistical test list. */
    studyDesignInstance.statisticalTestList = [];

    /** The power method list. */
    studyDesignInstance.powerMethodList = [];

    /** The quantile list. */
    studyDesignInstance.quantileList = [];

    /** The nominal power list. */
    studyDesignInstance.nominalPowerList = [];

    /** The response list. */
    studyDesignInstance.responseList = [];

    /** The between participant factor list. */
    studyDesignInstance.betweenParticipantFactorList = [];

    /** The repeated measures tree. */
    studyDesignInstance.repeatedMeasuresTree = [];

    /** The clustering tree. */
    studyDesignInstance.clusteringTree = [];

    /** The hypothesis. */
    studyDesignInstance.hypothesis = [
        {
            idx: 1,
            type: glimmpseConstants.hypothesisGrandMean,
            betweenParticipantFactorMapList: [],
            repeatedMeasuresMapTree: []
        }
    ];

    /** The covariance. */
    studyDesignInstance.covariance = [];

    /** The matrix set. */
    studyDesignInstance.matrixSet = [];

    /*** Methods ***/

    /**
     * Extract study design information from the uploaded study design
     * @param designJSON
     */
    studyDesignInstance.fromJSON = function(designJSON) {

        var object = angular.fromJson(designJSON);

        // read uuid
        if (object.hasOwnProperty("uuid")) {
            studyDesignInstance.uuid = object.uuid;
        } else {
            throw "no uuid";
        }

        // read name
        if (object.hasOwnProperty("name")) {
            studyDesignInstance.name = object.name;
        } else {
            throw "no name";
        }

        // read covariate flag
        if (object.hasOwnProperty("gaussianCovariate") &&
            (object.gaussianCovariate === true || object.gaussianCovariate === false )) {
            studyDesignInstance.gaussianCovariate = object.gaussianCovariate;
        } else {
            throw "no or invalid gaussianCovariate";
        }

        // read solution type flag
        if (object.hasOwnProperty("solutionTypeEnum") &&
            (object.solutionTypeEnum == glimmpseConstants.solutionTypePower ||
                object.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize )) {
            studyDesignInstance.solutionTypeEnum = object.solutionTypeEnum;
        } else {
            throw "no or invalid solutionTypeEnum";
        }

        // The term to be used for a participant in the study
        if (object.hasOwnProperty("participantLabel")) {
            studyDesignInstance.participantLabel = object.participantLabel;
        } else {
            throw "no participantLabel";
        }

        // view type enum
        if (object.hasOwnProperty("viewTypeEnum") &&
            (object.viewTypeEnum == glimmpseConstants.modeGuided ||
                object.viewTypeEnum == glimmpseConstants.modeMatrix)) {
            studyDesignInstance.viewTypeEnum = object.viewTypeEnum;
        } else {
            throw "no or invalid viewTypeEnum";
        }

        // CI description
        if (object.hasOwnProperty("confidenceIntervalDescriptions")) {
            studyDesignInstance.confidenceIntervalDescriptions = object.confidenceIntervalDescriptions;
        } else {
            throw "no confidenceIntervalDescriptions";
        }

        // power curve description
        if (object.hasOwnProperty("powerCurveDescriptions")) {
            studyDesignInstance.powerCurveDescriptions = object.powerCurveDescriptions;
        } else {
            throw "no powerCurveDescriptions";
        }

        // alpha list
        if (object.hasOwnProperty("alphaList") &&
            (object.alphaList === null || object.alphaList instanceof Array)) {
            if (object.alphaList === null) {
               studyDesignInstance.alphaList = [];
            } else {
               studyDesignInstance.alphaList = object.alphaList;
            }
        } else {
            throw "no or invalid alphaList";
        }

        // beta scale list
        if (object.hasOwnProperty("betaScaleList") &&
            (object.betaScaleList === null || object.betaScaleList instanceof Array)) {
            if (object.betaScaleList === null) {
                studyDesignInstance.betaScaleList = [];
            } else {
                studyDesignInstance.betaScaleList = object.betaScaleList;
            }
        } else {
            throw "no or invalid betaScaleList";
        }

        // sigma scale list
        if (object.hasOwnProperty("sigmaScaleList") &&
            (object.sigmaScaleList === null || object.sigmaScaleList instanceof Array)) {
            if (object.sigmaScaleList === null) {
                studyDesignInstance.sigmaScaleList = [];
            } else {
                studyDesignInstance.sigmaScaleList = object.sigmaScaleList;
            }
        } else {
            throw "no or invalid sigmaScaleList";
        }

        // relative group size list
        if (object.hasOwnProperty("relativeGroupSizeList") &&
            (object.relativeGroupSizeList === null || object.relativeGroupSizeList instanceof Array)) {
            if (object.relativeGroupSizeList === null) {
                studyDesignInstance.relativeGroupSizeList = [];
            } else {
                studyDesignInstance.relativeGroupSizeList = object.relativeGroupSizeList;
            }
        } else {
            throw "no or invalid relativeGroupSizeList";
        }

        // per group sample size list
        if (object.hasOwnProperty("sampleSizeList") &&
            (object.sampleSizeList === null || object.sampleSizeList instanceof Array)) {
            if (object.sampleSizeList === null) {
                studyDesignInstance.sampleSizeList = [];
            } else {
                studyDesignInstance.sampleSizeList = object.sampleSizeList.map(function(e, idx) {
                    var v = e.value;
                    return {
                        idx: idx,
                        value:    typeof v !== 'number' ? 2
                                : v < 2                 ? 2
                                : v > 2147483647        ? 2147483647
                                :                         Math.floor(v)
                    };
                });
            }
        } else {
            throw "no or invalid sampleSizeList";
        }

        // statistical test list
        if (object.hasOwnProperty("statisticalTestList") &&
            (object.statisticalTestList === null || object.statisticalTestList instanceof Array)) {
            if (object.statisticalTestList === null) {
                studyDesignInstance.statisticalTestList = [];
            } else {
                studyDesignInstance.statisticalTestList = object.statisticalTestList;
            }
        } else {
            throw "no or invalid statisticalTestList";
        }

        // power method list
        if (object.hasOwnProperty("powerMethodList") &&
            (object.powerMethodList === null || object.powerMethodList instanceof Array)) {
            if (object.powerMethodList === null) {
                studyDesignInstance.powerMethodList = [];
            } else {
                studyDesignInstance.powerMethodList = object.powerMethodList;
            }
        } else {
            throw "no or invalid powerMethodList";
        }

        // quantile list
        if (object.hasOwnProperty("quantileList") &&
            (object.quantileList === null || object.quantileList instanceof Array)) {
            if (object.quantileList === null) {
                studyDesignInstance.quantileList = [];
            } else {
                studyDesignInstance.quantileList = object.quantileList;
            }
        } else {
            throw "no or invalid quantileList";
        }

        // nominal power list
        if (object.hasOwnProperty("nominalPowerList") &&
            (object.nominalPowerList === null || object.nominalPowerList instanceof Array)) {
            if (object.nominalPowerList === null) {
                studyDesignInstance.nominalPowerList = [];
            } else {
                studyDesignInstance.nominalPowerList = object.nominalPowerList;
            }
        } else {
            throw "no or invalid nominalPowerList";
        }

        // response list
        if (object.hasOwnProperty("responseList") &&
            (object.responseList === null || object.responseList instanceof Array)) {
            if (object.responseList === null) {
                studyDesignInstance.responseList = [];
            } else {
                studyDesignInstance.responseList = object.responseList;
            }
        } else {
            throw "no or invalid responseList";
        }

        // between participant factor list
        if (object.hasOwnProperty("betweenParticipantFactorList") &&
            (object.betweenParticipantFactorList === null || object.betweenParticipantFactorList instanceof Array)) {
            if (object.betweenParticipantFactorList === null) {
                studyDesignInstance.betweenParticipantFactorList = [];
            } else {
                studyDesignInstance.betweenParticipantFactorList = object.betweenParticipantFactorList;
            }
        } else {
            throw "no or invalid betweenParticipantFactorList";
        }

        // repeated measures tree
        if (object.hasOwnProperty("repeatedMeasuresTree") &&
            (object.repeatedMeasuresTree === null || object.repeatedMeasuresTree instanceof Array)) {
            if (object.repeatedMeasuresTree === null) {
                studyDesignInstance.repeatedMeasuresTree = [];
            } else {
                studyDesignInstance.repeatedMeasuresTree = object.repeatedMeasuresTree;
                for(var ii = 0; ii < studyDesignInstance.repeatedMeasuresTree.length; ii++) {
                    var factor = studyDesignInstance.repeatedMeasuresTree[ii];
                    if (factor.spacingList === null) {
                        factor.spacingList = [
                            {idx: 1, value: 1},
                            {idx: 2, value: 2}
                        ];
                    }
                }
            }
        } else {
            throw "no or invalid repeatedMeasuresTree";
        }

        // clustering tree
        if (object.hasOwnProperty("clusteringTree") &&
            (object.clusteringTree === null || object.clusteringTree instanceof Array)) {
            if (object.clusteringTree === null) {
                studyDesignInstance.clusteringTree = [];
            } else {
                studyDesignInstance.clusteringTree = object.clusteringTree;
            }
        } else {
            throw "no or invalid clusteringTree";
        }

        // hypothesis
        if (object.hasOwnProperty("hypothesis") &&
            (object.hypothesis === null || object.hypothesis instanceof Array)) {
            if (object.hypothesis === null || object.hypothesis.length === 0) {
                // default to grand mean
                studyDesignInstance.hypothesis = [
                    {
                        idx: 1,
                        type: glimmpseConstants.hypothesisGrandMean,
                        betweenParticipantFactorMapList: [],
                        repeatedMeasuresMapTree: []
                    }
                ];
            } else {
                /* the hypothesis contains object references, so we need to fill these
                 * in by hand. This ensures that the factor lists and the hypothesis
                 * factor maps point to the same object
                 *
                 * In future, we should find a more elegant solution
                 */
                var tmpHypothesis = object.hypothesis[0];
                if (studyDesignInstance.repeatedMeasuresTree.length > 0) {
                    // disallow MANOVA hypothesis for now; switch to incomplete interaction hypothesis
                    if (tmpHypothesis.type == glimmpseConstants.hypothesisManova) {
                        tmpHypothesis.type = glimmpseConstants.hypothesisInteraction;
                    }
                }
                if (tmpHypothesis.repeatedMeasuresMapTree === null) {
                    tmpHypothesis.repeatedMeasuresMapTree = [];
                }
                if (tmpHypothesis.betweenParticipantFactorMapList === null) {
                    tmpHypothesis.betweenParticipantFactorMapList = [];
                }
                studyDesignInstance.hypothesis = [
                    {
                        idx: 1,
                        type: tmpHypothesis.type,
                        betweenParticipantFactorMapList: [],
                        repeatedMeasuresMapTree: []
                    }
                ];

                if (tmpHypothesis.betweenParticipantFactorMapList !== undefined) {
                    for(var b = 0; b < tmpHypothesis.betweenParticipantFactorMapList.length; b++) {
                        var factorMap = tmpHypothesis.betweenParticipantFactorMapList[b];
                        var betweenFactor =
                            studyDesignInstance.getBetweenFactorByJson(angular.toJson(factorMap.betweenParticipantFactor));
                        if (betweenFactor !== undefined) {
                            studyDesignInstance.hypothesis[0].betweenParticipantFactorMapList.push({
                                type: factorMap.type == 'ALL_POLYNOMIAL' ? glimmpseConstants.trendNone : factorMap.type,
                                betweenParticipantFactor: betweenFactor
                            });
                        }
                    }
                }
                if (tmpHypothesis.repeatedMeasuresMapTree !== undefined) {
                    for(var w = 0; w < tmpHypothesis.repeatedMeasuresMapTree.length; w++) {
                        var rmFactorMap = tmpHypothesis.repeatedMeasuresMapTree[w];
                        var rmFactor =
                            studyDesignInstance.getWithinFactorByJson(angular.toJson(rmFactorMap.repeatedMeasuresNode));
                        if (rmFactor !== undefined) {
                            studyDesignInstance.hypothesis[0].repeatedMeasuresMapTree.push({
                                type: rmFactorMap.type == 'ALL_POLYNOMIAL' ? glimmpseConstants.trendNone : rmFactorMap.type,
                                repeatedMeasuresNode: rmFactor
                            });
                        }
                    }
                }
            }
        } else {
            throw "no or invalid hypothesis";
        }

        // covariance
        if (object.hasOwnProperty("covariance") &&
            (object.covariance === null || object.covariance instanceof Array)) {
            if (object.covariance === null) {
                studyDesignInstance.covariance = [];
            } else {
                studyDesignInstance.covariance = object.covariance;
                for(var i = 0; i < studyDesignInstance.covariance.length; i++) {
                    var covar = studyDesignInstance.covariance[i];
                    /* fixes for designs uploaded from GLIMMPSE 2.0.1 - can have invalid
                     * standard deviation list or blob data.
                     */
                    // fix standard deviation
                    if (covar.standardDeviationList === null) {
                        covar.standardDeviationList = [];
                    }
                    if (covar.rows != covar.standardDeviationList.length) {
                        covar.standardDeviationList = [];
                        for(var j = 0; j < covar.rows; j++) {
                            covar.standardDeviationList.push({idx: 0, value: 1});
                        }
                    }
                    // fix data
                    if (covar.blob === null) {
                        covar.blob = {
                            data: []
                        };
                        for(var r = 0; r < covar.rows; r++) {
                            var row = [];
                            for(var c = 0; c < covar.columns; c++) {
                                row.push((r == c ? 1 : 0));
                            }
                            covar.blob.data.push(row);
                        }
                    }

                }
            }
        } else {
            throw "no or invalid covariance";
        }

        // matrices
        if (object.hasOwnProperty("matrixSet") &&
            (object.matrixSet === null || object.matrixSet instanceof Array)) {
            if (object.matrixSet === null) {
                studyDesignInstance.matrixSet = [];
            } else {
                studyDesignInstance.matrixSet = object.matrixSet;
            }
        } else {
            throw "no or invalid matrixSet";
        }

        /*
            Other parts of the code seem to assume that the response covariance
            appears last in the studyDesignInstance.covariance array, after all
            the repeated measures covariances.

            However, we have seen some JSON where this is not the case. I am not
            sure how that JSON was created. Regardless, we must deal with it.

            To deal with it, we reorder the elements of studyDesignInstance.co-
            variance here, so that the repeated measures covariances appear
            first and in the same order as the elements of the studyDesign-
            Instance.repeatedMeasuresTree array, and the response covariance
            appears last.
        */

        // Convenience variables.
        var rmt = studyDesignInstance.repeatedMeasuresTree;
        var nrc = studyDesignInstance.responseList.length > 0 ? 1 : 0;
        var cov = studyDesignInstance.covariance;

        // Check for length compatibility.
        if (cov.length != rmt.length + nrc) {
            throw cov.length + " covariances instead of " + rmt.length + " + " + nrc;
        }

        // Function to look up a covariance by name.
        var covarianceByName = function(name) {
            return cov.find(function(o) { return o.name === name; });
        };

        // Do the reordering of the repeated measures covariances.
        var cov2 = [];
        var z;
        for (var k = 0; k < rmt.length; ++ k) {
            z = covarianceByName(rmt[k].dimension);
            if (typeof z === 'undefined') {
                throw "no covariance named '" + rmt[k].dimension + "'";
            }
            cov2.push(z);
        }

        if (nrc > 0) {
            // Add on the response covariance.
            z = covarianceByName(glimmpseConstants.covarianceResponses);
            if (typeof z === 'undefined') {
                throw "no covariance named '" + glimmpseConstants.covarianceResponses + "'";
            }
            cov2.push(z);
        }

        // Record the result.
        studyDesignInstance.covariance = cov2;
    };

    /**
     * Get the between participant factor object which matches the specified json
     */
    studyDesignInstance.getBetweenFactorByJson = function(factorJson) {
        for(var i = 0; i < studyDesignInstance.betweenParticipantFactorList.length; i++) {
            var factor = studyDesignInstance.betweenParticipantFactorList[i];
            if (factorJson == angular.toJson(factor)) {
                return factor;
            }
        }
        return undefined;
    };

    /**
     * Get the repeated measures object which matches the specified json
     */
    studyDesignInstance.getWithinFactorByJson = function(factorJson) {
        for(var i = 0; i < studyDesignInstance.repeatedMeasuresTree.length; i++) {
            var factor = studyDesignInstance.repeatedMeasuresTree[i];
            if (factorJson == angular.toJson(factor)) {
                return factor;
            }
        }
        return undefined;
    };

    /*
    * Convenience routine to determine if a power method is
    * in the list
     */
    studyDesignInstance.getPowerMethodIndex = function(powerMethod) {
        for(var i = 0; i < studyDesignInstance.powerMethodList.length; i++) {
            var method = studyDesignInstance.powerMethodList[i];
            if (method.powerMethodEnum == powerMethod) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Reset the study design instance to the default state
     */
    studyDesignInstance.reset = function() {

        studyDesignInstance.uuid = [];
        studyDesignInstance.name = null;
        studyDesignInstance.gaussianCovariate = false;
        studyDesignInstance.solutionTypeEnum = glimmpseConstants.solutionTypePower;
        studyDesignInstance.participantLabel = null;
        studyDesignInstance.viewTypeEnum = null;
        studyDesignInstance.confidenceIntervalDescriptions = null;
        studyDesignInstance.powerCurveDescriptions = null;
        studyDesignInstance.alphaList = [];
        studyDesignInstance.betaScaleList = [];
        studyDesignInstance.sigmaScaleList = [];
        studyDesignInstance.relativeGroupSizeList = [];
        studyDesignInstance.sampleSizeList = [];
        studyDesignInstance.statisticalTestList = [];
        studyDesignInstance.powerMethodList = [];
        studyDesignInstance.quantileList = [];
        studyDesignInstance.nominalPowerList = [];
        studyDesignInstance.responseList = [];
        studyDesignInstance.betweenParticipantFactorList = [];
        studyDesignInstance.repeatedMeasuresTree = [];
        studyDesignInstance.clusteringTree = [];
        studyDesignInstance.hypothesis = [
            {
                idx:1,
                type: glimmpseConstants.hypothesisGrandMean,
                betweenParticipantFactorMapList:[],
                repeatedMeasuresMapTree:[]
            }
        ];
        studyDesignInstance.covariance = [];
        studyDesignInstance.matrixSet = [
            {
                idx:0,
                name: glimmpseConstants.matrixThetaNull,
                rows: 1,
                columns: 1,
                data: {
                    data:[[0]]
                }
            }
        ];
    };

    /**
     * Initialize the default matrices.
     */
    studyDesignInstance.initializeDefaultMatrices = function() {
        studyDesignInstance.matrixSet = [];

        if (studyDesignInstance.viewTypeEnum === glimmpseConstants.modeMatrix) {
            // default design matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixXEssence,
                rows: glimmpseConstants.matrixDefaultN,
                columns: glimmpseConstants.matrixDefaultQ,
                data: {
                    data: [[1,0],[0,1]]
                }
            });
            // default beta matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixBeta,
                rows: glimmpseConstants.matrixDefaultQ,
                columns: glimmpseConstants.matrixDefaultP,
                data: {
                    data: [[1],[0]]
                }
            });
            // default between participant contrast (C) matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixBetweenContrast,
                rows: glimmpseConstants.matrixDefaultA,
                columns: glimmpseConstants.matrixDefaultQ,
                data: {
                    data: [[1, -1]]
                }
            });
            // default within participant contrast (U) matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixWithinContrast,
                rows: glimmpseConstants.matrixDefaultP,
                columns: glimmpseConstants.matrixDefaultB,
                data: {
                    data: [[1]]
                }
            });
            // default null hypothesis (theta null) matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixThetaNull,
                rows: glimmpseConstants.matrixDefaultA,
                columns: glimmpseConstants.matrixDefaultB,
                data: {
                    data: [[0]]
                }
            });
            // default error covariance (sigma E) matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixSigmaE,
                rows: glimmpseConstants.matrixDefaultP,
                columns: glimmpseConstants.matrixDefaultP,
                data: {
                    data: [[1]]
                }
            });
        } else {
            // default beta matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixBeta,
                rows: 1,
                columns: 0,
                data: {
                    data: [[]]
                }
            });
            // default null hypothesis (theta null) matrix
            studyDesignInstance.matrixSet.push({
                idx: 0,
                name: glimmpseConstants.matrixThetaNull,
                rows: 1,
                columns: 1,
                data: {
                    data:[[0]]
                }
            });
        }
    };

    /**
     * Retrieve a matrix by name
     */
    studyDesignInstance.getMatrixByName = function(name) {
        for(var i = 0; i < studyDesignInstance.matrixSet.length; i++) {
            var matrix = studyDesignInstance.matrixSet[i];
            if (matrix.name == name) {
                return matrix;
            }
        }
    };

    /**
     * Remove a matrix by name
     */
    studyDesignInstance.removeMatrixByName = function(name) {
        for(var i = 0; i < studyDesignInstance.matrixSet.length; i++) {
            var matrix = studyDesignInstance.matrixSet[i];
            if (matrix.name == name) {
                studyDesignInstance.matrixSet.splice(i,1);
            }
        }
    };


    /**
     * Get the total number of responses
     */
    studyDesignInstance.getNumberOfResponses = function() {
        // calculate the total number of observations on a given independent sampling unit
        var numResponses = studyDesignInstance.responseList.length;
        for(var rmi = 0; rmi < studyDesignInstance.repeatedMeasuresTree.length; rmi++) {
            var rmNode = studyDesignInstance.repeatedMeasuresTree[rmi];
            if (rmNode.numberOfMeasurements !== undefined) {
                numResponses *= rmNode.numberOfMeasurements;
            }
        }
        return numResponses;
    };

    /**
     * Get a covariance object by name of the factor with which
     * it is associated
     */
    studyDesignInstance.getCovarianceByName = function(name) {
        for(var i = 0; i < studyDesignInstance.covariance.length; i++) {
            var covariance = studyDesignInstance.covariance[i];
            if (name == covariance.name) {
                return covariance;
            }
        }
        return undefined;
    };

    /**
     * Adjust the beta matrix after a category is added or deleted.
     *
     * @param predictorIndex Index of predictor.
     * @param categoryIndex  Index of category.
     * @param delta          +1 if it was added, -1 if it was removed.
     */
    studyDesignInstance.adjustBetaOnCategoryChange = function(predictorIndex, categoryIndex, delta) {
        if (delta === 0) {
            return;
        }

        var nocs = studyDesignInstance.betweenParticipantFactorList.map(
            function(p) {
                return p.categoryList.length;
            }
        );
        var nP = nocs.length;
        var newN = nocs[predictorIndex];
        var oldN = newN - delta;

        // these two are mutually exclusive; both
        // may be false, but both may not be true
        var addingFirst  = oldN === 0;  // => delta > 0
        var deletingLast = newN === 0;  // => delta < 0

        if (addingFirst) {
            -- delta;
            // ==> delta >= 0
        }
        if (deletingLast) {
            ++ delta;
            // ==> delta <= 0
        }

        if (delta === 0) {
            return;
        }

        var beta = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixBeta);

        var j;

        // horizontal swath width (per category)
        var sw0 = 1;
        for (j = predictorIndex + 1; j < nP; ++ j) {
            sw0 *= nocs[j];
        }

        // number of horizontal swaths
        var N = 1;
        for (j = 0; j < predictorIndex; ++ j) {
            N *= nocs[j];
        }

        // horizontal swath width (total; positive if inserting, negative if deleting)
        var sw = delta * sw0;

        var stride = oldN * sw0;
        var locus = N * stride + (categoryIndex - oldN) * sw0;

        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustRows(beta, sw, locus);
            locus -= stride;
        }
    };

    /**
     * Adjust the beta matrix after a number of measurements is changed.
     *
     * @param i    Index of repeated measure whose number of measurements
     *             has changed.
     * @param oldN Its previous number of measurements.
     */
    studyDesignInstance.adjustBetaOnChangeToNumberOfMeasurements = function(i, oldN) {
        var nRV = studyDesignInstance.responseList.length;
        var noms = studyDesignInstance.repeatedMeasuresTree.map(
            function(rm) {
                return rm.spacingList.length;
            }
        );
        var nRM = noms.length;
        var newN = noms[i];

        if (oldN === newN) {
            return;
        }

        var beta = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixBeta);

        var j;

        // vertical swath width (per measurement)
        var sw0 = nRV;
        for (j = i + 1; j < nRM; ++ j) {
            sw0 *= noms[j];
        }

        // number of vertical swaths
        var N = 1;
        for (j = 0; j < i; ++ j) {
            N *= noms[j];
        }

        // vertical swath width (total; positive if inserting, negative if deleting)
        var sw = (newN - oldN) * sw0;

        var stride = oldN * sw0;
        var locus = N * stride;
        if (sw < 0) {
            locus += sw;
        }

        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustColumns(beta, sw, locus);
            if (studyDesignInstance.gaussianCovariate) {
                var betaRandom = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixBetaRandom);
                matrixUtilities.adjustColumns(betaRandom, sw, locus);
            }
            locus -= stride;
        }
    };

    /**
     * Adjust the beta matrix after a response variable is added or removed.
     *
     * @param i     Index of response variable that was added or removed.
     * @param delta +1 if it was added, -1 if it was removed.
     */
    studyDesignInstance.adjustBetaOnChangeToResponseVariables = function(i, delta) {
        if (delta === 0) {
            return;
        }

        var nRV = studyDesignInstance.responseList.length;
        var noms = studyDesignInstance.repeatedMeasuresTree.map(
            function(rm) {
                return rm.spacingList.length;
            }
        );
        var nRM = noms.length;

        var beta = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixBeta);

        var j;

        // number of vertical swaths
        var N = 1;
        for (j = 0; j < nRM; ++ j) {
            N *= noms[j];
        }

        var stride = nRV - delta;
        var locus = (N - 1) * stride + i;
        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustColumns(beta, delta, locus);
            if (studyDesignInstance.gaussianCovariate) {
                var betaRandom = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixBetaRandom);
                matrixUtilities.adjustColumns(betaRandom, delta, locus);
            }
            locus -= stride;
        }
    };

    /**
     * Adjust the sigmaYg matrix after a number of measurements is changed.
     *
     * @param i    Index of repeated measure whose number of measurements
     *             has changed.
     * @param oldN Its previous number of measurements.
     */
    studyDesignInstance.adjustSigmaYgOnChangeToNumberOfMeasurements = function(i, oldN) {
        var nRV = studyDesignInstance.responseList.length;
        var noms = studyDesignInstance.repeatedMeasuresTree.map(
            function(rm) {
                return rm.spacingList.length;
            }
        );
        var nRM = noms.length;
        var newN = noms[i];

        if (oldN === newN) {
            return;
        }

        var sigmaYg = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixSigmaYG);

        var j;

        // horizontal swath width (per measurement)
        var sw0 = nRV;
        for (j = i + 1; j < nRM; ++ j) {
            sw0 *= noms[j];
        }

        // number of horizontal swaths
        var N = 1;
        for (j = 0; j < i; ++ j) {
            N *= noms[j];
        }

        // horizontal swath width (total; positive if inserting, negative if deleting)
        var sw = (newN - oldN) * sw0;

        var stride = oldN * sw0;
        var locus = N * stride;
        if (sw < 0) {
            locus += sw;
        }
        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustRows(sigmaYg, sw, locus);
            locus -= stride;
        }
    };

    /**
     * Adjust the sigmaYg matrix after a response variable is added or removed.
     *
     * @param i     Index of response variable that was added or removed.
     * @param delta +1 if it was added, -1 if it was removed.
     */
    studyDesignInstance.adjustSigmaYgOnChangeToResponseVariables = function(i, delta) {
        if (delta === 0) {
            return;
        }

        var nRV = studyDesignInstance.responseList.length;
        var noms = studyDesignInstance.repeatedMeasuresTree.map(
            function(rm) {
                return rm.spacingList.length;
            }
        );
        var nRM = noms.length;

        var sigmaYg = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixSigmaYG);

        var j;

        // number of horizontal swaths
        var N = 1;
        for (j = 0; j < nRM; ++ j) {
            N *= noms[j];
        }

        var stride = nRV - delta;
        var locus = (N - 1) * stride + i;
        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustRows(sigmaYg, delta, locus);
            locus -= stride;
        }
    };

    /**
     * Adjust the relative group size list after a category is added or deleted.
     *
     * @param predictorIndex Index of predictor.
     * @param categoryIndex  Index of category.
     * @param delta          +1 if it was added, -1 if it was removed.
     */
    studyDesignInstance.adjustRelativeGroupSizeListOnCategoryChange = function(predictorIndex, categoryIndex, delta) {
        if (delta === 0) {
            return;
        }

        var nocs = studyDesignInstance.betweenParticipantFactorList.map(
            function(p) {
                return p.categoryList.length;
            }
        );
        var nP = nocs.length;
        var newN = nocs[predictorIndex];
        var oldN = newN - delta;

        if (nP > 1) {
            // these two are mutually exclusive; both
            // may be false, but both may not be true
            var addingFirst  = oldN === 0;  // => delta > 0
            var deletingLast = newN === 0;  // => delta < 0

            if (addingFirst) {
                -- delta;
                // ==> delta >= 0
            }
            if (deletingLast) {
                ++ delta;
                // ==> delta <= 0
            }

            if (delta === 0) {
                return;
            }
        }

        var rgsl = studyDesignInstance.relativeGroupSizeList;

        var j;

        // horizontal swath width (per category)
        var sw0 = 1;
        for (j = predictorIndex + 1; j < nP; ++ j) {
            sw0 *= nocs[j];
        }

        // number of horizontal swaths
        var N = 1;
        for (j = 0; j < predictorIndex; ++ j) {
            N *= nocs[j];
        }

        // horizontal swath width (total; positive if inserting, negative if deleting)
        var sw = delta * sw0;

        var stride = oldN * sw0;
        var locus = N * stride + (categoryIndex - oldN) * sw0;

        var rgs = function() {
            return {idx:0};
        };

        for (var k = 0; k < N; ++ k) {
            matrixUtilities.adjustArray(rgsl, sw, locus, rgs);
            locus -= stride;
        }
    };

    /**
     * Select the best trend for the number of values specified.
     * Makes sure that the selected trend is valid for the number of values.
     * Called when the number of categories for a predictor or the number
     * of measurements for repeated measures changes
     */
    studyDesignInstance.getBestTrend = function(currentTrend, numValues) {
        switch(currentTrend) {
            case glimmpseConstants.trendCubic:
                if (numValues > 3) {
                    return currentTrend;
                } else if (numValues > 2) {
                    return glimmpseConstants.trendQuadratic;
                } else if (numValues > 1) {
                    return glimmpseConstants.trendLinear;
                } else {
                    return glimmpseConstants.trendNone;
                }
                break;
            case glimmpseConstants.trendQuadratic:
                if (numValues > 2) {
                    return currentTrend;
                } else if (numValues > 1) {
                    return glimmpseConstants.trendLinear;
                } else {
                    return glimmpseConstants.trendNone;
                }
                break;
            case glimmpseConstants.trendLinear:
            case glimmpseConstants.trendAllNonconstantPolynomial:
            case glimmpseConstants.trendChangeFromBaseline:
                if (numValues > 1) {
                    return currentTrend;
                } else {
                    return glimmpseConstants.trendNone;
                }
                break;
            default:
                return glimmpseConstants.trendNone;
        }
    };

    /**
     * Select the best hypothesis type for current predictors and repeated measures.
     * Makes sure that the selected type is valid for the predictors and repeated measures.
     * Called when a predictor or repeated measure is deleted from the model.
     */
    studyDesignInstance.getBestHypothesisType = function(currentType) {
        var thetaNull;
        var defaultThetaNull = {
            idx:0,
            name: glimmpseConstants.matrixThetaNull,
            rows: 1,
            columns: 1,
            data: {
                data:[[0]]
            }
        };
        var totalFactors = studyDesignInstance.betweenParticipantFactorList.length +
            studyDesignInstance.repeatedMeasuresTree.length;
        switch(currentType) {
            case glimmpseConstants.hypothesisInteraction:
                if (totalFactors > 1) {
                    return currentType;
                } else if (totalFactors > 0) {
                    return glimmpseConstants.hypothesisTrend;
                } else {
                    thetaNull = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixThetaNull);
                    if (thetaNull === undefined) {
                        studyDesignInstance.matrixSet.push(defaultThetaNull);
                    }
                    return glimmpseConstants.hypothesisGrandMean;
                }
                break;
            case glimmpseConstants.hypothesisMainEffect:
            case glimmpseConstants.hypothesisManova:
            case glimmpseConstants.hypothesisTrend:
                if (totalFactors > 0) {
                    return currentType;
                } else {
                    thetaNull = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixThetaNull);
                    if (thetaNull === undefined) {
                        studyDesignInstance.matrixSet.push(defaultThetaNull);
                    }
                    return glimmpseConstants.hypothesisGrandMean;
                }
                break;
            default:
                thetaNull = studyDesignInstance.getMatrixByName(glimmpseConstants.matrixThetaNull);
                if (thetaNull === undefined) {
                    studyDesignInstance.matrixSet.push(defaultThetaNull);
                }
                return glimmpseConstants.hypothesisGrandMean;
        }
    };

    // return the singleton study design class
    return studyDesignInstance;

});

