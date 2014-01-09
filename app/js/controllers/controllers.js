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
* Controller which manages the navbar state and overall application state
*/
glimmpseApp.controller('stateController',
    function($scope, $rootScope, $location, $http, $modal, config,
             glimmpseConstants, studyDesignService, studyDesignMetaData,
             matrixUtilities, powerService) {
        /**** SCREEN STATE FUNCTIONS ****/

        /**
         * Convenience routine to determine if a screen has been completed by the user
         * @param state
         * @returns {boolean}
         */
        $scope.testDone = function(state) {
            return (state == $scope.glimmpseConstants.stateComplete ||
                state ==  $scope.glimmpseConstants.stateDisabled);
        };

        /**
         * Get the state of solution type view.  The view is
         * complete if a solution type has been selected
         *
         * @returns complete or incomplete
         */
        $scope.getStateSolvingFor = function() {
            if ($scope.studyDesign.solutionTypeEnum !== undefined) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the nominal power list.  The list is
         * disabled if the user is solving for power.  It is
         * considered complete if at least one power has been entered.
         *
         * @returns complete, incomplete, or disabled
         */
        $scope.getStateNominalPower = function() {
            if ($scope.studyDesign.solutionTypeEnum === undefined ||
                $scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypePower) {
                return $scope.glimmpseConstants.stateDisabled;
            } else if ($scope.studyDesign.nominalPowerList.length > 0) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the Type I error list.  At least
         * one alpha value is required for the list to be complete.
         * @returns complete or incomplete
         */
        $scope.getStateTypeIError = function() {
            if ($scope.studyDesign.alphaList.length > 0) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         *
         * Get the state of the predictor view.  The predictor
         * list is considered complete if
         * 1. There are no predictors (i.e. a one-sample design), or
         * 2. Every predictor has at least two categories
         *
         * Otherwise, the list is incomplete
         * @returns complete or incomplete
         */
        $scope.getStatePredictors = function() {
            var numFactors = $scope.studyDesign.betweenParticipantFactorList.length;
            if (numFactors > 0) {
                for(var i = 0; i < numFactors; i++) {
                    if ($scope.studyDesign.betweenParticipantFactorList[i].categoryList.length < 2) {
                        return $scope.glimmpseConstants.stateIncomplete;
                    }
                }
            }
            return $scope.glimmpseConstants.stateComplete;
        };

        /**
         * Get the state of the Gaussian covariate view.
         * In the current interface, this view is always complete.
         *
         * @returns complete
         */
        $scope.getStateCovariate = function() {
            return $scope.glimmpseConstants.stateComplete;
        };

        /**
         * Get the state of the clustering view.  The clustering
         * tree is complete if
         * 1. No clustering is specified, or
         * 2. All levels of clustering are complete
         *
         * @returns complete or incomplete
         */
        $scope.getStateClustering = function() {
            if ($scope.studyDesign.clusteringTree.length <= 0){
                return $scope.glimmpseConstants.stateComplete;
            } else {
                for(var i=0; i < $scope.studyDesign.clusteringTree.length; i++) {
                    var cluster = $scope.studyDesign.clusteringTree[i];
                    if (cluster.groupName === undefined || cluster.groupName.length <= 0 ||
                        cluster.groupSize === undefined || cluster.groupSize < 1 ||
                        cluster.intraClusterCorrelation === undefined ||
                        cluster.intraClusterCorreation < -1 || cluster.intraClusterCorreation > 1) {
                        return $scope.glimmpseConstants.stateIncomplete;
                    }
                }
                return $scope.glimmpseConstants.stateComplete;
            }
        };

        /**
         * Get the state of the relative group sizes view.
         * The relative group size list is complete provided
         * the between participant factor list is valid.  It
         * is disabled when no predictors are specified.  It
         * is blocked when
         *
         * @returns {string}
         */
        $scope.getStateRelativeGroupSize = function() {
            if ($scope.studyDesign.betweenParticipantFactorList.length <= 0) {
                return $scope.glimmpseConstants.stateDisabled;
            } else if ($scope.state.predictors == $scope.glimmpseConstants.stateComplete) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateBlocked;
            }
        };

        /**
         * Get the state of the smallest group size view.  The view
         * is disabled when the user is solving for sample size.
         * When the user is solving for power, the view is complete when
         * at least one group size is specified.
         *
         * @returns complete, incomplete, or disabled
         */
        $scope.getStateSmallestGroupSize = function() {
            if ($scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize) {
                return $scope.glimmpseConstants.stateDisabled;
            } else if ($scope.studyDesign.sampleSizeList.length > 0) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of response variables view.  The view
         * is complete when at least one variable has been specified.
         *
         * @returns complete or incomplete
         */
        $scope.getStateResponseVariables = function() {
            if ($scope.studyDesign.responseList.length > 0) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the repeated measures view.  The view
         * is complete when
         * 1. No repeated measures are specified, or
         * 2. Information for all repeated measures are complete
         *
         * @returns {string}
         */
        $scope.getStateRepeatedMeasures = function() {
            if ($scope.studyDesign.repeatedMeasuresTree.length > 0) {
                for(var i = 0; i < $scope.studyDesign.repeatedMeasuresTree.length; i++) {
                    var factor = $scope.studyDesign.repeatedMeasuresTree[i];
                    if (factor.dimension === undefined || factor.dimension === null ||
                        factor.dimension.length <= 0 ||
                        factor.repeatedMeasuresDimensionType === undefined ||
                        factor.numberOfMeasurements < 2 ||
                        factor.spacingList.length <= 0) {
                        return $scope.glimmpseConstants.stateIncomplete;
                    }
                }
            }
            return $scope.glimmpseConstants.stateComplete;
        };


        /**
         * Get the state of the hypothesis view.  The view
         * is blocked when the user has not completed the predictors
         * or response variables screens.  The screen is complete
         * when the hypothesis type and a sufficient number of
         * predictors is selected (at least 1 for main effects and trends,
         * and at least 2 for interactions)
         *
         * @returns blocked, complete or incomplete
         */
        $scope.getStateHypothesis = function() {
            if (!$scope.testDone($scope.state.predictors) ||
                !$scope.testDone($scope.state.responseVariables) ||
                !$scope.testDone($scope.state.repeatedMeasures)) {
                return $scope.glimmpseConstants.stateBlocked;
            } else {
                if ($scope.studyDesign.hypothesis[0] !== undefined) {
                    var hypothesis = $scope.studyDesign.hypothesis[0];
                    var totalFactors = 0;
                    if (hypothesis.betweenParticipantFactorMapList !== undefined) {
                        totalFactors += hypothesis.betweenParticipantFactorMapList.length;
                    }
                    if (hypothesis.repeatedMeasuresMapTree) {
                        totalFactors += hypothesis.repeatedMeasuresMapTree.length;
                    }

                    if (hypothesis.type == $scope.glimmpseConstants.hypothesisGrandMean) {
                        if ($scope.studyDesign.getMatrixByName($scope.glimmpseConstants.matrixThetaNull)) {
                            return $scope.glimmpseConstants.stateComplete;
                        }
                    } else if (hypothesis.type == $scope.glimmpseConstants.hypothesisMainEffect) {
                        if (totalFactors == 1) {
                            return $scope.glimmpseConstants.stateComplete;
                        }
                    } else if (hypothesis.type == $scope.glimmpseConstants.hypothesisTrend) {
                        if (totalFactors == 1) {
                            return $scope.glimmpseConstants.stateComplete;
                        }
                    } else if (hypothesis.type == $scope.glimmpseConstants.hypothesisInteraction) {
                        if (totalFactors >= 2) {
                            return $scope.glimmpseConstants.stateComplete;
                        }
                    }
                }
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the means view.  The means view is
         * blocked when either the predictors view or the repeated measures
         * view is incomplete.  Otherwise, the means view is complete.
         *
         * @returns blocked, complete, or incomplete
         */
        $scope.getStateMeans = function() {
            var beta = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBeta);
            if (!$scope.testDone($scope.state.predictors) ||
                !$scope.testDone($scope.state.responseVariables) ||
                !$scope.testDone($scope.state.repeatedMeasures)) {
                return $scope.glimmpseConstants.stateBlocked;
            }
            if (beta === undefined || beta === null) {
                return $scope.glimmpseConstants.stateBlocked;
            }
            if ($scope.matrixUtils.isValidMatrix(beta, undefined, undefined)) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the beta scale factors view.  The view
         * is complete when at least one beta scale is specified.
         *
         * @returns complete or incomplete
         */
        $scope.getStateScaleFactorsForMeans = function() {
            if ($scope.studyDesign.betaScaleList.length > 0) {
                return $scope.glimmpseConstants.stateComplete;
            } else {
                return $scope.glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the within participant variability view.  The
         * screen is blocked when the user has not yet completed the
         * response variables and repeated measures screens.  The
         * screen is complete when all variability information for
         * responses and each level of repeated measures are entered
         *
         * @returns blocked, complete, or incomplete
         */
        $scope.getStateWithinVariability = function() {
            if ($scope.studyDesign.responseList.length <= 0) {
                return $scope.glimmpseConstants.stateBlocked;
            }
            if ($scope.studyDesign.covariance.length > 0) {
                for(var i = 0; i < $scope.studyDesign.covariance.length; i++) {
                    var covar = $scope.studyDesign.covariance[i];
                    if (!$scope.matrixUtils.isValidCovariance(covar)) {
                        return $scope.glimmpseConstants.stateIncomplete;
                    }
                }
            }
            return $scope.glimmpseConstants.stateComplete;
        };

        /**
         * Get the state of the covariate variability view.
         * The view is disabled when the user has not selected a covariate.
         * The view is complete when all variability information is entered.
         *
         * @returns disabled, complete, or incomplete
         */
        $scope.getStateCovariateVariability = function() {
            if ($scope.studyDesign.gaussianCovariate) {
                if ($scope.studyDesign.responseList.length <= 0) {
                    return glimmpseConstants.stateBlocked;
                }
                var sigmaG = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaG);
                if (!$scope.matrixUtils.isValidMatrix(sigmaG, 0, undefined)) {
                    return glimmpseConstants.stateIncomplete;
                }
                var sigmaYG = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG);
                if (!$scope.matrixUtils.isValidMatrix(sigmaYG, -1, 1)) {
                    return glimmpseConstants.stateIncomplete;
                }
                return glimmpseConstants.stateComplete;
            } else {
                return glimmpseConstants.stateDisabled;
            }
        };

        /**
         * Get the state of the sigma scale factors view.  The view is
         * complete when at least one scale factor has been entered.
         *
         * @returns complete or incomplete
         */
        $scope.getStateScaleFactorsForVariability = function() {
            if ($scope.studyDesign.sigmaScaleList.length > 0) {
                return glimmpseConstants.stateComplete;
            } else {
                return glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the statistical test view.  The view is
         * complete when at least one statistical test has been selected.
         *
         * @returns complete or incomplete
         */
        $scope.getStateStatisticalTest = function() {
            if ($scope.studyDesign.statisticalTestList.length > 0) {
                return glimmpseConstants.stateComplete;
            } else {
                return glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Get the state of the power method view.  The view is disabled
         * when the user has not selected a gaussian covariate.  The view
         * is complete when
         * 1. At least one power method is selected
         * 2. If quantile power is selected, at least one quantile is entered.
         *
         * @returns disabled, complete, or incomplete
         */
        $scope.getStatePowerMethod = function() {
            if ($scope.studyDesign.gaussianCovariate) {
                if ($scope.studyDesign.powerMethodList.length > 0) {
                    var quantileChecked = false;
                    for(var i in $scope.studyDesign.powerMethodList) {
                        if ($scope.studyDesign.powerMethodList[i].value == 'quantile') {
                            quantileChecked = true;
                            break;
                        }
                    }
                    if (quantileChecked) {
                        if ($scope.studyDesign.quantileList.length > 0) {
                            return glimmpseConstants.stateComplete;
                        } else {
                            return glimmpseConstants.stateIncomplete;
                        }
                    } else {
                        return glimmpseConstants.stateComplete;
                    }
                } else {
                    return glimmpseConstants.stateIncomplete;
                }


            } else {
                return glimmpseConstants.stateDisabled;
            }
        };

        /**
         * Get the state of the confidence intervals view.  The view is disabled when
         * the user has selected a Gaussian covariate (theory not yet available).
         * The view is complete when
         * 1. The user has NOT selected confidence intervals, or
         * 2. All confidence interval informatin is complete
         *
         * @returns disabled, complete, or incomplete
         */
        $scope.getStateConfidenceIntervals = function() {
            if ($scope.studyDesign.confidenceIntervalDescriptions === null) {
                return glimmpseConstants.stateComplete;
            } else {
                if ($scope.studyDesign.confidenceIntervalDescriptions.betaFixed !== undefined &&
                    $scope.studyDesign.confidenceIntervalDescriptions.sigmaFixed !== undefined &&
                    $scope.studyDesign.confidenceIntervalDescriptions.upperTailProbability !== undefined &&
                    $scope.studyDesign.confidenceIntervalDescriptions.lowerTailProbability !== undefined &&
                    $scope.studyDesign.confidenceIntervalDescriptions.sampleSize !== undefined &&
                    $scope.studyDesign.confidenceIntervalDescriptions.rankOfDesignMatrix !== undefined) {
                    return glimmpseConstants.stateComplete;
                } else {
                    return glimmpseConstants.stateIncomplete;
                }
            }
        };

        /**
         * Determine if the power curve screen is complete
         * @returns {string}
         */
        $scope.getStatePowerCurve = function() {
            if ($scope.studyDesign.alphaList.length <= 0 ||
                $scope.studyDesign.statisticalTestList.length <= 0 ||
                $scope.studyDesign.betaScaleList.length <= 0 ||
                $scope.studyDesign.sigmaScaleList.length <= 0 ||
                ($scope.studyDesign.gaussianCovariate &&
                    ($scope.studyDesign.powerMethodList.length <= 0 ||
                        ($scope.studyDesign.getPowerMethodIndex($scope.glimmpseConstants.powerMethodQuantile) >= 0 &&
                            $scope.studyDesign.quantileList.length <= 0
                            )
                        )
                    ) ||
                ($scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypePower &&
                    $scope.studyDesign.sampleSizeList.length <= 0) ||
                ($scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypeSampleSize &&
                    $scope.studyDesign.nominalPowerList.length <= 0)
                ) {
                return $scope.glimmpseConstants.stateBlocked;
            } else {
                if ($scope.studyDesign.powerCurveDescriptions === null) {
                    return $scope.glimmpseConstants.stateComplete;
                } else {
                    if ($scope.studyDesign.powerCurveDescriptions.dataSeriesList.length > 0) {
                        return $scope.glimmpseConstants.stateComplete;
                    } else {
                        return $scope.glimmpseConstants.stateIncomplete;
                    }
                }
            }
        };


        /** Matrix mode checks **/

            // check if design matrix is valid
        $scope.getStateDesignEssence = function() {
            if ($scope.matrixUtils.isValidMatrix(
                $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixXEssence))) {
                return glimmpseConstants.stateComplete;
            }
            return glimmpseConstants.stateIncomplete;
        };

        // state of beta matrix
        $scope.getStateBeta = function() {
            if ($scope.matrixUtils.isValidMatrix(
                $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBeta))) {
                return glimmpseConstants.stateComplete;
            }
            return glimmpseConstants.stateIncomplete;
        };

        $scope.getStateBetweenParticipantContrast = function() {
            if ($scope.matrixUtils.isValidMatrix(
                $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBetweenContrast))) {
                return glimmpseConstants.stateComplete;
            }
            return glimmpseConstants.stateIncomplete;
        };

        $scope.getStateWithinParticipantContrast = function() {
            if ($scope.matrixUtils.isValidMatrix(
                $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixWithinContrast))) {
                return glimmpseConstants.stateComplete;
            }
            return glimmpseConstants.stateIncomplete;
        };

        $scope.getStateThetaNull = function() {
            if ($scope.matrixUtils.isValidMatrix(
                $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixThetaNull))) {
                return glimmpseConstants.stateComplete;
            }
            return glimmpseConstants.stateIncomplete;
        };

        $scope.getStateSigmaE = function() {
            if ($scope.studyDesign.gaussianCovariate) {
                return glimmpseConstants.stateDisabled;
            } else {
                if ($scope.matrixUtils.isValidMatrix(
                    $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaE))) {
                    return glimmpseConstants.stateComplete;
                }
                return glimmpseConstants.stateIncomplete;
            }
        };

        $scope.getStateSigmaG = function() {
            if (!$scope.studyDesign.gaussianCovariate) {
                return glimmpseConstants.stateDisabled;
            } else {
                if ($scope.matrixUtils.isValidMatrix(
                    $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaG))) {
                    return glimmpseConstants.stateComplete;
                }
                return glimmpseConstants.stateIncomplete;
            }
        };

        $scope.getStateSigmaY = function() {
            if (!$scope.studyDesign.gaussianCovariate) {
                return glimmpseConstants.stateDisabled;
            } else {
                if ($scope.matrixUtils.isValidMatrix(
                    $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaY))) {
                    return glimmpseConstants.stateComplete;
                }
                return glimmpseConstants.stateIncomplete;
            }
        };

        $scope.getStateSigmaYG = function() {
            if (!$scope.studyDesign.gaussianCovariate) {
                return glimmpseConstants.stateDisabled;
            } else {
                if ($scope.matrixUtils.isValidMatrix(
                    $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG))) {
                    return glimmpseConstants.stateComplete;
                }
                return glimmpseConstants.stateIncomplete;
            }
        };

        /**
         * Generic function to update the state of all screens
         */
        $scope.updateState = function() {
            /**
             * !ORDER MATTERS IN THESE CALLS!
             *
             * Edit with care
             */
            $scope.state.solvingFor = $scope.getStateSolvingFor();
            $scope.state.nominalPower = $scope.getStateNominalPower();
            $scope.state.typeIError = $scope.getStateTypeIError();
            $scope.state.predictors = $scope.getStatePredictors();
            $scope.state.covariates = $scope.getStateCovariate();
            $scope.state.isu = $scope.getStateClustering();
            $scope.state.relativeGroupSize = $scope.getStateRelativeGroupSize();
            $scope.state.smallestGroupSize = $scope.getStateSmallestGroupSize();
            $scope.state.responseVariables = $scope.getStateResponseVariables();
            $scope.state.repeatedMeasures = $scope.getStateRepeatedMeasures();
            $scope.state.hypothesis = $scope.getStateHypothesis();
            $scope.state.means = $scope.getStateMeans();
            $scope.state.meansScale = $scope.getStateScaleFactorsForMeans();
            $scope.state.variabilityWithin = $scope.getStateWithinVariability();
            $scope.state. variabilityCovariate = $scope.getStateCovariateVariability();
            $scope.state.variabilityScale = $scope.getStateScaleFactorsForVariability();
            $scope.state.test = $scope.getStateStatisticalTest();
            $scope.state.powerMethod = $scope.getStatePowerMethod();
            $scope.state.confidenceIntervals = $scope.getStateConfidenceIntervals();
            $scope.state.plotOptions = $scope.getStatePowerCurve();
            $scope.state.designEssence = $scope.getStateDesignEssence();
            $scope.state.beta = $scope.getStateBeta();
            $scope.state.betweenContrast = $scope.getStateBetweenParticipantContrast();
            $scope.state.withinContrast = $scope.getStateWithinParticipantContrast();
            $scope.state.thetaNull = $scope.getStateThetaNull();
            $scope.state.sigmaE = $scope.getStateSigmaE();
            $scope.state.sigmaY = $scope.getStateSigmaY();
            $scope.state.sigmaG = $scope.getStateSigmaG();
            $scope.state.sigmaYG = $scope.getStateSigmaYG();

        };
        /**** END SCREEN STATE FUNCTIONS ****/

    /**
     * Initialize the controller
     */
    init();
    function init() {
        // the study design object
        $scope.studyDesign = studyDesignService;

        // meta data associated with the study design
        $scope.metaData = studyDesignMetaData;

        // the power service
        $scope.powerService = powerService;

        // matrix functions
        $scope.matrixUtils = matrixUtilities;

        // constants
        $scope.glimmpseConstants = glimmpseConstants;

        // json encoded study design
        $scope.studyDesignJSON = "";

        // results csv
        $scope.resultsCSV = "";

        // show/hide processing dialog
        $scope.processing = false;

        // show/hide processing for emailDesign
        $scope.designEmailProcessing = false;

        // list of incomplete views
        $scope.incompleteViews = [];

        // View indicates if the user is viewing the study design or results 'tab'
        $scope.view = 'studyDesign';

        // Mode indicates if the user selected guided or matrix mode
        $scope.mode = undefined;

        // url for file upload
        $scope.uriUpload = config.schemeFile + config.hostFile + config.uriUpload;

        // url for save upload
        $scope.uriSave = config.schemeFile + config.hostFile + config.uriSave;

        //isMobile
        $scope.isMobile = config.isMobile;

        // screen state information
        $scope.state = {};
        $scope.updateState();

    }

    /*** set watchers on study design changes to update the state as needed ***/

        /**
         * Watch for any changes in the study design.  When changes occur
         * clear the results cache
         */
        $scope.$watch('studyDesign', function(newValue, oldValue) {
            $scope.updateState();
            // clear the results if the user changed something besides the power curve
            if (angular.toJson(newValue.powerCurveDescriptions) ==
                angular.toJson(oldValue.powerCurveDescriptions)) {
                // only clear power results if something besides power curve changed
                $scope.powerService.clearCache();
                // clear the power curve options and available data series
                $scope.studyDesign.powerCurveDescriptions = null;
                $scope.metaData.plotOptions = {
                    xAxis: glimmpseConstants.xAxisTotalSampleSize,
                    availableDataSeries: []
                };
            }

            // clear power curve options
        }, true);

    /**
     * Set the view
     * @param view
     */
    $scope.changeView = function(view){
        $location.path(view); // path not hash
    };

    $scope.leavePageCheck = function() {
        if ($scope.getMode() !== undefined) {
            window.alert("You will lose any unsaved data when you leave the page.  Continue?");
        }
    };



    /**
     * Returns true if the state allows the user to load the
     * specified view
     *
     * @param state
     * @returns {boolean}
     */
    $scope.viewAllowed = function(state) {
        return (state !=  $scope.glimmpseConstants.stateDisabled &&
            state !=  $scope.glimmpseConstants.stateBlocked);
    };

    /**
     *  Display the incomplete items dialog
     */
    $scope.showIncompleteItemsDialog = function () {

        $scope.incompleteViews = [];

        // start menu
        if (!$scope.testDone($scope.state.solvingFor)) { $scope.incompleteViews.push("Start > Solving For"); }
        if (!$scope.testDone($scope.state.nominalPower)) { $scope.incompleteViews.push("Start > Desired Power"); }

        if ($scope.mode == $scope.glimmpseConstants.modeGuided) {
            // GUIDED MODE
            // model menu
            if (!$scope.testDone($scope.state.isu)) { $scope.incompleteViews.push("Model > Clustering"); }
            if (!$scope.testDone($scope.state.predictors)) { $scope.incompleteViews.push("Model > Predictors"); }
            if (!$scope.testDone($scope.state.covariates)) { $scope.incompleteViews.push("Model > Covariate"); }
            if (!$scope.testDone($scope.state.responseVariables)) { $scope.incompleteViews.push("Model > Response Variables"); }
            if (!$scope.testDone($scope.state.repeatedMeasures)) { $scope.incompleteViews.push("Model > Repeated Measures"); }
            if (!$scope.testDone($scope.state.relativeGroupSize)) { $scope.incompleteViews.push("Model > Relative Group Size"); }
            if (!$scope.testDone($scope.state.smallestGroupSize)) { $scope.incompleteViews.push("Model > Smallest Group Size"); }
            // hypothesis menu
            if (!$scope.testDone($scope.state.hypothesis)) { $scope.incompleteViews.push("Hypothesis > Hypothesis"); }
            if (!$scope.testDone($scope.state.test)) { $scope.incompleteViews.push("Hypothesis > Statistical Test"); }
            if (!$scope.testDone($scope.state.typeIError)) { $scope.incompleteViews.push("Hypothesis > Type I Error"); }
            // means menu
            if (!$scope.testDone($scope.state.means)) { $scope.incompleteViews.push("Means > Means"); }
            if (!$scope.testDone($scope.state.meansScale)) { $scope.incompleteViews.push("Means > Scale Factors"); }
            // variability menu
            if (!$scope.testDone($scope.state.variabilityWithin)) { $scope.incompleteViews.push("Variability > Within Participant"); }
            if (!$scope.testDone($scope.state.variabilityCovariate)) { $scope.incompleteViews.push("Variability > Covariate"); }
            if (!$scope.testDone($scope.state.variabilityScale)) { $scope.incompleteViews.push("Variability > Scale Factors"); }

        } else {
            // MATRIX MODE
            // design menu
            if (!$scope.testDone($scope.state.designEssence)) { $scope.incompleteViews.push("Design > Design Essence"); }
            if (!$scope.testDone($scope.state.covariates)) { $scope.incompleteViews.push("Design > Covariate"); }
            if (!$scope.testDone($scope.state.smallestGroupSize)) { $scope.incompleteViews.push("Design > Smallest Group Size"); }
            // coefficients menu
            if (!$scope.testDone($scope.state.beta)) { $scope.incompleteViews.push("Coefficients > Beta Coefficients"); }
            if (!$scope.testDone($scope.state.meansScale)) { $scope.incompleteViews.push("Coefficients > Beta Scale Factors"); }
            // hypothesis menu
            if (!$scope.testDone($scope.state.betweenContrast)) { $scope.incompleteViews.push("Hypothesis > Between Participant Contrast"); }
            if (!$scope.testDone($scope.state.withinContrast)) { $scope.incompleteViews.push("Hypothesis > Within Participant Contrast"); }
            if (!$scope.testDone($scope.state.thetaNull)) { $scope.incompleteViews.push("Hypothesis > Theta Null"); }
            if (!$scope.testDone($scope.state.test)) { $scope.incompleteViews.push("Hypothesis > Statistical Test"); }
            if (!$scope.testDone($scope.state.typeIError)) { $scope.incompleteViews.push("Hypothesis > Type I Error"); }
            // variability menu
            if (!$scope.testDone($scope.state.sigmaE)) { $scope.incompleteViews.push("Variability > Error Covariance"); }
            if (!$scope.testDone($scope.state.sigmaY)) { $scope.incompleteViews.push("Variability > Outcomes Covariance"); }
            if (!$scope.testDone($scope.state.sigmaG)) { $scope.incompleteViews.push("Variability > Covariate"); }
            if (!$scope.testDone($scope.state.sigmaYG)) { $scope.incompleteViews.push("Variability > Outcomes and Covariate"); }
            if (!$scope.testDone($scope.state.variabilityScale)) { $scope.incompleteViews.push("Variability > Scale Factors"); }
        }

        // options menu
        if (!$scope.testDone($scope.state.powerMethod)) { $scope.incompleteViews.push("Options > Power Method"); }
        if (!$scope.testDone($scope.state.confidenceIntervals)) { $scope.incompleteViews.push("Options > Confidence Intervals"); }
        if (!$scope.testDone($scope.state.plotOptions)) { $scope.incompleteViews.push("Options > Power Curve"); }


    };

    /**
     *  Display the processing dialog
     */
    $scope.showWaitDialog = function () {
        $scope.waitDialog = $modal.open({
                templateUrl: 'processingDialog.html',
                controller: function ($scope) {},
                backdrop: 'static'
            }
        );
    };


    /**
     * clear the study design
     */
    $scope.reset = function() {
        if (confirm('This action will clear any unsaved study design information.  Continue?')) {
            $scope.studyDesign.reset();
            $scope.powerService.clearCache();
            $scope.metaData.reset();
            init();
        }
    };

    /**
     * Submit the feedback form
     * @param input
     */
    $scope.sendFeedback = function(input) {

        $scope.processing = true;

        var $form = $(input).parents('form');

        $form.ajaxSubmit({
            type: 'POST',
            uploadProgress: function(event, position, total, percentComplete) {
            },
            error: function(event, statusText, responseText, form) {
                $scope.$apply(function() {
                    /* handle the error */

                    $scope.processing = false;
                    $scope.feedbackResult = "error";
                });

                $scope.support = {};
                $form[0].reset();

            },
            success: function(responseText, statusText, xhr, form) {
                // select the appropriate input mode
                $scope.$apply(function() {
                    /* handle the error */
                    $scope.processing = false;
                    $scope.feedbackResult = "OK";
                });
                $scope.support = {};
                $form[0].reset();
            }
        });

    };

        /**
         * Submit the design email form
         * @param input
         */
        $scope.sendDesignEmail = function(input) {
            //window.alert(config.isMobile);
            $scope.designEmailProcessing = true;

            var $form = $(input).parents('form');

            $form.ajaxSubmit({
                type: 'POST',
                error: function(event, statusText, responseText, form) {
                    $scope.$apply(function() {
                        /* handle the error */

                        $scope.designEmailProcessing = false;
                        $scope.designEmailSuccess = false;
                    });

                    $scope.designEmail = {};
                    $form[0].reset();

                },
                success: function(responseText, statusText, xhr, form) {
                    // select the appropriate input mode
                    $scope.$apply(function() {
                        /* handle the error */
                        $scope.designEmailProcessing = false;
                        $scope.designEmailSuccess = true;
                    });
                    $scope.designEmail = {};
                    $form[0].reset();
                }
            });

        };


    /**
     * Upload a study design file
     * @param input
     * @param parentScope
     */
    $scope.uploadFile = function(input) {
        $scope.$apply(function() {
            $scope.processing = true;
        });
        $location.path('/');
        powerService.clearCache();

        var $form = $(input).parents('form');

        if (input.value === '') {
            window.alert("No file was selected.  Please try again");
        }

        $form.ajaxSubmit({
            type: 'POST',
            uploadProgress: function(event, position, total, percentComplete) {
            },
            error: function(event, statusText, responseText, form) {
                $scope.$apply(function() {
                    /* handle the error */
                    $scope.processing = false;
                });
                window.alert("The study design file could not be loaded: " + responseText);
                $form[0].reset();

            },
            success: function(responseText, statusText, xhr, form) {
                // select the appropriate input mode
                $scope.$apply(function() {

                    // parse the json
                    try {
                        $scope.studyDesign.fromJSON(responseText);
                        $scope.metaData.updatePredictorCombinations();
                        $scope.metaData.updateResponseCombinations();
                    } catch(err) {
                        window.alert("The file did not contain a valid study design");
                    }

                    $scope.processing = false;
                    $scope.mode = $scope.studyDesign.viewTypeEnum;
                    $scope.view =  $scope.glimmpseConstants.viewTypeStudyDesign;
                });
                $form[0].reset();
            }
        });

    };

    /**
     * Called prior to submission of save form.  Updates
     * the value of the study design JSON in a hidden field
     * in the save form.
     */
    $scope.updateStudyDesignJSON = function() {
        $scope.studyDesignJSON = angular.toJson($scope.studyDesign);
    };

    /**
     * Called prior to submission of save form.  Updates
     * the value of the study design JSON in a hidden field
     * in the save form.
     */
    $scope.updateResultsCSV = function() {
        // add header row
        var resultsCSV = "desiredPower,actualPower,totalSampleSize,alpha,betaScale,sigmaScale,test,powerMethod,quantile," +
            "ciLower,ciUpper,errorCode,errorMessage\n";
        if ($scope.powerService.cachedResults !== undefined) {
            for(var i = 0; i < $scope.powerService.cachedResults.length; i++) {
                var result = $scope.powerService.cachedResults[i];
                resultsCSV +=
                        result.nominalPower.value + "," +
                        result.actualPower + "," +
                        result.totalSampleSize + "," +
                        result.alpha.alphaValue + "," +
                        result.betaScale.value + "," +
                        result.sigmaScale.value + "," +
                        result.test.type + "," +
                        result.powerMethod.powerMethodEnum + "," +
                        (result.quantile !== null ? result.quantile.value : "") + "," +
                        (result.confidenceInterval !== null ? result.confidenceInterval.lowerLimit : "") + "," +
                        (result.confidenceInterval !== null ? result.confidenceInterval.upperLimit : "") + "," +
                        (result.errorCode !== null ? result.errorCode : "") + "," +
                        (result.errorMessage !== null ? result.errorMessage : "") + "\n"
                ;

            }
        }
        $scope.resultsCSV = resultsCSV;

    };

    /**
     * Switch between the study design view and the results view
     * @param view
     */
    $scope.setView = function(view) {
        $scope.view = view;
    };

    /**
     * Get the current view (either design or results)
     * @returns {string}
     */
    $scope.getView = function() {
        return $scope.view;
    };

    /**
     * Switch between matrix and guided mode
     * @param mode
     */
    $scope.setMode = function(mode) {
        $scope.mode = mode;
        $scope.studyDesign.viewTypeEnum = mode;
        if ($scope.mode == $scope.glimmpseConstants.modeMatrix) {
            // set the default matrices
            $scope.studyDesign.initializeDefaultMatrices();
        }
    };

    /**
     * Get the current mode
     * @returns {*}
     */
    $scope.getMode = function() {
        return $scope.mode;
    };

    /**
     * Indicates if the specified route is currently active.
     * Used by the left navigation bar to identify the
     * menu item selected by the user.
     *
     * @param route
     * @returns {boolean}
     */
    $scope.isActive = function(route) {
        return route === $location.path();
    };

    /**
     * Determines if the study design is complete and
     * can be submitted to the power service
     *
     * @returns {boolean}
     */
    $scope.calculateAllowed = function() {
        if ($scope.getMode() == $scope.glimmpseConstants.modeGuided) {
            return (
                $scope.testDone($scope.state.solvingFor) &&
                $scope.testDone($scope.state.nominalPower) &&
                $scope.testDone($scope.state.typeIError) &&
                $scope.testDone($scope.state.predictors) &&
                $scope.testDone($scope.state.covariates) &&
                $scope.testDone($scope.state.isu) &&
                $scope.testDone($scope.state.relativeGroupSize) &&
                $scope.testDone($scope.state.smallestGroupSize) &&
                $scope.testDone($scope.state.responseVariables) &&
                $scope.testDone($scope.state.repeatedMeasures) &&
                $scope.testDone($scope.state.hypothesis) &&
                $scope.testDone($scope.state.means) &&
                $scope.testDone($scope.state.meansScale) &&
                $scope.testDone($scope.state.variabilityWithin) &&
                $scope.testDone($scope.state.variabilityCovariate) &&
                $scope.testDone($scope.state.variabilityScale) &&
                $scope.testDone($scope.state.test) &&
                $scope.testDone($scope.state.powerMethod) &&
                $scope.testDone($scope.state.confidenceIntervals) &&
                $scope.testDone($scope.state.plotOptions)
                );
        } else if ($scope.getMode() == $scope.glimmpseConstants.modeMatrix) {
            return (
                $scope.testDone($scope.state.solvingFor) &&
                $scope.testDone($scope.state.nominalPower) &&
                $scope.testDone($scope.state.typeIError) &&
                $scope.testDone($scope.state.designEssence) &&
                $scope.testDone($scope.state.covariates) &&
                $scope.testDone($scope.state.relativeGroupSize) &&
                $scope.testDone($scope.state.smallestGroupSize) &&
                $scope.testDone($scope.state.beta) &&
                $scope.testDone($scope.state.meansScale) &&
                $scope.testDone($scope.state.betweenContrast) &&
                $scope.testDone($scope.state.withinContrast) &&
                $scope.testDone($scope.state.thetaNull) &&
                $scope.testDone($scope.state.sigmaE) &&
                $scope.testDone($scope.state.sigmaG) &&
                $scope.testDone($scope.state.sigmaYG) &&
                $scope.testDone($scope.state.sigmaY) &&
                $scope.testDone($scope.state.variabilityScale) &&
                $scope.testDone($scope.state.powerMethod) &&
                $scope.testDone($scope.state.confidenceIntervals) &&
                $scope.testDone($scope.state.plotOptions)

                );
        }
    };

    /**
     * Clear the cached results so the results view will reload
     */
    $scope.calculate = function() {
        powerService.clearCache();
        angular.element('#nav-results').collapse({'toggle': true, parent: '#nav-accordion'});
        $scope.setView($scope.glimmpseConstants.viewTypeResults);
    };



})


/**
 * Controller to get/set what the user is solving for
 */
.controller('solutionTypeController', function($scope, glimmpseConstants, studyDesignService) {

    init();
    function init() {
        $scope.studyDesign = studyDesignService;
        $scope.glimmpseConstants = glimmpseConstants;
    }

})


/**
 * Controller managing the nominal power list
 */
.controller('nominalPowerController', function($scope, glimmpseConstants, studyDesignService) {

    init();
    function init() {
        $scope.studyDesign = studyDesignService;
        $scope.newNominalPower = undefined;
        $scope.editedNominalPower = undefined;
        $scope.glimmpseConstants = glimmpseConstants;
    }
    /**
     * Add a new nominal power value
     */
    $scope.addNominalPower = function () {
        var newPower = $scope.newNominalPower;
        if (newPower !== undefined) {
            // add the power to the list
            studyDesignService.nominalPowerList.push({
                idx: studyDesignService.nominalPowerList.length,
                value: newPower
            });
        }
        // reset the new power to null
        $scope.newNominalPower = undefined;
    };

    /**
     * Edit an existing nominal power
     */
    $scope.editNominalPower = function(power) {
        $scope.editedNominalPower = power;
    };


        /**
         * Called when editing is complete
         * @param power
         */
    $scope.doneEditing = function (power) {
        $scope.editedNominalPower = null;
        power.value = power.value.trim();

        if (!power.value) {
            $scope.deleteNominalPower(todo);
        }
    };

    /**
     * Delete an existing nominal power value
     */
    $scope.deleteNominalPower = function(power) {
        studyDesignService.nominalPowerList.splice(
            studyDesignService.nominalPowerList.indexOf(power), 1);
    };
})


/**
 * Controller managing the Type I error rate list
 */
.controller('typeIErrorRateController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newTypeIErrorRate = undefined;
            $scope.editedTypeIErrorRate = undefined;
            $scope.glimmpseConstants = glimmpseConstants;
        }
        /**
         * Add a new type I error rate
         */
        $scope.addTypeIErrorRate = function () {
            var newAlpha = $scope.newTypeIErrorRate;
            if (newAlpha !== undefined) {
            // add the power to the list
                studyDesignService.alphaList.push({
                    idx: studyDesignService.alphaList.length,
                    alphaValue: newAlpha
                });
            }
            // reset the new power to null
            $scope.newTypeIErrorRate = undefined;
        };

        /**
         * Delete an existing alpha value
         */
        $scope.deleteTypeIErrorRate = function(alpha) {
            studyDesignService.alphaList.splice(
                studyDesignService.alphaList.indexOf(alpha), 1);
        };
    })


