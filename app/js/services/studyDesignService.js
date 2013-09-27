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
glimmpseApp.factory('studyDesignService', function($http, glimmpseConstants) {
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

    /** The name of the independent sampling unit (deprecated) */
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

    // private Set<StudyDesignNamedMatrix> matrixSet = null;
    /** The repeated measures tree. */
    studyDesignInstance.repeatedMeasuresTree = [];

    /** The clustering tree. */
    studyDesignInstance.clusteringTree = [];

    /** The hypothesis. */
    studyDesignInstance.hypothesis = [{idx:1, type:'GRAND_MEAN', betweenParticipantFactorMapList:[], repeatedMeasuresMapTree:[]}];

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
        var errorInvalid = "The file did not contain a valid study design. Please try again.";

        // read uuid
        if (object.hasOwnProperty("uuid") &&
            (object.uuid == null || object.uuid instanceof Array)) {
            studyDesignInstance.uuid = object.uuid
        } else {
            throw errorInvalid;
        }

        // read name
        if (object.hasOwnProperty("name")) {
            studyDesignInstance.name = object.name
        } else {
            throw errorInvalid;
        }

        // read covariate flag
        if (object.hasOwnProperty("gaussianCovariate") &&
            (object.gaussianCovariate == true || object.gaussianCovariate == false )) {
            studyDesignInstance.gaussianCovariate = object.gaussianCovariate;
        } else {
            throw errorInvalid;
        }

        // read solution type flag
        if (object.hasOwnProperty("solutionTypeEnum") &&
            (object.solutionTypeEnum == glimmpseConstants.solutionTypePower ||
                object.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize )) {
            studyDesignInstance.solutionTypeEnum = object.solutionTypeEnum;
        } else {
            throw errorInvalid;
        }

        // The name of the independent sampling unit (deprecated)
        if (object.hasOwnProperty("participantLabel")) {
            studyDesignInstance.participantLabel = object.participantLabel;
        } else {
            throw errorInvalid;
        }

        // view type enum
        if (object.hasOwnProperty("viewTypeEnum") &&
            (object.viewTypeEnum == glimmpseConstants.modeGuided ||
                object.viewTypeEnum == glimmpseConstants.modeMatrix)) {
            studyDesignInstance.viewTypeEnum = object.viewTypeEnum;
        } else {
            throw errorInvalid;
        }

        // CI description
        if (object.hasOwnProperty("confidenceIntervalDescriptions")) {
            studyDesignInstance.confidenceIntervalDescriptions = object.confidenceIntervalDescriptions;
        } else {
            throw errorInvalid;
        }

        // power curve description
        if (object.hasOwnProperty("powerCurveDescriptions")) {
            studyDesignInstance.powerCurveDescriptions = object.powerCurveDescriptions;
        } else {
            throw errorInvalid;
        }

        // alpha list
        if (object.hasOwnProperty("alphaList") &&
            (object.alphaList == null || object.alphaList instanceof Array)) {
            if (object.alphaList == null) {
               studyDesignInstance.alphaList = [];
            } else {
               studyDesignInstance.alphaList = object.alphaList
            }
        } else {
            throw errorInvalid;
        }

        // beta scale list
        if (object.hasOwnProperty("betaScaleList") &&
            (object.betaScaleList == null || object.betaScaleList instanceof Array)) {
            if (object.betaScaleList == null) {
                studyDesignInstance.betaScaleList = [];
            } else {
                studyDesignInstance.betaScaleList = object.betaScaleList
            }
        } else {
            throw errorInvalid;
        }

        // sigma scale list
        if (object.hasOwnProperty("sigmaScaleList") &&
            (object.sigmaScaleList == null || object.sigmaScaleList instanceof Array)) {
            if (object.sigmaScaleList == null) {
                studyDesignInstance.sigmaScaleList = [];
            } else {
                studyDesignInstance.sigmaScaleList = object.sigmaScaleList
            }
        } else {
            throw errorInvalid;
        }

        // relative group size list
        if (object.hasOwnProperty("relativeGroupSizeList") &&
            (object.relativeGroupSizeList == null || object.relativeGroupSizeList instanceof Array)) {
            if (object.relativeGroupSizeList == null) {
                studyDesignInstance.relativeGroupSizeList = [];
            } else {
                studyDesignInstance.relativeGroupSizeList = object.relativeGroupSizeList
            }
        } else {
            throw errorInvalid;
        }

        // per group sample size list
        if (object.hasOwnProperty("sampleSizeList") &&
            (object.sampleSizeList == null || object.sampleSizeList instanceof Array)) {
            if (object.sampleSizeList == null) {
                studyDesignInstance.sampleSizeList = [];
            } else {
                studyDesignInstance.sampleSizeList = object.sampleSizeList
            }
        } else {
            throw errorInvalid;
        }

        // statistical test list
        if (object.hasOwnProperty("statisticalTestList") &&
            (object.statisticalTestList == null || object.statisticalTestList instanceof Array)) {
            if (object.statisticalTestList == null) {
                studyDesignInstance.statisticalTestList = [];
            } else {
                studyDesignInstance.statisticalTestList = object.statisticalTestList
            }
        } else {
            throw errorInvalid;
        }

        // power method list
        if (object.hasOwnProperty("powerMethodList") &&
            (object.powerMethodList == null || object.powerMethodList instanceof Array)) {
            if (object.powerMethodList == null) {
                studyDesignInstance.powerMethodList = [];
            } else {
                studyDesignInstance.powerMethodList = object.powerMethodList
            }
        } else {
            throw errorInvalid;
        }

        // quantile list
        if (object.hasOwnProperty("quantileList") &&
            (object.quantileList == null || object.quantileList instanceof Array)) {
            if (object.quantileList == null) {
                studyDesignInstance.quantileList = [];
            } else {
                studyDesignInstance.quantileList = object.quantileList
            }
        } else {
            throw errorInvalid;
        }

        // nominal power list
        if (object.hasOwnProperty("nominalPowerList") &&
            (object.nominalPowerList == null || object.nominalPowerList instanceof Array)) {
            if (object.nominalPowerList == null) {
                studyDesignInstance.nominalPowerList = [];
            } else {
                studyDesignInstance.nominalPowerList = object.nominalPowerList
            }
        } else {
            throw errorInvalid;
        }

        // response list
        if (object.hasOwnProperty("responseList") &&
            (object.responseList == null || object.responseList instanceof Array)) {
            if (object.responseList == null) {
                studyDesignInstance.responseList = [];
            } else {
                studyDesignInstance.responseList = object.responseList
            }
        } else {
            throw errorInvalid;
        }

        // between participant factor list
        if (object.hasOwnProperty("betweenParticipantFactorList") &&
            (object.betweenParticipantFactorList == null || object.betweenParticipantFactorList instanceof Array)) {
            if (object.betweenParticipantFactorList == null) {
                studyDesignInstance.betweenParticipantFactorList = [];
            } else {
                studyDesignInstance.betweenParticipantFactorList = object.betweenParticipantFactorList
            }
        } else {
            throw errorInvalid;
        }

        // repeated measures tree
        if (object.hasOwnProperty("repeatedMeasuresTree") &&
            (object.repeatedMeasuresTree == null || object.repeatedMeasuresTree instanceof Array)) {
            if (object.repeatedMeasuresTree == null) {
                studyDesignInstance.repeatedMeasuresTree = [];
            } else {
                studyDesignInstance.repeatedMeasuresTree = object.repeatedMeasuresTree
            }
        } else {
            throw errorInvalid;
        }

        // clustering tree
        if (object.hasOwnProperty("clusteringTree") &&
            (object.clusteringTree == null || object.clusteringTree instanceof Array)) {
            if (object.clusteringTree == null) {
                studyDesignInstance.clusteringTree = [];
            } else {
                studyDesignInstance.clusteringTree = object.clusteringTree
            }
        } else {
            throw errorInvalid;
        }

        // hypothesis
        if (object.hasOwnProperty("hypothesis") &&
            (object.hypothesis == null || object.hypothesis instanceof Array)) {
            if (object.hypothesis == null) {
                studyDesignInstance.hypothesis = [];
            } else {
                studyDesignInstance.hypothesis = object.hypothesis
            }
        } else {
            throw errorInvalid;
        }

        // covariance
        if (object.hasOwnProperty("covariance") &&
            (object.covariance == null || object.covariance instanceof Array)) {
            if (object.covariance == null) {
                studyDesignInstance.covariance = [];
            } else {
                studyDesignInstance.covariance = object.covariance
            }
        } else {
            throw errorInvalid;
        }

        // matrices
        if (object.hasOwnProperty("matrixSet") &&
            (object.matrixSet == null || object.matrixSet instanceof Array)) {
            if (object.matrixSet == null) {
                studyDesignInstance.matrixSet = [];
            } else {
                studyDesignInstance.matrixSet = object.matrixSet
            }
        } else {
            throw errorInvalid;
        }
    }

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
    }

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
        studyDesignInstance.hypothesis = [{idx:1, type:'GRAND_MEAN', betweenParticipantFactorMapList:[], repeatedMeasuresMapTree:[]}];
        studyDesignInstance.covariance = [];
        studyDesignInstance.matrixSet = [];
    }

    return studyDesignInstance;

});