/**
 * Controller managing the scale factor for covariance
 */
    .controller('scaleFactorForVarianceController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newScaleFactorForVariance = undefined;
            $scope.editedScaleFactorForVariance= undefined;
            $scope.glimmpseConstants = glimmpseConstants;
        }
        /**
         * Add a new scale factor for covariance
         */
        $scope.addScaleFactorForVariance = function () {
            var newScale = $scope.newScaleFactorForVariance;
            if (newScale !== undefined) {
                // add the scale factor to the list
                studyDesignService.sigmaScaleList.push({
                    idx: studyDesignService.sigmaScaleList.length,
                    value: newScale
                });
            }
            // reset the new factor to null
            $scope.newScaleFactorForVariance = undefined;
        };

        /**
         * Edit an existing scale factor for covariance
         */
        $scope.editScaleFactorForVariance = function(factor) {
            $scope.editedScaleFactorForVariance = factor;
        };


        /**
         * Called when editing is complete
         * @param factor
         */
        $scope.doneEditing = function (factor) {
            $scope.editedScaleFactorForVariance= null;
            factor.value = factor.value.trim();

            if (!factor.value) {
                $scope.deleteScaleFactorForVariance(factor);
            }
        };

        /**
         * Delete an existing scale factor value
         */
        $scope.deleteScaleFactorForVariance = function(factor) {
            studyDesignService.sigmaScaleList.splice(
                studyDesignService.sigmaScaleList.indexOf(factor), 1);
        };
    })


/**
 * Controller managing the scale factor for means
 */
    .controller('scaleFactorForMeansController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newScaleFactorForMeans = undefined;
            $scope.editedScaleFactorForMeans= undefined;
            $scope.glimmpseConstants = glimmpseConstants;
        }
        /**
         * Add a new scale factor for means
         */
        $scope.addScaleFactorForMeans = function () {
            var newScale = $scope.newScaleFactorForMeans;
            if (newScale !== undefined) {
                // add the scale factor to the list
                studyDesignService.betaScaleList.push({
                    idx: studyDesignService.betaScaleList.length,
                    value: newScale
                });
            }
            // reset the new factor to null
            $scope.newScaleFactorForMeans = undefined;
        };

        /**
         * Edit an existing scale factor for means
         */
        $scope.editScaleFactorForMeans = function(factor) {
            $scope.editedScaleFactorForMeans = factor;
        };


        /**
         * Called when editing is complete
         * @param factor
         */
        $scope.doneEditing = function (factor) {
            $scope.editedScaleFactorForMeans= null;
            factor.value = factor.value.trim();

            if (!factor.value) {
                $scope.deleteScaleFactorForMeans(factor);
            }
        };

        /**
         * Delete an existing scale factor value
         */
        $scope.deleteScaleFactorForMeans = function(factor) {
            studyDesignService.betaScaleList.splice(
                studyDesignService.betaScaleList.indexOf(factor), 1);
        };
    })

/**
 * Controller managing the smallest group size list
 */
    .controller('sampleSizeController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newSampleSize = undefined;
            $scope.editedSampleSize = undefined;
            $scope.glimmpseConstants = glimmpseConstants;
        }
        /**
         * Add a new sample size
         */
        $scope.addSampleSize = function () {
            var newN = $scope.newSampleSize;
            if (newN !== undefined) {
                // add the power to the list
                studyDesignService.sampleSizeList.push({
                    idx: studyDesignService.sampleSizeList.length,
                    value: newN
                });
            }
            // reset the new sample size to null
            $scope.newSampleSize = undefined;
        };

        /**
         * Edit an existing sample size
         */
        $scope.editSampleSize = function(samplesize) {
            $scope.editedSampleSize = samplesize;
        };


        /**
         * Called when editing is complete
         * @param samplesize
         */
        $scope.doneEditing = function (samplesize) {
            $scope.editedSampleSize = null;
            samplesize.value = samplesize.value.trim();

            if (!samplesize.value) {
                $scope.deleteSampleSize(samplesize);
            }
        };

        /**
         * Delete an existing nominal power value
         */
        $scope.deleteSampleSize = function(samplesize) {
            studyDesignService.sampleSizeList.splice(
                studyDesignService.sampleSizeList.indexOf(samplesize), 1);
        };
    })

/**
 * Controller managing the response variables list
 */
    .controller('responseController', function($scope, glimmpseConstants, matrixUtilities,
                                               studyDesignService, studyDesignMetaData) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.metaData = studyDesignMetaData;
            $scope.newResponse = '';
            $scope.editedResponse = '';
            $scope.glimmpseConstants = glimmpseConstants;
        }

        /**
         * When a response is added or remove, this function
         * ensures that the beta matrix and covariance structures
         * are still in sync with the responses list
         */
        $scope.syncStudyDesign = function() {

            // update the list of combinations of responses
            $scope.metaData.updateResponseCombinations();
            // update the beta matrix
            $scope.studyDesign.resizeBeta($scope.metaData.getNumberOfPredictorCombinations(),
                $scope.metaData.getNumberOfResponseCombinations()
            );

            // update covariance of the responses
            var covariance = $scope.studyDesign.getCovarianceByName(glimmpseConstants.covarianceResponses);
            if ($scope.studyDesign.responseList.length <= 0) {
                // if no responses, remove the covariance object
                if (covariance !== undefined) {
                    // Note: it should always be the case that the response covariance is
                    // the last in the array.
                    $scope.studyDesign.covariance.pop();
                }
                // remove SigmaYg
                if ($scope.studyDesign.gaussianCovariate) {
                   $scope.studyDesign.removeMatrixByName(glimmpseConstants.matrixSigmaYG);
                }

            } else {
                // update the size of the existsing covariance or create a fresh one
                if (covariance === undefined) {
                    $scope.studyDesign.covariance.push(
                        $scope.matrixUtils.createUnstructuredCorrelation(glimmpseConstants.covarianceResponses,
                            $scope.studyDesign.responseList.length)
                    );
                    if ($scope.studyDesign.gaussianCovariate) {
                        $scope.studyDesign.matrixSet.push(
                            $scope.matrixUtils.createNamedFilledMatrix(glimmpseConstants.matrixSigmaYG,
                                $scope.studyDesign.getNumberOfResponses(), 1, 0)
                        );
                    }
                } else {
                    $scope.matrixUtils.resizeCovariance(covariance, covariance.rows,
                        $scope.studyDesign.responseList.length, 0, 1);
                    if ($scope.studyDesign.gaussianCovariate) {
                        var sigmaYg = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG);
                        if (sigmaYg !== undefined) {
                            $scope.matrixUtils.resizeRows(sigmaYg, sigmaYg.rows,
                                $scope.studyDesign.getNumberOfResponses(), 0, 1);
                        }
                    }
                }
            }


        };

        /**
         * Add a new response variable
         */
        $scope.addResponse = function () {
            var newOutcome = $scope.newResponse;
            if (newOutcome.length > 0) {
                // add the response to the list
                $scope.studyDesign.responseList.push({
                    idx: $scope.studyDesign.responseList.length,
                    name: newOutcome
                });
            }
            // reset the new response to null
            $scope.newResponse = '';

            // update the study design
            $scope.syncStudyDesign();
        };

        /**
         * Delete an existing nominal power value
         */
        $scope.deleteResponse = function(response) {
            studyDesignService.responseList.splice(
                studyDesignService.responseList.indexOf(response), 1);
            // update the study design
            $scope.syncStudyDesign();
        };

    })

/**
 * Controller managing the predictors
 */
    .controller('predictorsController', function($scope, glimmpseConstants, studyDesignService,
        studyDesignMetaData) {

        init();
        function init() {

            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
            $scope.newPredictorName = undefined;
            $scope.newCategoryName = undefined;
            $scope.currentPredictor = undefined;
            $scope.glimmpseConstants = glimmpseConstants;
        }

        /**
         * Returns true if the specified predictor is currently active
         */
        $scope.isActivePredictor = function(factor) {
            return ($scope.currentPredictor == factor);
        };

        /**
         * Updates the dimensions of the beta matrix and relative group
         * size list when a predictor or category is added/deleted
         */
        $scope.syncStudyDesign = function() {
            // update the list of combinations of predictors
            $scope.metaData.updatePredictorCombinations();
            var numCombos = $scope.metaData.getNumberOfPredictorCombinations();
            $scope.studyDesign.resizeBeta(numCombos,
                $scope.metaData.getNumberOfResponseCombinations()
            );
            // update the relative group size list
            $scope.studyDesign.resizeRelativeGroupSizeList(numCombos);
        };

        /**
         * Add a new predictor name
         */
        $scope.addPredictor = function () {
            var newPredictor = $scope.newPredictorName;
            if (newPredictor !== undefined) {
                // add the predictor to the list
                var newPredictorObject = {
                    idx: $scope.studyDesign.betweenParticipantFactorList.length,
                    predictorName: newPredictor,
                    categoryList: []
                };
                $scope.studyDesign.betweenParticipantFactorList.push(newPredictorObject);

                // set the newly added predictor as active and show its categories
                $scope.currentPredictor = newPredictorObject;

                // sync the study design
                $scope.syncStudyDesign();
            }
            // reset the new sample size to null
            $scope.newPredictorName = undefined;

        };

        /**
         * Delete an existing predictor variable
         */
        $scope.deletePredictor = function(factor) {
            if (factor == $scope.currentPredictor) {
                $scope.currentPredictor = undefined;
            }
            // remove the predictor
            studyDesignService.betweenParticipantFactorList.splice(
                studyDesignService.betweenParticipantFactorList.indexOf(factor), 1);

            // sync the study design
            $scope.syncStudyDesign();

            // if the predictor appears in the hypothesis, remove it
            var hypothesis = $scope.studyDesign.hypothesis[0];
            if (hypothesis !== undefined && hypothesis.betweenParticipantFactorMapList !== undefined) {
                for(var i = 0; i < hypothesis.betweenParticipantFactorMapList.length; i++) {
                    var map = hypothesis.betweenParticipantFactorMapList[i];
                    if (map.betweenParticipantFactor == factor) {
                        hypothesis.betweenParticipantFactorMapList.splice(i, 1);
                        break;
                    }
                }
                hypothesis.type = $scope.studyDesign.getBestHypothesisType(hypothesis.type);
            }

        };

        /**
         * Display the categories for the given factor
         * @param factor
         */
        $scope.showCategories = function(factor) {
            $scope.currentPredictor = factor;
        };

        /**
         * Add a new category name
         */
        $scope.addCategory = function () {
            var newCategory = $scope.newCategoryName;
            if ($scope.currentPredictor !== undefined &&
                newCategory !== undefined) {
                // add the category to the list
                $scope.currentPredictor.categoryList.push({
                    idx: 0,
                    category: newCategory
                });

                // sync the study design
                $scope.syncStudyDesign();
            }
            // reset the new sample size to null
            $scope.newCategoryName = undefined;
        };

        /**
         * Delete the specified category
         */
        $scope.deleteCategory = function(category) {
            $scope.currentPredictor.categoryList.splice(
                $scope.currentPredictor.categoryList.indexOf(category), 1);

            // sync the study design
            $scope.syncStudyDesign();


            // if the predictor appears in the hypothesis, make sure the selected trend
            // is still valid
            var hypothesis = $scope.studyDesign.hypothesis[0];
            if (hypothesis !== undefined && hypothesis.betweenParticipantFactorMapList !== undefined) {
                for(var i = 0; i < hypothesis.betweenParticipantFactorMapList.length; i++) {
                    var map = hypothesis.betweenParticipantFactorMapList[i];
                    if (map.betweenParticipantFactor == $scope.currentPredictor) {
                        map.type = $scope.studyDesign.getBestTrend(map.type, $scope.currentPredictor.categoryList.length);
                    }
                }
            }
        };
    })

    /**
     * Controller managing the covariates
     */
    .controller('covariatesController', function($scope, matrixUtilities, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.glimmpseConstants = glimmpseConstants;
        }

        /**
         * Toggle
         */
        $scope.updateMatrixSet = function() {

            if ($scope.studyDesign.gaussianCovariate) {
                // Add the beta random matrix
                // TODO: drop beta random from the domain layer - not needed for power
                var beta = $scope.studyDesign.getMatrixByName($scope.glimmpseConstants.matrixBeta);
                if (beta !== undefined) {
                    $scope.studyDesign.matrixSet.push(
                        $scope.matrixUtils.createNamedFilledMatrix(
                            $scope.glimmpseConstants.matrixBetaRandom, 1, beta.columns, 1
                        )
                    );
                    // add default sigma YG
                    $scope.studyDesign.matrixSet.push(
                        $scope.matrixUtils.createNamedFilledMatrix(
                            $scope.glimmpseConstants.matrixSigmaYG, beta.columns, 1, 0
                        )
                    );
                }

                // add default sigma G
                $scope.studyDesign.matrixSet.push(
                    $scope.matrixUtils.createNamedIdentityMatrix(
                        $scope.glimmpseConstants.matrixSigmaG, 1
                    )
                );

                if ($scope.studyDesign.viewTypeEnum == $scope.glimmpseConstants.modeMatrix) {
                    // add default sigma Y  - only used for matrix mode
                    $scope.studyDesign.matrixSet.push(
                        $scope.matrixUtils.createNamedIdentityMatrix(
                            $scope.glimmpseConstants.matrixSigmaY, beta.columns
                        )
                    );
                    // add default C-random - only used for matrix mode
                    var betweenContrast = $scope.studyDesign.getMatrixByName($scope.glimmpseConstants.matrixBetweenContrast);
                    $scope.studyDesign.matrixSet.push(
                        $scope.matrixUtils.createNamedFilledMatrix(
                            $scope.glimmpseConstants.matrixBetweenContrastRandom, betweenContrast.rows, 1, 0
                        )
                    );
                }

            } else {
                // clear the matrices related to the covariate
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixBetaRandom);
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixBetweenContrastRandom);
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixSigmaY);
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixSigmaG);
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixSigmaYG);
            }
        };
    })


/**
 * Controller managing the statistical tests
 */
    .controller('statisticalTestsController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.glimmpseConstants = glimmpseConstants;

            /**
             * Use the name of a statistical test to find its index
             * (note we define this in the init routine so we can use
             * it during the setup of the selection list)
             */
            $scope.getTestIndexByName = function(testType) {
                //var index = -1;
                for (var i=0; i < studyDesignService.statisticalTestList.length; i++) {
                    if (testType == studyDesignService.statisticalTestList[i].type) {
                        return i;
                    }
                }
                return -1;
            };

            // lists of indicators of which test is selected
            $scope.testsList = [
                {label: "Hotelling Lawley Trace",
                    type: $scope.glimmpseConstants.testHotellingLawleyTrace,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testHotellingLawleyTrace) != -1)},
                {label: "Pillai-Bartlett Trace",
                    type: $scope.glimmpseConstants.testPillaiBartlettTrace,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testPillaiBartlettTrace) != -1)},
                {label: "Wilks Likelihood Ratio",
                    type: $scope.glimmpseConstants.testWilksLambda,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testWilksLambda) != -1)},
                {label: "Univariate Approach to Repeated Measures with Box Correction",
                    type: $scope.glimmpseConstants.testUnirepBox,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testUnirepBox) != -1)},
                {label: "Univariate Approach to Repeated Measures with Geisser-Greenhouse Correction",
                    type: $scope.glimmpseConstants.testUnirepGG,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testUnirepGG) != -1)},
                {label: "Univariate Approach to Repeated Measures with Huynh-Feldt Correction",
                    type: $scope.glimmpseConstants.testUnirepHF,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testUnirepHF) != -1)},
                {label: "Univariate Approach to Repeated Measures, uncorrected",
                    type: $scope.glimmpseConstants.testUnirep,
                    selected: ($scope.getTestIndexByName($scope.glimmpseConstants.testUnirep) != -1)}
            ];
        }

        /**
         * Update statisticalTestList with insert or delete of a new test
         */
        $scope.updateStatisticalTest = function(test) {
            if (test.selected) {
                studyDesignService.statisticalTestList.push({
                    idx:'0', type:test.type
                });
            } else {
                studyDesignService.statisticalTestList.splice(
                    $scope.getTestIndexByName(test.type),1);
            }
        };
    })

/**
 * Controller managing the clusters
 */
    .controller('clusteringController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
        }

        $scope.addCluster = function() {

             if (studyDesignService.clusteringTree.length < 3) {
                studyDesignService.clusteringTree.push({
                idx: studyDesignService.clusteringTree.length,
                node: 0, parent: 0
                });
             }
        };
        /**
         *  Remove a cluster from the list
         */
        $scope.removeCluster = function() {

            studyDesignService.clusteringTree.pop();
        };

        /**
         * Remove all levels of clustering
         */

        $scope.removeClustering = function() {
            studyDesignService.clusteringTree = [];
        };
    })

/**
 * Controller managing repeated measures
 */
    .controller('repeatedMeasuresController', function($scope, glimmpseConstants, matrixUtilities,
                                                       studyDesignService, studyDesignMetaData) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
            $scope.matrixUtils = matrixUtilities;
            $scope.glimmpseConstants = glimmpseConstants;
            $scope.validNumberOfMeasurements = [2,3,4,5,6,7,8,9,10];
            $scope.validTypes = [
                {label: "Numeric", value: $scope.glimmpseConstants.repeatedMeasuresTypeNumeric},
                {label: "Ordinal", value: $scope.glimmpseConstants.repeatedMeasuresTypeOrdinal},
                {label: "Categorical", value: $scope.glimmpseConstants.repeatedMeasuresTypeCategorical}
            ];
        }

        /**
         * When a response is added or remove, this function
         * ensures that the beta matrix is still in sync with the responses list
         */
        $scope.syncTotalResponses = function() {
            // update the list of combinations of responses
            $scope.metaData.updateResponseCombinations();
            // update the beta matrix
            $scope.studyDesign.resizeBeta($scope.metaData.getNumberOfPredictorCombinations(),
                $scope.metaData.getNumberOfResponseCombinations()
            );
            // if the design has a covariate, resize the sigmaYg matrix
            if ($scope.studyDesign.gaussianCovariate) {
                var sigmaYg = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG);
                $scope.matrixUtils.resizeRows(sigmaYg, sigmaYg.rows,
                    $scope.studyDesign.getNumberOfResponses(), 0, 0);
            }
        };

        /**
         * Add a new level of repeated measures
         */
        $scope.addLevel = function() {

            if ($scope.studyDesign.repeatedMeasuresTree.length < 3) {
                $scope.studyDesign.repeatedMeasuresTree.push({
                    idx: 0,
                    node: 0,
                    parent: 0,
                    repeatedMeasuresDimensionType: $scope.glimmpseConstants.repeatedMeasuresTypeNumeric,
                    numberOfMeasurements: 2,
                    spacingList: [
                        {idx: 1, value: 1},
                        {idx: 2, value: 2}
                    ]
                });

                /* synchronize the study design */
                $scope.syncTotalResponses();

                // add a covariance object
                var rmLevel = $scope.studyDesign.repeatedMeasuresTree.length-1;
                if (rmLevel >= 0) {
                    $scope.studyDesign.covariance.splice(rmLevel, 0,
                        $scope.matrixUtils.createLEARCorrelation("", 2)
                    );
                }
            }

        };

        /**
         * When the units are changed, update the corresponding
         * name in the covariance list
         *
         * @param factor
         * @param rmLevel
         */
        $scope.updateDimension = function(factor, rmLevel) {
            $scope.studyDesign.covariance[rmLevel].name = factor.dimension;
        };

        /**
         * Update spacingList of repeated measure
         */
        $scope.updateNumberOfMeasurements = function(factor, rmLevel) {
            if (factor.spacingList === undefined) {
                factor.spacingList = [];
            }
            if (factor.numberOfMeasurements > factor.spacingList.length) {
                // assumes that the max value is the last value
                var startValue = 1;
                if (factor.spacingList.length > 0) {
                    startValue = factor.spacingList[factor.spacingList.length-1].value + 1;
                }
                for(var i = factor.spacingList.length; i < factor.numberOfMeasurements; i++) {
                    factor.spacingList.push({idx: factor.spacingList.length+1, value: startValue});
                    startValue++;
                }
            } else if (factor.numberOfMeasurements < factor.spacingList.length) {
                factor.spacingList.splice(factor.numberOfMeasurements);

                // if this factor is included in the hypothesis, make sure the
                // chosen trend is still valid
                var hypothesis = $scope.studyDesign.hypothesis[0];
                if (hypothesis !== undefined && hypothesis.repeatedMeasuresMapTree !== undefined) {
                    for(var rmi = 0; rmi < hypothesis.repeatedMeasuresMapTree.length; rmi++) {
                        var map = hypothesis.repeatedMeasuresMapTree[rmi];
                        if (map.repeatedMeasuresNode == factor) {
                            map.type = $scope.studyDesign.getBestTrend(map.type, factor.numberOfMeasurements);
                            break;
                        }
                    }
                }
            }

            // update the meta data
            $scope.syncTotalResponses();

            /* resize the covariance associated with this factor
             * note, no need to do so if the user selected the LEAR correlation
             * structure, since we build the matrix server side for those
             */
            var covariance = $scope.studyDesign.covariance[rmLevel];
            $scope.matrixUtils.resizeCovariance(covariance,
                covariance.rows, factor.numberOfMeasurements, 0, 1);

        };

        /**
         * Remove a repeated measure
         */
        $scope.removeLevel = function() {
            var rmLevel = $scope.studyDesign.repeatedMeasuresTree.length-1;

            // remove the covariance object corresponding to this level of repeated measures
            $scope.studyDesign.covariance.splice(rmLevel, 1);

            // remove the repeated measures level from the tree
            var factor = $scope.studyDesign.repeatedMeasuresTree.pop();
            // update the beta matrix and number of responses
            $scope.syncTotalResponses();
            // if the factor appears in the hypothesis, remove it
            var hypothesis = $scope.studyDesign.hypothesis[0];
            if (hypothesis !== undefined && hypothesis.repeatedMeasuresMapTree !== undefined) {
                for(var i = 0; i < hypothesis.repeatedMeasuresMapTree.length; i++) {
                    var map = hypothesis.repeatedMeasuresMapTree[i];
                    if (map.repeatedMeasuresNode == factor) {
                        hypothesis.repeatedMeasuresMapTree.splice(i, 1);
                        break;
                    }
                }
                hypothesis.type = $scope.studyDesign.getBestHypothesisType(hypothesis.type);
            }
        };

        /**
         * Add all levels of repeated measures
         */
        $scope.removeRepeatedMeasures = function() {
            var maxRmLevel = studyDesignService.repeatedMeasuresTree.length;
            // remove the covariance objects related to the repeated measures
            studyDesignService.covariance.splice(0, maxRmLevel);
            // clear the tree
            studyDesignService.repeatedMeasuresTree = [];
            // clear any repeated measures from the hypothesis
            var hypothesis = $scope.studyDesign.hypothesis[0];
            if (hypothesis !== undefined && hypothesis.repeatedMeasuresMapTree !== undefined) {
                hypothesis.repeatedMeasuresMapTree = [];
                hypothesis.type = $scope.studyDesign.getBestHypothesisType(hypothesis.type);
            }
            // update the beta matrix and number of responses
            $scope.syncTotalResponses();
        };

        /**
         * Reset the spacing list to equal spacing
         *
         * @param factor
         */
        $scope.resetToEqualSpacing = function(factor) {
            if (factor.spacingList !== undefined) {
                for(var i = 0; i < factor.spacingList.length; i++) {
                    factor.spacingList[i].value = i+1;
                }
            }
        };

    })


    /**
     * Controller managing the means view (i.e. beta matrix)
     */
    .controller('meansViewController', function($scope, glimmpseConstants, studyDesignService,
        studyDesignMetaData) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
            $scope.betaMatrix = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBeta);
        }
    })

/**
 * Controller managing the hypotheses - for now, we only support a single hypothesis
 */
    .controller('hypothesesController', function($scope, glimmpseConstants, studyDesignService) {

        /**
         * Returns the mapping for the given between participant factor
         * in the hypothesis object, or undefined if it is not found
         *
         * @param factor
         * @returns factor mapping object
         */
        $scope.getBetweenFactorMap = function(factor) {
            for(var i = 0; i < $scope.hypothesis.betweenParticipantFactorMapList.length; i++) {
                var mapping = $scope.hypothesis.betweenParticipantFactorMapList[i];
                if (factor == mapping.betweenParticipantFactor) {
                    return mapping;
                }
            }
            return undefined;
        };

        /**
         * Returns the mapping for the given within participant factor
         * in the hypothesis object, or undefined if it is not found
         *
         * @param factor
         * @returns factor mapping object
         */
        $scope.getWithinFactorMap = function(factor) {
            for(var i = 0; i < $scope.hypothesis.repeatedMeasuresMapTree.length; i++) {
                var mapping = $scope.hypothesis.repeatedMeasuresMapTree[i];
                if (factor == mapping.repeatedMeasuresNode) {
                    return mapping;
                }
            }
            return undefined;
        };

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.hypothesis = studyDesignService.hypothesis[0];
            $scope.thetaNull = studyDesignService.getMatrixByName(glimmpseConstants.matrixThetaNull);
            $scope.betweenFactorMapMetaDataList = [];
            $scope.withinFactorMapMetaDataList = [];
            $scope.currentBetweenFactorMapMetaData = undefined;
            $scope.currentWithinFactorMapMetaData = undefined;
            $scope.validTypeList = [];
            $scope.showHelp = false;
            // make sure we have a valid theta null in case of grand mean hypotheses

            // determine which types of hypotheses are valid for the current design
            // main effects and trends require at least one between or within factor
            // interactions require a total of at least two factors
            var totalFactors = studyDesignService.betweenParticipantFactorList.length +
                studyDesignService.repeatedMeasuresTree.length;
            // TODO - move the display labels to constants
            $scope.validTypeList.push({
                label: "Grand Mean",
                value: glimmpseConstants.hypothesisGrandMean
            });
            if (totalFactors > 0) {
                $scope.validTypeList.push({
                    label: "Main Effect",
                    value: glimmpseConstants.hypothesisMainEffect
                });
                $scope.validTypeList.push({
                    label: "Trend",
                    value: glimmpseConstants.hypothesisTrend
                });
            }
            if (totalFactors > 1) {
                $scope.validTypeList.push({
                    label: "Interaction",
                    value: glimmpseConstants.hypothesisInteraction
                });
            }

            // build mappings for between factors, and keep track of selection status
            for (var i = 0; i < studyDesignService.betweenParticipantFactorList.length; i++)  {
                var factor = studyDesignService.betweenParticipantFactorList[i];
                // if the factor appears in the hypothesis, get the mapping
                var factorMap = $scope.getBetweenFactorMap(factor);
                var inHypothesis = (factorMap !== undefined);
                // if the factor did not appear in the hypothesis, create a default map
                if (!inHypothesis) {
                    factorMap = {
                        type: glimmpseConstants.trendNone,
                        betweenParticipantFactor: factor
                    };
                }
                var metaData = {
                    factorMap: factorMap,
                    selected: inHypothesis,
                    showTrends: false
                };
                $scope.betweenFactorMapMetaDataList.push(metaData);
                if (($scope.hypothesis.type == glimmpseConstants.hypothesisMainEffect ||
                    $scope.hypothesis.type == glimmpseConstants.hypothesisTrend) &&
                    inHypothesis) {
                    $scope.currentBetweenFactorMapMetaData = metaData;
                }
            }

            // build mappings for within factors, and keep track of selection status
            for (var rmi = 0; rmi < studyDesignService.repeatedMeasuresTree.length; rmi++)  {
                var rmFactor = studyDesignService.repeatedMeasuresTree[rmi];
                var rmFactorMap = $scope.getWithinFactorMap(rmFactor);
                var inWithinHypothesis = (rmFactorMap !== undefined);
                if (!inWithinHypothesis) {
                    rmFactorMap = {
                        type: glimmpseConstants.trendNone,
                        repeatedMeasuresNode: rmFactor
                    };
                }
                var rmMetaData = {
                    factorMap: rmFactorMap,
                    selected: inWithinHypothesis,
                    showTrends: false
                };
                $scope.withinFactorMapMetaDataList.push(rmMetaData);
                if (($scope.hypothesis.type == glimmpseConstants.hypothesisMainEffect ||
                    $scope.hypothesis.type == glimmpseConstants.hypothesisTrend) &&
                    inWithinHypothesis) {
                    $scope.currentWithinFactorMapMetaData = rmMetaData;
                }
            }

        }

        /**
         * Show/hide the help text about hypothesis types
         */
        $scope.toggleHelp = function() {
            $scope.showHelp = !$scope.showHelp;
        };

        /**
         * Deselect all of the factors in the factor map lists
         */
        $scope.deselectAllFactors = function() {
            for(var b = 0; b < $scope.betweenFactorMapMetaDataList.length; b++) {
                $scope.betweenFactorMapMetaDataList[b].selected = false;
            }
            for(var w = 0; w < $scope.withinFactorMapMetaDataList.length; w++) {
                $scope.withinFactorMapMetaDataList[w].selected = false;
            }
        };

        /**
         * Get the meta data associated with the given between factor mapping
         * @param factorMap
         */
        $scope.getBetweenFactorMapMetaData = function(factorMap) {
            for(var i = 0; i < $scope.betweenFactorMapMetaDataList.length; i++) {
                var metaData = $scope.betweenFactorMapMetaDataList[i];
                if (factorMap == metaData.factorMap) {
                    return metaData;
                }
            }
            return undefined;
        };

        /**
         * Get the meta data associated with the given within factor mapping
         * @param factorMap
         */
        $scope.getWithinFactorMapMetaData = function(factorMap) {
            for(var i = 0; i < $scope.withinFactorMapMetaDataList.length; i++) {
                var metaData = $scope.withinFactorMapMetaDataList[i];
                if (factorMap == metaData.factorMap) {
                    return metaData;
                }
            }
            return undefined;
        };

        /**
         * Update the study design when the hypothesis type changes
         */
        $scope.updateHypothesisType = function() {
            // clear the current selection of between/within factors
            $scope.currentBetweenFactorMapMetaData = undefined;
            $scope.currentWithinFactorMapMetaData = undefined;
            $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixThetaNull);
            $scope.thetaNull = undefined;

            if ($scope.hypothesis.type == $scope.glimmpseConstants.hypothesisGrandMean) {
                // clear the selection flag on the other mappings
                $scope.deselectAllFactors();

                $scope.hypothesis.betweenParticipantFactorMapList = [];
                $scope.hypothesis.repeatedMeasuresMapTree = [];
                $scope.thetaNull = {
                    idx: 0,
                    name: $scope.glimmpseConstants.matrixThetaNull,
                    rows: 1,
                    columns: 1,
                    data: {
                        data: [[0]]
                    }
                };
                $scope.studyDesign.matrixSet.push($scope.thetaNull);

            } else if ($scope.hypothesis.type == $scope.glimmpseConstants.hypothesisMainEffect ||
                $scope.hypothesis.type == $scope.glimmpseConstants.hypothesisTrend) {
                // clear the selection flag on the other mappings
                $scope.deselectAllFactors();

                // if the user switched from an interaction to a main effect, make
                // sure that only a single factor is selected
                if ($scope.hypothesis.betweenParticipantFactorMapList.length > 0 &&
                    $scope.hypothesis.repeatedMeasuresMapTree > 0) {
                    $scope.hypothesis.betweenParticipantFactorMapList.splice(1,
                        $scope.hypothesis.betweenParticipantFactorMapList.length-1);
                    $scope.hypothesis.repeatedMeasuresMapTree = [];
                    $scope.currentBetweenFactorMapMetaData =
                        $scope.getBetweenFactorMapMetaData($scope.hypothesis.betweenParticipantFactorMapList[0]);
                    $scope.currentBetweenFactorMapMetaData.selected = true;

                } else if ($scope.hypothesis.betweenParticipantFactorMapList.length > 0) {
                    $scope.hypothesis.betweenParticipantFactorMapList.splice(1,
                        $scope.hypothesis.betweenParticipantFactorMapList.length-1);
                    $scope.hypothesis.repeatedMeasuresMapTree = [];
                    $scope.currentBetweenFactorMapMetaData =
                        $scope.getBetweenFactorMapMetaData($scope.hypothesis.betweenParticipantFactorMapList[0]);
                    $scope.currentBetweenFactorMapMetaData.selected = true;

                } else if ($scope.hypothesis.repeatedMeasuresMapTree.length > 0) {
                    $scope.hypothesis.repeatedMeasuresMapTree.splice(1,
                        $scope.hypothesis.repeatedMeasuresMapTree.length-1);
                    $scope.hypothesis.betweenParticipantFactorMapList = [];
                    $scope.currentWithinFactorMapMetaData =
                        $scope.getWithinFactorMapMetaData($scope.hypothesis.repeatedMeasuresMapTree[0]);
                    $scope.currentWithinFactorMapMetaData.selected = true;
                }
            }
        };

        /****** handlers for the single selection cases of main effects and trends ****/
        /**
         * Add or remove a between participant factor from the hypothesis object
         * for main effect or trend hypotheses
         *
         * We can't just ng-model this directly since we need to update
         * the old mapping (selected=false) before we move on
         */
        $scope.updateBetweenFactorSingleSelect = function(map) {
            // clear the selection flag on the other mappings
            $scope.deselectAllFactors();
            $scope.hypothesis.betweenParticipantFactorMapList = [];
            $scope.hypothesis.repeatedMeasuresMapTree = [];
            // clear the within factor maps
            if ($scope.currentWithinFactorMapMetaData !== undefined) {
                $scope.currentWithinFactorMapMetaData = undefined;
            }
            map.selected = true;

            // store in the hypothesis
            $scope.hypothesis.betweenParticipantFactorMapList.push(map.factorMap);
        };

        /**
         * Add or remove a within participant factor from the hypothesis object
         * for main effect or trend hypotheses
         */
        $scope.updateWithinFactorSingleSelect = function(map) {
            // clear the selection flag on the other mappings
            $scope.deselectAllFactors();
            $scope.hypothesis.betweenParticipantFactorMapList = [];
            $scope.hypothesis.repeatedMeasuresMapTree = [];
            // clear the between factor maps
            if ($scope.currentBetweenFactorMapMetaData !== undefined) {
                $scope.currentBetweenFactorMapMetaData = undefined;
            }
            map.selected = true;

            // store in the hypothesis
            $scope.hypothesis.repeatedMeasuresMapTree.push(map.factorMap);
        };

        /********* handlers for the multiselect interaction case *******/
        /**
         * Update the between participant factor list
         * @param map
         */
        $scope.updateBetweenFactorMultiSelect = function(map) {
            if (map.selected) {
                if ($scope.getBetweenFactorMap(map.factorMap.betweenParticipantFactor) === undefined) {
                    $scope.hypothesis.betweenParticipantFactorMapList.push(map.factorMap);
                }
            } else {
                $scope.hypothesis.betweenParticipantFactorMapList.splice(
                    $scope.hypothesis.betweenParticipantFactorMapList.indexOf(map.factorMap), 1
                );
            }
        };

        /**
         * Update the within participant factor list
         * @param map
         */
        $scope.updateWithinFactorMultiSelect = function(map) {
            if (map.selected) {
                if ($scope.getWithinFactorMap(map.factorMap.repeatedMeasuresNode) === undefined) {
                    $scope.hypothesis.repeatedMeasuresMapTree.push(map.factorMap);
                }
            } else {
                $scope.hypothesis.repeatedMeasuresMapTree.splice(
                    $scope.hypothesis.repeatedMeasuresMapTree.indexOf(map.factorMap), 1
                );
            }
        };

        /********* utility functions **********/

        // todo - move to utility class or constants
        $scope.getTrendLabel = function(type) {
            if (type == glimmpseConstants.trendNone) {
                return 'None';
            } else if (type == glimmpseConstants.trendChangeFromBaseline) {
                return 'Change from baseline';
            } else if (type == glimmpseConstants.trendLinear) {
                return 'Linear';
            } else if (type == glimmpseConstants.trendQuadratic) {
                return 'Quadratic';
            } else if (type == glimmpseConstants.trendCubic) {
                return 'Cubic';
            } else if (type == glimmpseConstants.trendAllPolynomial) {
                return 'All polynomial';
            }
        };

        /**
         * Get the number of categories for a between participant factor
         * @param factor
         * @returns {*}
         */
        $scope.getBetweenLevels = function(factor) {
            if (factor !== undefined) {
                return factor.categoryList.length;
            }
            return 0;
        };

        /**
         * Get the number of measurements for a within participant factor
         * @param factor
         * @returns {*}
         */
        $scope.getWithinLevels = function(factor) {
            if (factor !== undefined) {
                return factor.numberOfMeasurements;
            }
            return 0;
        };

    })

    /*
    * Controller for the confidence intervals view
     */
    .controller('confidenceIntervalController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.betaFixedSigmaEstimated = (
                studyDesignService.confidenceIntervalDescriptions !== null &&
                studyDesignService.confidenceIntervalDescriptions.betaFixed &&
                !studyDesignService.confidenceIntervalDescriptions.sigmaFixed
                );
            $scope.betaEstimatedSigmaEstimated = (
                studyDesignService.confidenceIntervalDescriptions !== null &&
                !studyDesignService.confidenceIntervalDescriptions.betaFixed &&
                !studyDesignService.confidenceIntervalDescriptions.sigmaFixed
                );
        }

        /**
         * Toggle the confidence interval description on and off
         */
        $scope.toggleConfidenceIntervalDescription = function() {
            if ($scope.studyDesign.confidenceIntervalDescriptions !== null) {
                $scope.studyDesign.confidenceIntervalDescriptions = null;
            } else {
                $scope.studyDesign.confidenceIntervalDescriptions = {};
            }
        };

        /**
         * Set the assumptions regarding estimation of beta and sigma
         */
        $scope.setAssumptions = function(betaFixed, sigmaFixed) {
             if ($scope.studyDesign.confidenceIntervalDescriptions !== null) {
                 $scope.studyDesign.confidenceIntervalDescriptions.betaFixed = betaFixed;
                 $scope.studyDesign.confidenceIntervalDescriptions.sigmaFixed = sigmaFixed;
             }
        };
    })

    /**
     * Controller for power methods view
     */
    .controller('powerMethodController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newQuantile = undefined;
            $scope.unconditionalChecked = false;
            $scope.quantileChecked = false;
            for(var i in studyDesignService.powerMethodList) {
                var method = studyDesignService.powerMethodList[i];
                if (method.powerMethodEnum == $scope.glimmpseConstants.powerMethodUnconditional) {
                    $scope.unconditionalChecked = true;
                } else if (method.powerMethodEnum == $scope.glimmpseConstants.powerMethodQuantile) {
                    $scope.quantileChecked = true;
                }
            }
        }

        /**
         * Add or remote power methods from the power methods list
         * depending on the checkbox status
         *
         * @param methodName name of the method
         * @param checked
         */
        $scope.updateMethodList = function(methodName, checked) {
            var method = $scope.findMethod(methodName);
            if (checked === true) {
                if (method === null) {
                    // add the power to the list
                    $scope.studyDesign.powerMethodList.push({
                        idx: 0,
                        powerMethodEnum: methodName
                    });
                }
            } else {
                if (method !== null) {
                    $scope.studyDesign.powerMethodList.splice(
                        $scope.studyDesign.powerMethodList.indexOf(method), 1);
                }
            }
        };

        /**
         * Local the method object matching the specified method name
         * @param name
         * @returns {*}
         */
        $scope.findMethod = function(name) {
            // javascript looping is weird.  This loops over the indices.
            for(var i=0; i < studyDesignService.powerMethodList.length; i++) {
                if (name == studyDesignService.powerMethodList[i].powerMethodEnum) {
                    return studyDesignService.powerMethodList[i];
                }
            }
            return null;
        };

        /**
         * Add a new quantile
         */
        $scope.addQuantile = function () {
            var newQuantile = $scope.newQuantile;
            if (newQuantile !== undefined) {
                // add the power to the list
                studyDesignService.quantileList.push({
                    idx: studyDesignService.quantileList.length,
                    value: newQuantile
                });
            }
            // reset the new response to null
            $scope.newQuantile = undefined;
        };

        /**
         * Delete an existing quantile
         */
        $scope.deleteQuantile = function(quantile) {
            studyDesignService.quantileList.splice(
                studyDesignService.quantileList.indexOf(quantile), 1);
        };
    })

/**
 * Controller for variability within view
 */
    .controller('variabilityWithinController', function($scope, glimmpseConstants, studyDesignService) {

        /**
         * Pre-calculate the min/max distances for the LEAR model
         * when the user selected a repeated measures tab
         */
        $scope.updateLearDistances = function() {
            if ($scope.currentCovariance !== undefined &&
                $scope.currentCovariance.name != glimmpseConstants.covarianceResponses) {
                var rmFactor = $scope.studyDesign.repeatedMeasuresTree[
                    $scope.studyDesign.covariance.indexOf($scope.currentCovariance)
                    ];

                // maximum spacing between any of the measurements, assuming the list is in
                // ascending order
                $scope.maxDistance = Math.abs(rmFactor.spacingList[rmFactor.spacingList.length-1].value -
                    rmFactor.spacingList[0].value);
                // find the smallest distance increment between any of the measurements
                $scope.minDistance = $scope.maxDistance;
                for(var i = 0, j = 1; j < rmFactor.spacingList.length; i++, j++ )
                {
                    var difference = Math.abs(rmFactor.spacingList[j].value - rmFactor.spacingList[i].value);
                    if(difference < $scope.minDistance)
                    {
                        $scope.minDistance = difference;
                    }
                }
                $scope.maxMinDiff = $scope.maxDistance - $scope.minDistance;
                // when there are only 2 elements in the spacing list, the max = min distance between
                // the elements.  thus we force to 1
                if ($scope.maxMinDiff === 0) $scope.maxMinDiff = 1;
            } else {
                $scope.maxMinDiff = undefined;
                $scope.minDistance = undefined;
                $scope.maxDistance = undefined;
            }
        };


        /**
         * Fill in the cells of the covariance object with the
         * lear covariance values
         */
        $scope.calculateLear = function() {
            // make sure user is done filling in the text
            if ($scope.currentCovariance !== undefined &&
                $scope.currentCovariance.rho >= -1 && $scope.currentCovariance.rho <= 1 &&
                $scope.currentCovariance.delta >= 0) {
                if ($scope.currentCovariance.blob === null) {
                    $scope.currentCovariance.blob = {
                        data: []
                    };
                    // some uploaded designs may not include the lear data, but we need to
                    // keep it somewhere, so create an empty covariance matrix
                    for(var r = 0; r < $scope.currentCovariance.rows; r++) {
                        var row = [];
                        for(var c = 0; c < $scope.currentCovariance.columns; c++) {
                            row.push((r == c ? 1 : 0));
                        }
                        $scope.currentCovariance.blob.data.push(row);
                    }

                }
                var spacingList = $scope.studyDesign.repeatedMeasuresTree[
                    $scope.studyDesign.covariance.indexOf($scope.currentCovariance)
                    ].spacingList;
                for(var rr = 0; rr < $scope.currentCovariance.rows; rr++) {
                    for(var cc = 0; cc < rr; cc++) {
                        var measurementDistance = Math.abs(spacingList[rr].value - spacingList[cc].value);
                        var powerValue = $scope.minDistance + (
                            $scope.currentCovariance.delta *
                                (measurementDistance - $scope.minDistance)/($scope.maxMinDiff));
                        var value = Math.pow($scope.currentCovariance.rho, powerValue);
                        $scope.currentCovariance.blob.data[rr][cc] = value;
                        $scope.currentCovariance.blob.data[cc][rr] = value;
                    }
                }
            }

        };

        /**
         * Update the row and column labels
         */
        $scope.setRowColumnLabels = function() {
            $scope.rowLabelList = [];
            $scope.columnLabelList = [];
            if ($scope.currentCovariance !== undefined) {
                // build the row and column labels
                if ($scope.currentCovariance.name == glimmpseConstants.covarianceResponses) {
                    for(var i = 0; i < $scope.studyDesign.responseList.length; i++) {
                        var value = $scope.studyDesign.responseList[i].name;
                        $scope.rowLabelList.push(value);
                        $scope.columnLabelList.push(value);
                    }
                } else {
                    var rmFactor = $scope.studyDesign.repeatedMeasuresTree[0];
                    for(var sidx = 0; sidx < rmFactor.spacingList.length; sidx++) {
                        var spacingEntry = rmFactor.spacingList[sidx].value;
                        $scope.rowLabelList.push($scope.currentCovariance.name + " " + spacingEntry);
                        $scope.columnLabelList.push($scope.currentCovariance.name + " " + spacingEntry);
                    }
                }
            }
        };

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.currentCovariance = undefined;
            if ($scope.studyDesign.covariance.length > 0) {
                $scope.currentCovariance = $scope.studyDesign.covariance[0];
            }
            $scope.setRowColumnLabels();
            $scope.updateLearDistances();
            if ($scope.currentCovariance !== undefined &&
                $scope.currentCovariance.type == glimmpseConstants.correlationTypeLear) {
                $scope.calculateLear();
            }
        }

        /**
         * get the display name for a covariance object
         * @param covariance
         * @returns {*}
         */
        $scope.getName = function(covariance) {
            if (covariance.name == glimmpseConstants.covarianceResponses) {
                return "responses";
            }
            return covariance.name;
        };

        /**
         * Reset the current covariance
         * @param covariance
         */
        $scope.setCovariance = function(covariance) {
            $scope.currentCovariance = covariance;
            $scope.setRowColumnLabels();
            $scope.updateLearDistances();
        };

        /**
         * Set the value of a given cell in the current covariance
         * Used to maintain symmetry in unstructured views
         * @param row
         * @param column
         * @param value
         */
        $scope.setCellValue = function(row, column, value) {
            if (row != column) {
                $scope.currentCovariance.blob.data[row][column] = value;
            }
        };

        /**
         * Perform any cleanup when switching between correlation, covariance
         * and LEAR specifications
         */
        $scope.updateType = function() {
            switch ($scope.currentCovariance.type) {
                case glimmpseConstants.correlationTypeLear:
                    // set default LEAR params
                    $scope.currentCovariance.rho = 0;
                    $scope.currentCovariance.delta = 0;
                    $scope.calculateLear();
                    break;
                case glimmpseConstants.correlationTypeUnstructured:
                    // clear LEAR parameters
                    $scope.currentCovariance.rho = -2;
                    $scope.currentCovariance.delta = -1;
                    // reset standard deviations to 1
                    for(var i = 0; i < $scope.currentCovariance.standardDeviationList.length; i++) {
                        $scope.currentCovariance.standardDeviationList[i].value = 1;
                    }
                    // reset diagonals to 1, off-diagonals to 0 if < -1 or > 1
                    for(var r = 0; r < $scope.currentCovariance.rows; r++) {
                        for(var c = 0; c <= r; c++) {
                            if (c == r) {
                                $scope.currentCovariance.blob.data[r][c] = 1;
                            } else {
                                var value = $scope.currentCovariance.blob.data[r][c];
                                if (value < -1 || value > 1) {
                                    $scope.currentCovariance.blob.data[r][c] = 0;
                                }
                            }
                        }
                    }
                    break;
                case glimmpseConstants.covarianceTypeUnstructured:
                    // clear LEAR parameters
                    $scope.currentCovariance.rho = -2;
                    $scope.currentCovariance.delta = -1;
                    // reset standard deviations to 1
                    for(var ii = 0; ii < $scope.currentCovariance.standardDeviationList.length; ii++) {
                        $scope.currentCovariance.standardDeviationList[ii].value = 1;
                    }
                    break;

            }
        };

        /**
         * Returns true if the cell at the specified row
         * and column should be disabled.
         *
         * @param row
         * @param column
         * @returns {boolean}
         */
        $scope.isCellDisabled = function(row, column) {
            if ($scope.currentCovariance === undefined) {
                return true;
            }
            if ($scope.currentCovariance.type ==
                glimmpseConstants.covarianceTypeUnstructured) {
                return (column > row);

            } else if ($scope.currentCovariance.type ==
                glimmpseConstants.correlationTypeUnstructured) {
                return (column >= row);
            }
            return true;
        };

    })

/**
 * Controller for variability covariate within view
 */
    .controller('variabilityCovariateViewController', function($scope, glimmpseConstants,
                                                               studyDesignService, studyDesignMetaData) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
            $scope.sigmaG = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaG);
            $scope.sigmaYG = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG);
            $scope.sharedCorrelation = 0;
        }

        /**
         * Set same correlation for all values
         *
         */
        $scope.setSharedCorrelationForAllOutcomes = function() {
            if ($scope.sigmaYG !== undefined) {
                for(var r = 0; r < $scope.sigmaYG.rows; r++) {
                    $scope.sigmaYG.data.data[r][0] = $scope.sharedCorrelation;
                }
            }
        };

    })

/**
 * Controller for the plot options view
 */
    .controller('plotOptionsController', function($scope, glimmpseConstants,
                                                  studyDesignMetaData, studyDesignService) {

        // setter functions passed into generate data series function
        $scope.setTest = function(current, test) {current.statisticalTestTypeEnum = test.type;};
        $scope.setBetaScale = function(current, betaScale) {current.betaScale = betaScale.value;};
        $scope.setSigmaScale = function(current, sigmaScale) {current.sigmaScale = sigmaScale.value;};
        $scope.setAlpha = function(current, alpha) {current.typeIError = alpha.alphaValue;};
        $scope.setSampleSize = function(current, sampleSize) {
            current.sampleSize = sampleSize.value * $scope.sampleSizeMultiplier;
        };
        $scope.setNominalPower = function(current, power) {current.nominalPower = power.value;};
        $scope.setPowerMethod = function(current, method) {current.powerMethod = method.powerMethodEnum;};
        $scope.setQuantile = function(current, quantile) {current.quantile = quantile.value;};

        /**
         * Recursive function to generate all combinations of the elements in the
         * list of lists
         *
         * @param dataLists - list of all data lists from which to generate permutations
         * @param dataSeriesList - the list of data series
         * @param depth - recursion depth
         * @param current - current data series description
         */
        $scope.generateCombinations = function(inputDataLists, dataSeriesList, depth, current)
        {
            if(depth == inputDataLists.length)
            {
                dataSeriesList.push(
                    {
                        idx: 0,
                        label: 'Series ' + (dataSeriesList.length + 1),
                        confidenceLimits: false,
                        statisticalTestTypeEnum: current.statisticalTestTypeEnum,
                        betaScale: current.betaScale,
                        sigmaScale: current.sigmaScale,
                        typeIError: current.typeIError,
                        sampleSize: current.sampleSize,
                        nominalPower: current.nominalPower,
                        powerMethod: current.powerMethod,
                        quantile: current.quantile
                    }
                );
                return;
            }

            for(var i = 0; i < inputDataLists[depth].data.length; i++)
            {
                inputDataLists[depth].setFunction(current, inputDataLists[depth].data[i]);
                $scope.generateCombinations(inputDataLists, dataSeriesList, depth + 1, current);
            }
        };

        /**
         * Build the possible data series for a given X-axis and
         * solution type
         */
        $scope.buildDataSeries = function() {
            if ($scope.studyDesign.powerCurveDescriptions === null) { return; }

            // calculate the multiplier for per group sample sizes
            $scope.sampleSizeMultiplier = 0;
            if ($scope.studyDesign.relativeGroupSizeList !== undefined) {
                for(var i = 0; i < $scope.studyDesign.relativeGroupSizeList.length; i++) {
                    $scope.sampleSizeMultiplier = $scope.sampleSizeMultiplier +
                        $scope.studyDesign.relativeGroupSizeList[i].value;
                }
            } else {
                $scope.sampleSizeMultiplier = 1;
            }

            // store the current axis type in the meta data
            $scope.metaData.plotOptions.xAxis = $scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum;
            $scope.metaData.plotOptions.availableDataSeries = [];

            // set up the recursive generation of data series
            var dataLists = [
                {
                    data: $scope.studyDesign.alphaList,
                    setFunction: $scope.setAlpha
                },
                {
                    data: $scope.studyDesign.statisticalTestList,
                    setFunction: $scope.setTest
                }
            ];

            // add sample size list or nominal power
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum !=
                $scope.glimmpseConstants.xAxisTotalSampleSize) {
                if ($scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypeSampleSize) {
                    dataLists.push(
                        {
                            data: $scope.studyDesign.nominalPowerList,
                            setFunction: $scope.setNominalPower
                        }
                    );
                } else {
                    dataLists.push(
                        {
                            data: $scope.studyDesign.sampleSizeList,
                            setFunction: $scope.setSampleSize
                        }
                    );
                }
            }
            // add beta scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum !=
                $scope.glimmpseConstants.xAxisBetaScale) {
                dataLists.push(
                    {
                        data: $scope.studyDesign.betaScaleList,
                        setFunction: $scope.setBetaScale
                    }
                );
            }
            // add sigma scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum !=
                $scope.glimmpseConstants.xAxisSigmaScale) {
                dataLists.push(
                    {
                        data: $scope.studyDesign.sigmaScaleList,
                        setFunction: $scope.setSigmaScale
                    }
                );
            }

            if ($scope.studyDesign.gaussianCovariate) {
                $scope.numDataSeries *= $scope.studyDesign.powerMethodList.length;
                dataLists.push(
                    {
                        data: $scope.studyDesign.powerMethodList,
                        setFunction: $scope.setPowerMethod
                    }
                );
                if ($scope.studyDesign.quantileList.length > 0) {
                    $scope.numDataSeries *= $scope.studyDesign.quantileList.length;
                    dataLists.push(
                        {
                            data: $scope.studyDesign.quantileList,
                            setFunction: $scope.setQuantile
                        }
                    );
                }
            }

            // now generate the data series with some mad recursive action
            $scope.generateCombinations(dataLists, $scope.metaData.plotOptions.availableDataSeries, 0,
                {
                    idx: 0,
                    label: '',
                    confidenceLimits: false,
                    statisticalTestTypeEnum: undefined,
                    betaScale: undefined,
                    sigmaScale: undefined,
                    typeIError: undefined,
                    sampleSize: undefined,
                    nominalPower: undefined,
                    powerMethod: undefined,
                    quantile: undefined
                }
            );
        };

        /**
         * Hide/show columns in the data series grid depending
         * on the currently selected xAxis
         */
        $scope.updateVisibleColumns = function() {
            if ($scope.studyDesign.powerCurveDescriptions !== null) {
                switch ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum) {
                    case glimmpseConstants.xAxisTotalSampleSize:
                        $scope.nominalPowerColumn.visible = false;
                        $scope.totalSampleSizeColumn.visible = false;
                        $scope.betaScaleColumn.visible = true;
                        $scope.sigmaScaleColumn.visible = true;
                        break;
                    case glimmpseConstants.xAxisBetaScale:
                        $scope.nominalPowerColumn.visible =
                            ($scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypeSampleSize);
                        $scope.totalSampleSizeColumn.visible =
                            ($scope.studyDesign.solutionTypeEnum != $scope.glimmpseConstants.solutionTypeSampleSize);
                        $scope.betaScaleColumn.visible = false;
                        $scope.sigmaScaleColumn.visible = true;
                        break;
                    case glimmpseConstants.xAxisSigmaScale:
                        $scope.nominalPowerColumn.visible =
                            ($scope.studyDesign.solutionTypeEnum == $scope.glimmpseConstants.solutionTypeSampleSize);
                        $scope.totalSampleSizeColumn.visible =
                            ($scope.studyDesign.solutionTypeEnum != $scope.glimmpseConstants.solutionTypeSampleSize);
                        $scope.betaScaleColumn.visible = true;
                        $scope.sigmaScaleColumn.visible = false;
                        break;
                }

            }
        };

        /**
         * Check if the data series is contained in the power
         * curve description
         * @param series
         */
        $scope.findDataSeries = function(series) {
            for(var i = 0; i < $scope.studyDesign.powerCurveDescriptions.dataSeriesList.length; i++) {
                var seriesFromStudyDesign = $scope.studyDesign.powerCurveDescriptions.dataSeriesList[i];
                if ($scope.matchSeries(series, seriesFromStudyDesign)) {
                    return seriesFromStudyDesign;
                }
            }
            return null;
        };

        /**
         * Returns true if the two data series match
         * @param seriesA
         * @param seriesB
         * @returns {boolean}
         */
        $scope.matchSeries = function(seriesA, seriesB) {

            // compare tests
            if (seriesA.statisticalTestTypeEnum !== seriesB.statisticalTestTypeEnum) {
                return false;
            }
            // match beta scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisBetaScale &&
                seriesA.betaScale !== seriesB.betaScale) {
                return false;
            }
            // match sigma scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisSigmaScale &&
                seriesA.sigmaScale !== seriesB.sigmaScale) {
                return false;
            }
            // match alpha
            if (seriesA.typeIError !== seriesB.typeIError) {
                return false;
            }
            // match sample size
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisTotalSampleSize &&
                $scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypePower &&
                seriesA.sampleSize !== seriesB.sampleSize) {
                return false;
            }
            // match nominal power
            if ($scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize &&
                seriesA.nominalPower !== seriesB.nominalPower) {
                return false;
            }
            if ($scope.studyDesign.gaussianCovariate) {
                if (seriesA.powerMethod !== seriesB.powerMethod) {
                    return false;
                }
                // check if quantile power selected
                for(var i = 0; i < $scope.studyDesign.powerMethodList.length; i++) {
                    if ($scope.studyDesign.powerMethodList[i].powerMethodEnum ==
                        glimmpseConstants.powerMethodQuantile) {
                        if (seriesA.quantile !== seriesB.quantile) {
                            return false;
                        }
                        break;
                    }
                }
            }

            return true;
        };

        /**
         * Update the label in the power curve description in the study design
         */
        $scope.updateLabel = function(series) {
            var seriesFromStudyDesign = $scope.findDataSeries(series);
            if (seriesFromStudyDesign !== null) {
                seriesFromStudyDesign.label = series.label;
            }
        };

        /**
         * Update the show CI flag in the curve description in the study design
         */
        $scope.updateConfidenceLimits = function(series) {
            var seriesFromStudyDesign = $scope.findDataSeries(series);
            if (seriesFromStudyDesign !== null) {
                seriesFromStudyDesign.confidenceLimits = series.confidenceLimits;
            }
        };

        // initialize the controller
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
            $scope.initComplete = false;

            // columns whose visibility changes depending on X-axis state
            $scope.nominalPowerColumn =
                { field: 'nominalPower', displayName: 'Desired Power', width: 200};
            $scope.totalSampleSizeColumn =
                { field: 'sampleSize', displayName: 'Total Sample Size', width: 200};
            $scope.betaScaleColumn =
                { field: 'betaScale', displayName: 'Means Scale', width: 200};
            $scope.sigmaScaleColumn =
                { field: 'sigmaScale', displayName: 'Variability Scale', width: 200};

            // build columns for data series grid
            $scope.columnDefs = [
                { field: 'label', displayName: "Label", width: 160, enableCellEdit: true,
                    cellTemplate: '<div><input class="grid-textbox" type="text" ng-model="row.entity.label" ng-change="updateLabel(row.entity)" /></div>'
                },
                { field: 'confidenceLimits', displayName: "Show Confidence limits", width: 200,
                    cellTemplate: '<div class="grid-checkbox"><input type="checkbox" ng-model="row.entity.confidenceLimits" ng-click="updateConfidenceLimits(row.entity)" /></div>',
                    visible: ($scope.studyDesign.confidenceIntervalDescriptions !== null)
                },
                $scope.nominalPowerColumn,
                $scope.totalSampleSizeColumn,
                { field: 'typeIError', displayName: 'Type I Error Rate', width: 200},
                $scope.betaScaleColumn,
                $scope.sigmaScaleColumn,
                { field: 'statisticalTestTypeEnum', displayName: 'Test', width: 200},
                { field: 'powerMethod', displayName: 'Power Method', width: 200,
                    visible: $scope.studyDesign.gaussianCovariate
                },
                { field: 'quantile', displayName: 'Quantile', width: 200,
                    visible: ($scope.studyDesign.gaussianCovariate &&
                        $scope.studyDesign.quantileList.length > 0)
                }
            ];

            // seleect options for the X axis
            $scope.XAxisOptions = [
                {label: "Total Sample Size", value: $scope.glimmpseConstants.xAxisTotalSampleSize},
                {label: "Variability Scale Factor", value: $scope.glimmpseConstants.xAxisSigmaScale},
                {label: "Means (coefficients) Scale Factor", value: $scope.glimmpseConstants.xAxisBetaScale}
            ];

            // set up ng-grid
            $scope.gridOptions = {
                data: 'metaData.plotOptions.availableDataSeries',
                columnDefs: 'columnDefs',
                showSelectionCheckbox: true,
                selectWithCheckboxOnly: true,
                selectedItems: [],
                afterSelectionChange: function(data) {
                    $scope.studyDesign.powerCurveDescriptions.dataSeriesList = $scope.gridOptions.selectedItems;
                }
            };

            // regenerate the possible data series
            if ($scope.metaData.plotOptions.availableDataSeries.length <= 0) {
                $scope.buildDataSeries();
            }
            $scope.updateVisibleColumns();

            // fill in the selections in the current study design
            if ($scope.studyDesign.powerCurveDescriptions !== undefined &&
                $scope.studyDesign.powerCurveDescriptions !== null) {
                for(var i = 0; i < $scope.metaData.plotOptions.availableDataSeries.length; i++) {
                    // select the series in the study design
                    var series = $scope.metaData.plotOptions.availableDataSeries[i];
                    var matchingSeriesFromStudyDesign = $scope.findDataSeries(series);
                    if (matchingSeriesFromStudyDesign !== null) {
                        series.label = matchingSeriesFromStudyDesign.label;
                        series.confidenceLimits = matchingSeriesFromStudyDesign.confidenceLimits;
                        $scope.gridOptions.selectedItems.push(series);
                    }
                }

                // if nothing matched, clear the study design series
                if ($scope.gridOptions.selectedItems.length <= 0) {
                    $scope.studyDesign.powerCurveDescriptions.dataSeriesList = $scope.gridOptions.selectedItems;
                }
            }

        }

        /**
         * Update the data series when the user changes the x-axis type
         */
        $scope.updateHorizontalAxisType = function() {
            // clear current selections
            $scope.gridOptions.selectedItems.splice(0,$scope.gridOptions.selectedItems.length);
            $scope.studyDesign.powerCurveDescriptions.dataSeriesList = [];

            $scope.updateVisibleColumns();
            $scope.buildDataSeries();
        };

        /**
         *  Toggle the power curve on/off
         */
        $scope.togglePowerCurveDescription = function() {
            if ($scope.studyDesign.powerCurveDescriptions !== null) {
                $scope.studyDesign.powerCurveDescriptions = null;
            } else {
                $scope.studyDesign.powerCurveDescriptions = {
                    idx: 0,
                    legend: true,
                    width: 300,
                    height: 300,
                    title: null,
                    horizontalAxisLabelEnum: 'TOTAL_SAMPLE_SIZE',
                    dataSeriesList: []
                };
                $scope.updateVisibleColumns();
                $scope.buildDataSeries();
            }
        };

    })

/**
 * Controller for relative group size view
 */
    .controller('relativeGroupSizeController', function($scope, glimmpseConstants,
                                                        studyDesignService, studyDesignMetaData) {
        init();
        function init() {
            /* note, the table of predictor combinations is built as predictor information
             * is entered, so we just need to read it in this controller
             */
            $scope.studyDesign = studyDesignService;
            $scope.metaData = studyDesignMetaData;
        }
    })

    /**
     * controller for the design essence screen in matrix mode
     */
    .controller('designEssenceController',
    function($scope, matrixUtilities, studyDesignService, glimmpseConstants) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.designEssenceMatrix = studyDesignService.getMatrixByName(glimmpseConstants.matrixXEssence);
        }

        $scope.$watch('designEssenceMatrix.columns', function(newValue, oldValue) {
            if (newValue != oldValue) {
                // resize beta
                var beta = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBeta);
                $scope.matrixUtils.resizeRows(beta, beta.rows, newValue, 0, 0);
                // resize C
                var betweenContrast = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBetweenContrast);
                $scope.matrixUtils.resizeColumns(betweenContrast, betweenContrast.columns, newValue, 0, 0);
            }
        });
    })

    /**
     * controller for the beta matrix screen in matrix mode
     */
    .controller('betaController',
    function($scope, matrixUtilities, studyDesignService, glimmpseConstants) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.betaMatrix = studyDesignService.getMatrixByName(glimmpseConstants.matrixBeta);
        }

        $scope.$watch('betaMatrix.columns', function(newValue, oldValue) {
            if (newValue != oldValue) {
                var sigma;
                if ($scope.studyDesign.gaussianCovariate) {
                    // resize sigmaYG
                    var sigmaYG = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaYG);
                    $scope.matrixUtils.resizeRows(sigmaYG, sigmaYG.rows, newValue, 1, 1);
                    // resize beta random
                    var betaRandom = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBetaRandom);
                    $scope.matrixUtils.resizeColumns(betaRandom, betaRandom.columns, newValue, 1, 1);
                    // resize sigma Y
                    sigma = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaY);
                } else {
                    // resize sigma E
                    sigma = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixSigmaE);
                }
                // resize either sigma Y or E, depending on covariate status
                $scope.matrixUtils.resizeRows(sigma, sigma.rows, newValue, 0, 1);
                $scope.matrixUtils.resizeColumns(sigma, sigma.columns, newValue, 0, 1);

                // resize U
                var withinContrast = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixWithinContrast);
                $scope.matrixUtils.resizeRows(withinContrast, withinContrast.rows, newValue, 0, 1);
            }
        });
    })

    /**
     * controller for the between participant contrast matrix screen in matrix mode
     */
    .controller('betweenContrastController',
    function($scope, matrixUtilities, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.betweenContrastMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixBetweenContrast);
        }

        $scope.$watch('betweenContrastMatrix.rows', function(newValue, oldValue) {
            if (newValue != oldValue) {
                // resize theta null
                var thetaNull = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixThetaNull);
                $scope.matrixUtils.resizeRows(thetaNull, thetaNull.rows, newValue, 0, 0);
            }
        });
    })

    /**
     * controller for the within participant contrast matrix screen in matrix mode
     */
    .controller('withinContrastController',
    function($scope, matrixUtilities, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.matrixUtils = matrixUtilities;
            $scope.withinContrastMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixWithinContrast);
        }

        $scope.$watch('withinContrastMatrix.rows', function(newValue, oldValue) {
            if (newValue != oldValue) {
                // resize theta null
                var thetaNull = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixThetaNull);
                $scope.matrixUtils.resizeColumns(thetaNull, thetaNull.columns, newValue, 0, 0);
            }
        });
    })


    /**
     * controller for the null hypothesis matrix screen in matrix mode
     */
    .controller('thetaNullController',
    function($scope, matrixUtilities, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.thetaNullMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixThetaNull);
        }
    })

    /**
     * controller for the error covariance matrix screen in matrix mode
     */
    .controller('sigmaEController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.sigmaEMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixSigmaE);
        }
    })

    /**
     * controller for the outcomes covariance matrix screen in matrix mode
     */
    .controller('sigmaYController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.sigmaYMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixSigmaY);
        }
    })

    /**
     * controller for the outcomes covariance matrix screen in matrix mode
     */
    .controller('sigmaGController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.sigmaGMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixSigmaG);
        }
    })

    /**
     * controller for the outcomes / gaussian random covariance screen in matrix mode
     */
    .controller('sigmaYGController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.sigmaYGMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixSigmaYG);
            $scope.sigmaGMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixSigmaG);
        }
    })

    /**
     * controller for the null hypothesis matrix screen in matrix mode
     */
    .controller('thetaNullController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.thetaNullMatrix =
                studyDesignService.getMatrixByName(glimmpseConstants.matrixThetaNull);
        }
    })

    /**
     * Controller for the results screen
     */
    .controller('resultsReportController',
        function($scope, glimmpseConstants, studyDesignService, powerService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.powerService = powerService;
            $scope.processing = false;
            $scope.gridData = {};
            $scope.currentResultsDetails = undefined;

            // calculate the divisor for total sample size
            $scope.sampleSizeDivisor = 0;
            if ($scope.studyDesign.relativeGroupSizeList !== undefined) {
                for(var i = 0; i < $scope.studyDesign.relativeGroupSizeList.length; i++) {
                    $scope.sampleSizeDivisor = $scope.sampleSizeDivisor +
                        parseInt($scope.studyDesign.relativeGroupSizeList[i].value);
                }
            } else {
                $scope.sampleSizeDivisor = 1;
            }

            $scope.columnDefs = [
                { field: 'actualPower', displayName: 'Power', width: 80, cellFilter:'number:3'},
                { field: 'confidenceInterval', displayName: 'Confidence Limits',
                    cellTemplate: "<div>({{row.entity.confidenceInterval.lowerLimit | number:3}}, {{row.entity.confidenceInterval.upperLimit | number:3}})</div>",
                    visible: ($scope.studyDesign.confidenceIntervalDescriptions !== null),
                    width: 200},
                { field: 'totalSampleSize', displayName: 'Total Sample Size', width: 200 },
                { field: 'nominalPower.value', displayName: 'Target Power', cellFilter:'number:3',
                    visible: ($scope.studyDesign.solutionTypeEnum != glimmpseConstants.solutionTypePower),
                    width: 200},
                { field: 'alpha.alphaValue', displayName: 'Type I Error Rate', width: 200},
                { field: 'test.type', displayName: 'Test', width: 200},
                { field: 'betaScale.value', displayName: 'Means Scale Factor', width: 200},
                { field: 'sigmaScale.value', displayName: 'Variability Scale Factor', width: 200},
                { field: 'powerMethod.powerMethodEnum', displayName: 'Power Method', width: 200,
                    visible: $scope.studyDesign.gaussianCovariate
                },
                { field: 'quantile.value', displayName: 'Quantile', width: 200,
                    visible: ($scope.studyDesign.gaussianCovariate &&
                        $scope.studyDesign.quantileList.length > 0)
                }
            ];

            // build grid options
            $scope.resultsGridOptions = {
                data: 'gridData',
                columnDefs: 'columnDefs',
                multiSelect: false,
                afterSelectionChange: function(data) {
                    $scope.calculateDetails();
                },
                selectedItems: []
            };

            if (powerService.cachedResults === undefined && powerService.cachedError === undefined) {

                $scope.processing = true;
                // need to recalculate power
                if (studyDesignService.solutionTypeEnum == glimmpseConstants.solutionTypePower) {
                    $scope.powerService.calculatePower(angular.toJson(studyDesignService))
                        .then(function(data) {
                            powerService.cachedResults = angular.fromJson(data);
                            powerService.cachedError = undefined;
                            $scope.processing = false;
                            $scope.gridData = powerService.cachedResults;
                        },
                        function(errorMessage){
                            // close processing dialog
                            powerService.cachedResults = undefined;
                            powerService.cachedError = errorMessage;
                            $scope.processing = false;
                            $scope.gridData = undefined;
                        });
                } else if (studyDesignService.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize) {
                    $scope.powerService.calculateSampleSize(angular.toJson(studyDesignService))
                        .then(function(data) {
                            powerService.cachedResults = angular.fromJson(data);
                            powerService.cachedError = undefined;
                            $scope.processing = false;
                            $scope.gridData = powerService.cachedResults;
                        },
                        function(errorMessage){
                            // close processing dialog
                            powerService.cachedResults = undefined;
                            powerService.cachedError = errorMessage;
                            $scope.processing = false;
                            $scope.gridData = undefined;
                            $scope.errorMessage = errorMessage;
                        });
                } else {
                    $scope.errorMessage =
                        "Invalid study design.  Cannot solve for '" + studyDesignService.solutionTypeEnum+ "'";
                    $scope.gridData = undefined;
                }
            } else {
                $scope.gridData = powerService.cachedResults;
                $scope.errorMessage = powerService.cachedError;
            }

        }

        $scope.calculateDetails = function(result) {
            if ($scope.resultsGridOptions.selectedItems.length > 0) {
                var selectedResult = $scope.resultsGridOptions.selectedItems[0];
                $scope.currentResultDetails = undefined;
                $scope.currentResultDetails = {
                    isu: 'participant',
                    totalObsPerISU: 1,
                    power: selectedResult.actualPower.toFixed(3),
                    totalSampleSize: selectedResult.totalSampleSize,
                    perGroupSampleSizeList: []
                };

                // update the ISU if clustering present
                if ($scope.studyDesign.clusteringTree.length > 0) {
                    $scope.currentResultDetails.isu = $scope.studyDesign.clusteringTree[0].groupName;
                    for(var i = 0; i < $scope.studyDesign.clusteringTree.length; i++) {
                        $scope.currentResultDetails.totalObsPerISU =
                            $scope.currentResultDetails.totalObsPerISU *
                                $scope.studyDesign.clusteringTree[i].groupSize;
                    }
                }

                var smallestGroupSize = selectedResult.totalSampleSize / $scope.sampleSizeDivisor;
                for(var j = 0; j < $scope.studyDesign.relativeGroupSizeList.length; j++) {
                    $scope.currentResultDetails.perGroupSampleSizeList.push(
                        smallestGroupSize * $scope.studyDesign.relativeGroupSizeList[j].value
                    );
                }
            }

        };

    })

/**
 * Controller for results screen showing the power curve
 */
    .controller('resultsPlotController', function($scope, glimmpseConstants, studyDesignService, powerService) {

        /**
         * Function for doing an ordered insert of data points
         * @param a
         * @param b
         * @returns {number}
         */
        $scope.sortByX = function(a,b) {
            return a[0] > b[0] ? 1 : -1;
        };

        /**
         * See if the result matches the data series description
         */
        $scope.isMatch = function(seriesDescription, result, hasCovariate) {
            var match = (
                seriesDescription.statisticalTestTypeEnum == result.test.type &&
                seriesDescription.typeIError == result.alpha.alphaValue &&
                (!hasCovariate || seriesDescription.powerMethod == result.powerMethod.powerMethodEnum) &&
                (!hasCovariate || seriesDescription.quantile == result.quantile.value)
            );

            if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                glimmpseConstants.xAxisTotalSampleSize) {
                match = match &&
                    seriesDescription.betaScale == result.betaScale.value &&
                    seriesDescription.sigmaScale == result.sigmaScale.value;
            } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                glimmpseConstants.xAxisBetaScale) {
                match = match &&
                    seriesDescription.sampleSize == result.totalSampleSize &&
                    seriesDescription.sigmaScale == result.sigmaScale.value;

            } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                glimmpseConstants.xAxisSigmaScale) {
                match = match &&
                    seriesDescription.sampleSize == result.totalSampleSize &&
                    seriesDescription.betaScale == result.betaScale.value;

            }

            return match;
        };

        /**
         * Returns true if the result matches the data series
         * @param series the data series description
         * @param result the power result
         * @returns {boolean}
         */
        $scope.matchResultToSeries = function(series, result) {

            // compare tests
            if (series.statisticalTestTypeEnum !== result.test.type) {
                return false;
            }
            // match beta scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisBetaScale &&
                series.betaScale !== result.betaScale.value) {
                return false;
            }
            // match sigma scale
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisSigmaScale &&
                series.sigmaScale !== result.sigmaScale.value) {
                return false;
            }
            // match alpha
            if (series.typeIError !== result.alpha.alphaValue) {
                return false;
            }
            // match sample size
            if ($scope.studyDesign.powerCurveDescriptions.horizontalAxisLabelEnum != glimmpseConstants.xAxisTotalSampleSize &&
                $scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypePower &&
                series.sampleSize !== result.totalSampleSize) {
                return false;
            }
            // match nominal power
            if ($scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypeSampleSize &&
                series.nominalPower !== result.nominalPower.value) {
                return false;
            }
            if ($scope.studyDesign.gaussianCovariate) {
                if (series.powerMethod !== results.powerMethod.powerMethodEnum) {
                    return false;
                }
                // check if quantile power selected
                if (studyDesignInstance.getPowerMethodIndex(glimmpseConstants.powerMethodQuantile) >= 0) {
                    if (series.quantile !== result.quantile) {
                        return false;
                    }
                }
            }

            return true;
        };

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.powerService = powerService;
            $scope.noPlotRequested = (studyDesignService.powerCurveDescriptions === null ||
                                        studyDesignService.powerCurveDescriptions.dataSeriesList.length <= 0);
            $scope.showCurve = (!$scope.noPlotRequested &&
                                powerService.cachedResults !== undefined &&
                                powerService.cachedResults.length > 0);

            // highchart configuration
            $scope.chartConfig = {
                options: {
                    credits: {
                        enabled: false
                    },
                    yAxis: {
                        title: {
                            text: 'Power'
                        },
                        min: 0,
                        max: 1,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#ff0000'
                            //'#808080'
                        }]
                    },
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom',
                        borderWidth: 0,
                        enabled: true
                    },
                    exporting: {
                        enabled: true
                    },
                    plotOptions: {
                        series: {
                            lineWidth: 1
                        }
                    }
                },
                title: {
                    text: 'Power Curve',
                    x: -20 //center
                },
                xAxis: {
                    title: {
                        text: 'Total Sample Size'
                    }
                },
                series: []
            };

            if ($scope.showCurve === true) {
                // set the title
                if (studyDesignService.powerCurveDescriptions.title !== null &&
                    studyDesignService.powerCurveDescriptions.title.length > 0) {
                    $scope.chartConfig.title.text = studyDesignService.powerCurveDescriptions.title;
                }

                // set the axis
                if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                    glimmpseConstants.xAxisTotalSampleSize) {
                    $scope.chartConfig.xAxis.title.text = 'Total Sample Size';

                } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                    glimmpseConstants.xAxisBetaScale) {
                    $scope.chartConfig.xAxis.title.text = 'Regresssion Coefficient Scale Factor';

                } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                    glimmpseConstants.xAxisSigmaScale) {
                    $scope.chartConfig.xAxis.title.text = 'Variability Scale Factor';
                }

                // add the data series
                $scope.chartConfig.series = [];
                // defaults from highcharts - need to handle this locally so that CI data series have same
                // color as main series
                var colors = Highcharts.getOptions().colors;

                colorIdx = 0;
                for(var i = 0; i < studyDesignService.powerCurveDescriptions.dataSeriesList.length; i++) {
                    var seriesDescription = studyDesignService.powerCurveDescriptions.dataSeriesList[i];
                    var newSeries = {
                        name: seriesDescription.label,
                        color: colors[colorIdx],
                        data: []
                    };
                    // for lower confidence limits
                    var lowerSeries = {
                        name: "Lower confidence limit",
                        showInLegend: false,
                        dashStyle: 'shortdot',
                        color: colors[colorIdx],
                        marker: {
                            enabled: false
                        },
                        data: []
                    };
                    // for upper confidence limits
                    var upperSeries = {
                        name: "Upper confidence limit",
                        showInLegend: false,
                        dashStyle: 'shortdot',
                        color: colors[colorIdx],
                        marker: {
                            enabled: false
                        },
                        data: []
                    };

                    for(var j = 0; j < powerService.cachedResults.length; j++) {
                        var result = powerService.cachedResults[j];

                        if ($scope.isMatch(seriesDescription, result, studyDesignService.gaussianCovariate)) {
                            var point = [];
                            var lowerPoint = [];
                            var upperPoint = [];

                            if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                                glimmpseConstants.xAxisTotalSampleSize) {
                                point.push(result.totalSampleSize);

                            } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                                glimmpseConstants.xAxisBetaScale) {
                                point.push(result.betaScale.value);

                            } else if (studyDesignService.powerCurveDescriptions.horizontalAxisLabelEnum ==
                                glimmpseConstants.xAxisSigmaScale) {
                                point.push(result.sigmaScale.value);
                            }

                            // toFixed returns a string, so we need to convert back to float
                            point.push(parseFloat(result.actualPower.toFixed(3)));
                            newSeries.data.push(point);

                            if (seriesDescription.confidenceLimits === true) {
                                lowerPoint.push(point[0]);
                                lowerPoint.push(parseFloat(result.confidenceInterval.lowerLimit.toFixed(3))) ;
                                lowerSeries.data.push(lowerPoint);
                                upperPoint.push(point[0]) ;
                                upperPoint.push(parseFloat(result.confidenceInterval.upperLimit.toFixed(3)));
                                upperSeries.data.push(upperPoint);

                            }


                        }
                    }

                    newSeries.data.sort($scope.sortByX);
                    $scope.chartConfig.series.push(newSeries);

                    if (lowerSeries.data.length > 0) {
                        lowerSeries.data.sort($scope.sortByX);
                        $scope.chartConfig.series.push(lowerSeries);
                    }
                    if (upperSeries.data.length > 0) {
                        upperSeries.data.sort($scope.sortByX);
                        $scope.chartConfig.series.push(upperSeries);
                    }


                    // rotate colors
                    if (colorIdx < colors.length-1) {
                        colorIdx++;
                    } else {
                        colorIdx = 0;
                    }
                }
            }
        }

    })

/**
 * Controller for results screen displaying matrices
 */
    .controller('resultsMatrixController', function($scope, glimmpseConstants, studyDesignService, powerService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.powerService = powerService;
            $scope.processing = false;
            $scope.errorMessage = undefined;
            $scope.matrixHTML = undefined;

            if (powerService.cachedMatrixHtml === undefined && powerService.cachedMatrixError === undefined) {

                $scope.processing = true;
                // need to reload matrices
                $scope.powerService.getMatrices(angular.toJson(studyDesignService))
                    .then(function(data) {
                        powerService.cachedMatrixHtml = data;
                        powerService.cachedMatrixError = undefined;
                        $scope.processing = false;
                        $scope.matrixHTML = data;
                    },
                    function(errorMessage){
                        powerService.cachedMatrixHtml = undefined;
                        powerService.cachedMatrixError = errorMessage;
                        $scope.processing = false;
                        $scope.matrixHTML = undefined;
                    });

            } else {
                $scope.matrixHTML = powerService.cachedMatrixHtml;
                $scope.errorMessage = powerService.cachedMatrixError;
            }
        }

    });


