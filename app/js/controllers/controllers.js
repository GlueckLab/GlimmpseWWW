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
* Controller which manages the completion state of the navbar
*/
glimmpseApp.controller('stateController',
    function($scope, $rootScope, $location, $http, $modal, config,
             glimmpseConstants, studyDesignService, powerService) {

    /**
     * Initialize the controller
     */
    init();
    function init() {
        // the study design object
        $scope.studyDesign = studyDesignService;

        // the power service
        $scope.powerService = powerService;

        // constants
        $scope.glimmpseConstants = glimmpseConstants;

        // json encoded study design
        $scope.studyDesignJSON = "";

        // results csv
        $scope.resultsCSV = "";

        // modal dialog
        $scope.waitDialog = undefined;

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
    }

    /**
     * Convenience routine to determine if a screen is done
     * @param state
     * @returns {boolean}
     */
    $scope.testDone = function(state) {
        return (state == $scope.glimmpseConstants.stateComplete ||
            state ==  $scope.glimmpseConstants.stateDisabled);
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
        if (!$scope.testDone($scope.getStateSolvingFor())) { $scope.incompleteViews.push("Solving For"); }
        if (!$scope.testDone($scope.getStateNominalPower())) { $scope.incompleteViews.push("Desired Power"); }
        if (!$scope.testDone($scope.getStateTypeIError())) { $scope.incompleteViews.push("Type I Error"); }

        if ($scope.mode == $scope.glimmpseConstants.modeGuided) {
            if (!$scope.testDone($scope.getStatePredictors())) { $scope.incompleteViews.push("Study Groups"); }
        } else {
            if (!$scope.testDone($scope.getStateDesignEssence())) { $scope.incompleteViews.push("Design Essence"); }
        }

        if (!$scope.testDone($scope.getStateCovariate())) { $scope.incompleteViews.push("Covariate"); }

        if ($scope.mode == $scope.glimmpseConstants.modeGuided) {
            if (!$scope.testDone($scope.getStateClustering())) { $scope.incompleteViews.push("Clustering"); }
            if (!$scope.testDone($scope.getStateRelativeGroupSize())) { $scope.incompleteViews.push("Relative Group Size"); }
        } else {
            if (!$scope.testDone($scope.getStateBeta())) { $scope.incompleteViews.push("Beta Coefficients"); }
            if (!$scope.testDone($scope.getStateScaleFactorsForMeans())) { $scope.incompleteViews.push("Beta Scale Factors"); }
        }

        if (!$scope.testDone($scope.getStateSmallestGroupSize())) { $scope.incompleteViews.push("Smallest Group Size"); }

        if ($scope.mode ==  $scope.glimmpseConstants.modeGuided) {
            if (!$scope.testDone($scope.getStateResponseVariables())) { $scope.incompleteViews.push("Response Variables"); }
            if (!$scope.testDone($scope.getStateRepeatedMeasures())) { $scope.incompleteViews.push("Repeated Measures"); }
            if (!$scope.testDone($scope.getStateHypothesis())) { $scope.incompleteViews.push("Hypothesis"); }
            if (!$scope.testDone($scope.getStateMeans())) { $scope.incompleteViews.push("Means"); }
            if (!$scope.testDone($scope.getStateScaleFactorsForMeans())) { $scope.incompleteViews.push("Scale Factors (means)"); }
            if (!$scope.testDone($scope.getStateWithinVariability())) { $scope.incompleteViews.push("Within Participant Variability"); }
            if (!$scope.testDone($scope.getStateCovariateVariability())) { $scope.incompleteViews.push("Covariate Variability"); }
        } else {
            if (!$scope.testDone($scope.getStateBetweenParticipantContrast())) { $scope.incompleteViews.push("Between Participant Contrast"); }
            if (!$scope.testDone($scope.getStateWithinParticipantContrast())) { $scope.incompleteViews.push("Within Participant Contrast"); }
            if (!$scope.testDone($scope.getStateThetaNull())) { $scope.incompleteViews.push("Null Hypothesis Matrix"); }
            if (!$scope.testDone($scope.getStateSigmaE())) { $scope.incompleteViews.push("Error Covariance"); }
            if (!$scope.testDone($scope.getStateSigmaY())) { $scope.incompleteViews.push("Outcomes Covariance"); }
            if (!$scope.testDone($scope.getStateSigmaG())) { $scope.incompleteViews.push("Outcomes Covariance"); }
            if (!$scope.testDone($scope.getStateSigmaYG())) { $scope.incompleteViews.push("Covariate (Variability)"); }
        }
        if (!$scope.testDone($scope.getStateScaleFactorsForVariability())) { $scope.incompleteViews.push("Scale Factors (variability)"); }

        if (!$scope.testDone($scope.getStateStatisticalTest())) { $scope.incompleteViews.push("Statistical Test"); }
        if (!$scope.testDone($scope.getStatePowerMethod())) { $scope.incompleteViews.push("Power Method"); }
        if (!$scope.testDone($scope.getStateConfidenceIntervals())) { $scope.incompleteViews.push("Confidence Intervals"); }
        if (!$scope.testDone($scope.getStatePowerCurve())) { $scope.incompleteViews.push("Power Curve"); }
          /*
        var incompleteItemsDialog = $modal.open({
                templateUrl: 'incompleteDialog.html',
                controller:   function ($scope, $modalInstance, incompleteViews) {
                    $scope.incompleteViews = incompleteViews;
                    $scope.close = function () {
                        $modalInstance.close();
                    }
                },
                resolve: {
                    incompleteViews: function () {
                        return $scope.incompleteViews;
                    }
                }
            }
        );   */
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
            init();
        }
    };


    /**
     * Upload a study design file
     * @param input
     * @param parentScope
     */
    $scope.uploadFile = function(input) {
        $location.path('/');
        powerService.clearCache();

        var $form = $(input).parents('form');

        if (input.value === '') {
            window.alert("No file was selected.  Please try again");
        }
        //$scope.showWaitDialog();

        $form.ajaxSubmit({
            type: 'POST',
            uploadProgress: function(event, position, total, percentComplete) {
            },
            error: function(event, statusText, responseText, form) {
                /*
                 handle the error ...
                 */
                window.alert("The study design file could not be loaded: " + responseText);
                $form[0].reset();
               // $scope.waitDialog.close();
            },
            success: function(responseText, statusText, xhr, form) {
                // select the appropriate input mode
                $scope.$apply(function() {

                    // parse the json
                    try {
                        $scope.studyDesign.fromJSON(responseText);
                    } catch(err) {
                        window.alert("The file did not contain a valid study design");
                    }

                    $scope.mode = $scope.studyDesign.viewTypeEnum;
                    $scope.view =  $scope.glimmpseConstants.viewTypeStudyDesign;
                });
                //$scope.waitDialog.close();
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
                $scope.testDone($scope.getStateSolvingFor()) &&
                $scope.testDone($scope.getStateNominalPower()) &&
                $scope.testDone($scope.getStateTypeIError()) &&
                $scope.testDone($scope.getStatePredictors()) &&
                $scope.testDone($scope.getStateCovariate()) &&
                $scope.testDone($scope.getStateClustering()) &&
                $scope.testDone($scope.getStateRelativeGroupSize()) &&
                $scope.testDone($scope.getStateSmallestGroupSize()) &&
                $scope.testDone($scope.getStateResponseVariables()) &&
                $scope.testDone($scope.getStateRepeatedMeasures()) &&
                $scope.testDone($scope.getStateHypothesis()) &&
                $scope.testDone($scope.getStateMeans()) &&
                $scope.testDone($scope.getStateScaleFactorsForMeans()) &&
                $scope.testDone($scope.getStateWithinVariability()) &&
                $scope.testDone($scope.getStateCovariateVariability()) &&
                $scope.testDone($scope.getStateScaleFactorsForVariability()) &&
                $scope.testDone($scope.getStateStatisticalTest()) &&
                $scope.testDone($scope.getStatePowerMethod()) &&
                $scope.testDone($scope.getStateConfidenceIntervals()) &&
                $scope.testDone($scope.getStatePowerCurve())
                );
        } else if ($scope.getMode() == $scope.glimmpseConstants.modeMatrix) {
            return (
                $scope.testDone($scope.getStateSolvingFor()) &&
                $scope.testDone($scope.getStateNominalPower()) &&
                $scope.testDone($scope.getStateTypeIError()) &&
                $scope.testDone($scope.getStateDesignEssence()) &&
                $scope.testDone($scope.getStateCovariate()) &&
                $scope.testDone($scope.getStateRelativeGroupSize()) &&
                $scope.testDone($scope.getStateSmallestGroupSize()) &&
                $scope.testDone($scope.getStateBeta()) &&
                $scope.testDone($scope.getStateScaleFactorsForMeans()) &&
                $scope.testDone($scope.getStateBetweenParticipantContrast()) &&
                $scope.testDone($scope.getStateWithinParticipantContrast()) &&
                $scope.testDone($scope.getStateThetaNull()) &&
                $scope.testDone($scope.getStateSigmaE()) &&
                $scope.testDone($scope.getStateSigmaG()) &&
                $scope.testDone($scope.getStateSigmaYG()) &&
                $scope.testDone($scope.getStateSigmaY()) &&
                $scope.testDone($scope.getStateScaleFactorsForVariability()) &&
                $scope.testDone($scope.getStatePowerMethod()) &&
                $scope.testDone($scope.getStateConfidenceIntervals()) &&
                $scope.testDone($scope.getStatePowerCurve())

                );
        }
    };

    /**
     * Clear the cached results so the results view will reload
     */
    $scope.calculate = function() {
        powerService.clearCache();
        $scope.setView($scope.glimmpseConstants.viewTypeResults);
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
        } else if ($scope.getStatePredictors() == $scope.glimmpseConstants.stateComplete) {
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
        var state = $scope.glimmpseConstants.stateComplete;
        if ($scope.studyDesign.repeatedMeasuresTree > 0) {
            for(var factor in $scope.studyDesign.repeatedMeasuresTree) {
                if (factor.dimension === undefined || factor.dimension.length <= 0 ||
                    factor.repeatedMeasuresDimensionType === undefined ||
                    factor.numberOfMeasurements < 2 ||
                    factor.spacingList.length <= 0) {
                    state = $scope.glimmpseConstants.stateIncomplete;
                    break;
                }
            }
        }
        return state;
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
        if (!$scope.testDone($scope.getStatePredictors()) ||
            !$scope.testDone($scope.getStateResponseVariables()) ||
            !$scope.testDone($scope.getStateRepeatedMeasures())) {
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
        // TODO: finish state check
        return 'complete';
    };

    /**
     * Get the state of the beta scale factors view.  The view
     * is complete when at least one beta scale is specified.
     *
     * @returns complete or incomplete
     */
    $scope.getStateScaleFactorsForMeans = function() {
        if ($scope.studyDesign.betaScaleList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
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
        // TODO: finish state check
        return 'complete';
    };

    /**
     * Get the state of the covariate variability view.
     * The view is disabled when the user has not selected a covariate.
     * The view is complete when all variability information is entered.
     *
     * @returns disabled, complete, or incomplete
     */
    $scope.getStateCovariateVariability = function() {
        // TODO: finish state check
        return 'complete';
    };

    /**
     * Get the state of the sigma scale factors view.  The view is
     * complete when at least one scale factor has been entered.
     *
     * @returns complete or incomplete
     */
    $scope.getStateScaleFactorsForVariability = function() {
        if ($scope.studyDesign.sigmaScaleList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
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
            return 'complete';
        } else {
            return 'incomplete';
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
        // TODO: finish
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
                        return 'complete';
                    } else {
                        return 'incomplete';
                    }
                } else {
                    return 'complete';
                }
            } else {
                return 'incomplete';
            }


        } else {
            return 'disabled';
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
            return 'complete';
        } else {
            if ($scope.studyDesign.confidenceIntervalDescriptions.betaFixed !== undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.sigmaFixed !== undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.upperTailProbability !== undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.lowerTailProbability !== undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.sampleSize !== undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.rankOfDesignMatrix !== undefined) {
                return 'complete';
            } else {
                return 'incomplete';
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


    $scope.getStateDesignEssence = function() {
        return 'complete';
    };
    $scope.getStateBeta = function() {
        return 'complete';
    };
    $scope.getStateBetweenParticipantContrast = function() {
        return 'complete';
    };
    $scope.getStateWithinParticipantContrast = function() {
        return 'complete';
    };
    $scope.getStateThetaNull = function() {
        return 'complete';
    };

    $scope.getStateSigmaE = function() {
        if ($scope.studyDesign.gaussianCovariate) {
            return 'disabled';
        } else {
            return 'complete';
        }
    };

    $scope.getStateSigmaG = function() {
        if (!$scope.studyDesign.gaussianCovariate) {
            return 'disabled';
        } else {
            return 'complete';
        }
    };
    $scope.getStateSigmaY = function() {
        if (!$scope.studyDesign.gaussianCovariate) {
            return 'disabled';
        } else {
            return 'complete';
        }
    };
    $scope.getStateSigmaYG = function() {
        if (!$scope.studyDesign.gaussianCovariate) {
            return 'disabled';
        } else {
            return 'complete';
        }
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
    .controller('responseController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newResponse = '';
            $scope.editedResponse = '';
            $scope.glimmpseConstants = glimmpseConstants;
        }

        /**
         * Add a new response variable
         */
        $scope.addResponse = function () {
            var newOutcome = $scope.newResponse;
            if (newOutcome.length > 0) {
                // add the response to the list
                studyDesignService.responseList.push({
                    idx: studyDesignService.responseList.length,
                    name: newOutcome
                });
            }

            // update covariance
            if (studyDesignService.covariance.length === 0) {
                //window.alert("update covariance");
                studyDesignService.covariance.push({
                    "idx":0,
                    "type":"UNSTRUCTURED_CORRELATION",
                    "name":"__RESPONSE_COVARIANCE__",
                    "standardDeviationList":null,
                    "rho":-2,"delta":-1,"rows":studyDesignService.responseList.length,
                    "columns":studyDesignService.responseList.length,
                    "blob":{"data":null}
                });
            }

            // reset the new response to null
            $scope.newResponse = '';
            $scope.updateMatrixSet();


        };

        /**
         * Edit an existing response variable
         */
        $scope.editResponse = function(response) {
            $scope.editedResponse = response;
        };


        /**
         * Called when editing is complete
         * @param response
         */
        $scope.doneEditing = function (response) {
            $scope.editedResponse = null;
            response.value = response.value.trim();

            if (!response.value) {
                $scope.deleteResponse(response);
            }
        };

        /**
         * Delete an existing nominal power value
         */
        $scope.deleteResponse = function(response) {
            studyDesignService.responseList.splice(
                studyDesignService.responseList.indexOf(response), 1);
            $scope.updateMatrixSet();
        };

        /**
         * Resize the relevant matrices in the study design when a response variable is added
         * or deleted
         */
        $scope.updateMatrixSet = function() {
            $scope.studyDesign.updateMeans();
            $scope.studyDesign.updateCovariance();
                /*
            var betaMatrixIndex = studyDesignService.getMatrixSetListIndexByName('beta');
            var sigmaGaussianMatrixIndex =  studyDesignService.getMatrixSetListIndexByName('sigmaGaussianRandom');
            var betaRandomMatrixIndex = studyDesignService.getMatrixSetListIndexByName('betaRandom');
            var sigmaOGMatrixIndex =  studyDesignService.getMatrixSetListIndexByName('sigmaOutcomeGaussianRandom');
            var previousLength = studyDesignService.matrixSet[betaMatrixIndex].columns;
            var currentLength = 1;
            for (var i=0; i < studyDesignService.repeatedMeasuresTree.length; i++) {
                currentLength *= studyDesignService.repeatedMeasuresTree[i].numberOfMeasurements;
            }
            currentLength *= studyDesignService.responseList.length;
            var difference = currentLength - previousLength;
            if (difference > 0) {
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;

                for (var i=0; i < difference; i++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].push(0);
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].push(1);
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.push([0]);
                }
            }
            else if (difference < 0) {
                //window.alert("diff < 0");
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;
                for (var i=difference; i < 0; i++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.pop();
                }
            }  */
        };
    })

/**
 * Controller managing the predictors
 */
    .controller('predictorsController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
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
         * Add a new predictor name
         */
        $scope.addPredictor = function () {
            var newPredictor = $scope.newPredictorName;
            if (newPredictor !== undefined) {
                // add the predictor to the list
                var newPredictorObject = {
                    idx: studyDesignService.betweenParticipantFactorList.length,
                    predictorName: newPredictor,
                    categoryList: []
                };
                studyDesignService.betweenParticipantFactorList.push(newPredictorObject);
                $scope.studyDesign.updateMeans();
                $scope.currentPredictor = newPredictorObject;
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
            studyDesignService.betweenParticipantFactorList.splice(
                studyDesignService.betweenParticipantFactorList.indexOf(factor), 1);
            $scope.studyDesign.updateMeans();
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
                $scope.studyDesign.updateMeans();
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

        $scope.updateMatrixSet = function() {

            if ($scope.studyDesign.gaussianCovariate) {
                // set up default matrices
                var beta = $scope.studyDesign.getMatrixByName($scope.glimmpseConstants.matrixBeta);
                var P = beta.columns;

                $scope.studyDesign.matrixSet.push(
                    $scope.matrixUtils.createNamedFilledMatrix(
                        $scope.glimmpseConstants.matrixBetaRandom, 1, P, 1
                    )
                );
                // add default sigma G
                $scope.studyDesign.matrixSet.push(
                    $scope.matrixUtils.createNamedIdentityMatrix(
                        $scope.glimmpseConstants.matrixSigmaG, 1
                    )
                );
                // add default sigma YG
                $scope.studyDesign.matrixSet.push(
                    $scope.matrixUtils.createNamedFilledMatrix(
                        $scope.glimmpseConstants.matrixSigmaYG, P, 1, 0
                    )
                );

                if ($scope.studyDesign.viewTypeEnum == $scope.glimmpseConstants.modeMatrix) {
                    // add default sigma Y  - only used for matrix mode
                    $scope.studyDesign.matrixSet.push(
                        $scope.matrixUtils.createNamedIdentityMatrix(
                            $scope.glimmpseConstants.matrixSigmaY, P
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
    .controller('repeatedMeasuresController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.data = [];
            $scope.changedValue = undefined;

        }

        /**
         * Add a new repeated measure
         */
        $scope.addMeasure = function() {

            if (studyDesignService.repeatedMeasuresTree.length < 3) {

                studyDesignService.repeatedMeasuresTree.push({
                    idx: studyDesignService.repeatedMeasuresTree.length,
                    node: 0, parent: 0, repeatedMeasuresDimensionType: "numeric"
                });
            }

            // update covariance
            if (studyDesignService.covariance[0].name == "__RESPONSE_COVARIANCE__") {
                studyDesignService.covariance.push({
                    "idx":0,
                    "type":"LEAR_CORRELATION",
                    "name":"tempName",
                    "standardDeviationList":null,
                    "rho":"NaN","delta":"NaN","rows":0,
                    "columns":0,
                    "blob":{"data":null}});
            }

            $scope.updateMatrixSet();


            $scope.studyDesign.updateMeans();
            $scope.studyDesign.updateCovariance();

        };

        /**
         * Update spacingList of repeated measure
         */
        $scope.updateNoOfMeasurements = function(measure) {
            measure.spacingList = [];
            var nOfMeasurements =  measure.numberOfMeasurements;
            for (var i=1; i<=nOfMeasurements; i++)
                measure.spacingList.push({
                    idx:'0', value:i
                });
            $scope.updateMatrixSet();
        };

        /**
         * Remove a repeated measure
         */
        $scope.removeMeasure = function() {
            studyDesignService.repeatedMeasuresTree.pop();
            $scope.updateMatrixSet();
        };

        /**
         * Add all levels of repeated measures
         */
        $scope.removeMeasuring = function() {
            studyDesignService.repeatedMeasuresTree = [];
            $scope.updateMatrixSet();
        };

        $scope.updateMatrixSet = function() {

            var sigmaGaussianMatrixIndex =  studyDesignService.getMatrixSetListIndexByName('sigmaGaussianRandom');
            var betaMatrixIndex = studyDesignService.getMatrixSetListIndexByName('beta');
            var betaRandomMatrixIndex = studyDesignService.getMatrixSetListIndexByName('betaRandom');
            var sigmaOGMatrixIndex =  studyDesignService.getMatrixSetListIndexByName('sigmaOutcomeGaussianRandom');

            var previousLength = studyDesignService.matrixSet[betaMatrixIndex].columns;
            var currentLength = 1;
            for (var i=0; i < studyDesignService.repeatedMeasuresTree.length; i++) {
                currentLength *= studyDesignService.repeatedMeasuresTree[i].numberOfMeasurements;
            }
            currentLength *= studyDesignService.responseList.length;
            var difference = currentLength - previousLength;
            if (difference > 0) {
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;

                for (var j=0; j < difference; j++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].push(0);
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].push(1);
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.push([0]);
                }
            }
            else if (difference < 0) {
                window.alert("diff < 0");
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;
                for (var k=difference; k < 0; k++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.pop();
                }
            }
        };

    })


    /**
     * Controller managing the means view (i.e. beta matrix)
     */
    .controller('meansViewController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.betaMatrix = $scope.studyDesign.getMatrixByName(glimmpseConstants.matrixBeta);
            $scope.startColumn = 0;
        }

        /**
         * Shift the start column to the left
         */
        $scope.shiftLeft = function() {
            if ($scope.startColumn > 0) {
                $scope.startColumn = $scope.startColumn - $scope.studyDesign.responseList.length;
            }
        };

        /**
         * Shift the counter to the right
         */
        $scope.shiftRight = function() {
            if ($scope.startColumn < $scope.betaMatrix.columns - $scope.studyDesign.responseList.length) {
                $scope.startColumn = $scope.startColumn + $scope.studyDesign.responseList.length;
            }
        };
    })

/**
 * Controller managing the hypotheses - for now, we only support a single hypothesis
 */
    .controller('hypothesesController', function($scope, glimmpseConstants, studyDesignService) {

        /**
         * Returns true if the hypothesis contains the specified
         * between participant factor
         * @param factor
         * @returns {boolean}
         */
        $scope.containsBetweenFactor = function(factor) {
            for(var i = 0; i < $scope.hypothesis.betweenParticipantFactorMapList.length; i++) {
                if (factor == $scope.hypothesis.betweenParticipantFactorMapList[i].betweenParticipantFactor) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Returns true if the hypothesis contains the specified
         * within participant factor
         * @param factor
         * @returns {boolean}
         */
        $scope.containsWithinFactor = function(factor) {
            for(var i = 0; i < $scope.hypothesis.repeatedMeasuresMapTree; i++) {
                if (factor == $scope.hypothesis.repeatedMeasuresMapTree[i].repeatedMeasuresNode) {
                    return true;
                }
            }
            return false;
        };

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.hypothesis = studyDesignService.hypothesis[0];
            $scope.betweenFactorMapList = [];
            $scope.withinFactorMapList = [];
            $scope.validTypeList = [];
            $scope.currentBetweenFactorMap = undefined;
            $scope.currentWithinFactorMap = undefined;

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
                var inHypothesis = $scope.containsBetweenFactor(factor);
                $scope.betweenFactorMapList.push({
                    factorMap: {
                        type: glimmpseConstants.trendNone,
                        betweenParticipantFactor: factor
                    },
                    selected: inHypothesis,
                    showTrends: false
                });
            }
            // build mappings for within factors, and keep track of selection status
            for (var rmi = 0; rmi < studyDesignService.repeatedMeasuresTree.length; rmi++)  {
                var rmFactor = studyDesignService.repeatedMeasuresTree[rmi];
                var inWithinHypothesis = $scope.containsWithinFactor(rmFactor);
                $scope.withinFactorMapList.push({
                    factorMap: {
                        type: glimmpseConstants.trendNone,
                        repeatedMeasuresNode: rmFactor
                    },
                    selected: inWithinHypothesis,
                    showTrends: false
                });
            }
        }

        /**
         * Watch for type changes, and clean up from the previous type
         * as needed
         */
        $scope.$watch('hypothesis.type', function(newType, oldType) {
            if (oldType == $scope.glimmpseConstants.hypothesisGrandMean) {
                $scope.studyDesign.removeMatrixByName($scope.glimmpseConstants.matrixThetaNull);
                $scope.thetaNull = undefined;
            }
            if (newType == $scope.glimmpseConstants.hypothesisGrandMean) {
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
            }

        });

        /****** handlers for the single selection cases of main effects and trends ****/
        /**
         * Add or remove a between participant factor from the hypothesis object
         * for main effect or trend hypotheses
         *
         * We can't just ng-model this directly since we need to update
         * the old mapping (selected=false) before we move on
         */
        $scope.$watch('currentBetweenFactorMap', function(newMap, oldMap) {
            if (newMap !== undefined) {
                $scope.hypothesis.betweenParticipantFactorMapList = [];
                $scope.hypothesis.repeatedMeasuresMapTree = [];
                if (oldMap !== undefined) {
                    oldMap.selected = false;
                }
                if ($scope.currentWithinFactorMap !== undefined) {
                    $scope.currentWithinFactorMap.selected = false;
                    $scope.currentWithinFactorMap = undefined;
                }
                newMap.selected = true;

                // store in the hypothesis
                $scope.hypothesis.betweenParticipantFactorMapList.push(newMap.factorMap);
            }
        });

        /**
         * Add or remove a within participant factor from the hypothesis object
         * for main effect or trend hypotheses
         */
        $scope.$watch('currentWithinFactorMap', function(newMap, oldMap) {
            if (newMap !== undefined) {
                $scope.hypothesis.betweenParticipantFactorMapList = [];
                $scope.hypothesis.repeatedMeasuresMapTree = [];
                if (oldMap !== undefined) {
                    oldMap.selected = false;
                }
                if ($scope.currentBetweenFactorMap !== undefined) {
                    $scope.currentBetweenFactorMap.selected = false;
                    $scope.currentBetweenFactorMap = undefined;
                }
                newMap.selected = true;

                // store in the hypothesis
                $scope.hypothesis.repeatedMeasuresMapTree.push(newMap.factorMap);
            }
        });

        /********* handlers for the multiselect interaction case *******/
        /**
         * Update the between participant factor list
         * @param map
         */
        $scope.updateBetweenFactorMultiSelect = function(map) {
            if (map.selected) {
                if (!$scope.containsBetweenFactor(map.factorMap.betweenParticipantFactor)) {
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
                if (!$scope.containsWithinFactor(map.factorMap.repeatedMeasuresNode)) {
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
                    studyDesignService.powerMethodList.push({
                        idx: 0,
                        powerMethodEnum: methodName
                    });
                }
            } else {
                if (method !== null) {
                    studyDesignService.powerMethodList.splice(
                        studyDesignService.powerMethodList.indexOf(method), 1);
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
            for(var i in studyDesignService.powerMethodList) {
                if (name == studyDesignService.powerMethodList[i].value) {
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
    .controller('variabilityViewController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;

        }

        $scope.chooseVariabilityType = function() {

            if (studyDesignService.covariance[0].type == "UNSTRUCTURED_COVARIANCE") {
                studyDesignService.covariance[0].type = "UNSTRUCTURED_CORRELATION";
            }
            else if (studyDesignService.covariance[0].type == "UNSTRUCTURED_CORRELATION") {
                studyDesignService.covariance[0].type = "UNSTRUCTURED_COVARIANCE";
            }

        };

        $scope.chooseRMCorrelations = function() {

            if (studyDesignService.covariance[1].type == "UNSTRUCTURED_CORRELATION") {
                studyDesignService.covariance[1].type = "LEAR_CORRELATION";
            }
            else if (studyDesignService.covariance[1].type == "LEAR_CORRELATION") {
                studyDesignService.covariance[1].type = "UNSTRUCTURED_CORRELATION";
            }

        };

    })

/**
 * Controller for variability covariate within view
 */
    .controller('variabilityCovariateViewController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.hasSameCorrelation = undefined;
            $scope.STDForCovariate = undefined;
            $scope.currentOption = 1;
            $scope.startColumn = 0;
            $scope.numberOfRows = 0;

            $scope.matrixIndex = studyDesignService.getMatrixSetListIndexByName('sigmaOutcomeGaussianRandom');
            $scope.numberOfRows = studyDesignService.matrixSet[matrixIndex].rows;
        }

        $scope.SameCorrelationForOutcomes = function() {


            if ($scope.hasSameCorrelation !== undefined) {
                //indexOfList = studyDesignService.getMatrixSetListIndexByName('sigmaOutcomeGaussianRandom');
                var responseListLength = studyDesignService.responseList.length;
                var lengthToChange =  studyDesignService.matrixSet[matrixIndex].data.data.length;
                for (var j=responseListLength+1; j < lengthToChange;) {
                    for (var i=0; i < responseListLength; i++) {
                        studyDesignService.matrixSet[matrixIndex].data.data[j][0] =
                            studyDesignService.matrixSet[matrixIndex].data.data[i][0];
                        j++;
                    }
                }
            }
        };



        /**
         * Shift up for previous measurement
         */
        $scope.shiftUp = function() {
            if ($scope.startColumn > 0) {
                $scope.startColumn = $scope.startColumn-1;
            }
        };

        /**
         * Shift down for next measurement
         */
        $scope.shiftDown = function() {
            if ($scope.startColumn < $scope.numberOfRows/studyDesignService.responseList.length-1) {
                $scope.startColumn = $scope.startColumn+1;
            }
        };

    })

/**
 * Controller for the plot options view
 */
    .controller('plotOptionsController', function($scope, glimmpseConstants, studyDesignService) {

        // setter functions passed into generate data series function
        $scope.setTest = function(current, test) {current.statisticalTestTypeEnum = test.type;};
        $scope.setBetaScale = function(current, betaScale) {current.betaScale = betaScale.value;};
        $scope.setSigmaScale = function(current, sigmaScale) {current.sigmaScale = sigmaScale.value;};
        $scope.setAlpha = function(current, alpha) {current.typeIError = alpha.alphaValue;};
        $scope.setSampleSize = function(current, sampleSize) {current.sampleSize = sampleSize.value;};
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
                        label: '',
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

            $scope.columnDefs = [
                { field: 'label', displayName: "Label", width: 200,
                    enableCellEdit: true
                },
                { field: 'typeIError', displayName: 'Type I Error Rate', width: 200},
                { field: 'statisticalTestTypeEnum', displayName: 'Test', width: 200}
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
                    $scope.columnDefs({ field: 'nominalPower', displayName: 'Nominal Power', width: 200});
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
                if ($scope.studyDesign.quantileList.length > 0) {
                    $scope.numDataSeries *= $scope.studyDesign.quantileList.length;
                }
            }

            // now generate the data series with some mad recursive action
            $scope.possibleDataSeriesList = [];
            $scope.generateCombinations(dataLists, $scope.possibleDataSeriesList, 0,
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


//
//        $scope.columnDefs = [
//            { field: 'actualPower', displayName: 'Power', width: 80, cellFilter:'number:3'},
//            { field: 'totalSampleSize', displayName: 'Total Sample Size', width: 200 },
//            { field: 'nominalPower.value', displayName: 'Target Power', width: 200},
//            { field: 'alpha.alphaValue', displayName: 'Type I Error Rate', width: 200},
//            { field: 'test.type', displayName: 'Test', width: 200},
//            { field: 'betaScale.value', displayName: 'Means Scale Factor', width: 200},
//            { field: 'sigmaScale.value', displayName: 'Variability Scale Factor', width: 200}
//        ];
//
//        // build grid options
//        $scope.resultsGridOptions = {
//            data: 'gridData',
//            columnDefs: 'columnDefs',
//            selectedItems: []
//        };

        // initialize the controller
        init();
        function init() {
            $scope.columnDefs = [];
            $scope.possibleDataSeriesList = [];
            $scope.studyDesign = studyDesignService;
            $scope.XAxisOptions = [
                {label: "Total Sample Size", value: $scope.glimmpseConstants.xAxisTotalSampleSize},
                {label: "Variability Scale Factor", value: $scope.glimmpseConstants.xAxisSigmaScale},
                {label: "Regression Coefficient Scale Factor", value: $scope.glimmpseConstants.xAxisBetaScale}
            ];

            $scope.gridOptions = {
                data: 'possibleDataSeriesList',
                columnDefs: 'columnDefs',
                showSelectionCheckbox: true,
                selectWithCheckboxOnly: true,
                selectedItems: [],
                afterSelectionChange: function(data) {
                    $scope.studyDesign.powerCurveDescriptions.dataSeriesList = $scope.gridOptions.selectedItems;
                }
            };

            if ($scope.studyDesign.powerCurveDescriptions !== null) {

                $scope.buildDataSeries();
                for(var i = 0; i < $scope.possibleDataSeriesList.length; i++) {
                    // TODO: select the series in the study design
                }
            }


        }

        /**
         *  Toggle the power curve on/off
         */
        $scope.togglePowerCurveDescription = function() {
            if ($scope.studyDesign.powerCurveDescriptions !== null) {
                $scope.studyDesign.powerCurveDescriptions = null;
                $scope.dataSeriesList = [];
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
                $scope.buildDataSeries();
            }
        };

        /**
         * Add data series to the power curve description
         */
        $scope.addDataSeries = function(series) {
            if (studyDesignService.powerCurveDescriptions !== null) {
                studyDesignService.powerCurveDescriptions.dataSeriesList.push({
                    idx: 0,
                    label: series.label,
                    confidenceLimits: series.confidenceLimits,
                    statisticalTestTypeEnum: series.statisticalTestTypeEnum,
                    betaScale: series.betaScale,
                    sigmaScale: series.sigmaScale,
                    typeIError: series.typeIError,
                    sampleSize: series.sampleSize,
                    nominalPower: series.nominalPower,
                    powerMethod: series.powerMethod,
                    quantile: series.quantile
                });
            }
        };

        /**
         * Delete the specified data series from the power curve
         * @param dataSeries
         */
        $scope.deleteDataSeries = function() {
            /*
            for(var i = 0; i < $scope.dataSeriesGridOptions.selectedItems.length; i++) {
                var dataSeries = $scope.dataSeriesGridOptions.selectedItems[i];
                studyDesignService.powerCurveDescriptions.dataSeriesList.splice(
                    studyDesignService.powerCurveDescriptions.dataSeriesList.indexOf(dataSeries), 1);
            }
            $scope.gridData = studyDesignService.powerCurveDescriptions.dataSeriesList;
            */
            // TODO
        };
    })

/**
 * Controller for relative group size view
 */
    .controller('relativeGroupSizeController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.groupsTable = [];
            $scope.groupsList = [];
            $scope.relativeGroupSizeList = [];

            var lenList = 1;

            var totalPermutations = 1;
            for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
                var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
                if (len >= 2 )
                    totalPermutations = totalPermutations * len;
            }

            if (studyDesignService.relativeGroupSizeList.length > 0) {
                $scope.relativeGroupSizeList = studyDesignService.relativeGroupSizeList;
            }

            if (studyDesignService.relativeGroupSizeList.length <  totalPermutations) {
                var difference = totalPermutations -
                    studyDesignService.relativeGroupSizeList.length;
                for (var d=0; d < difference; d++) {
                    studyDesignService.relativeGroupSizeList.push({
                        idx:0, value:1
                    });
                }
            }

            if (studyDesignService.relativeGroupSizeList.length <  totalPermutations) {
                for (var p=0; p < totalPermutations; p++) {
                    studyDesignService.relativeGroupSizeList.push({
                        idx:0, value:1
                    });
                }
            }



            var columnList = [];

            var numRepetitions = totalPermutations;
            for (var bfi=0; bfi < studyDesignService.betweenParticipantFactorList.length; bfi++) {
                columnList = [];
                var numCategories = studyDesignService.betweenParticipantFactorList[bfi].categoryList.length;
                if (numCategories >= 2 ) {
                    numRepetitions /= numCategories;
                    for (var perm = 0; perm < totalPermutations;) {
                        for (var cat=0; cat < numCategories; cat++) {
                            var categoryName = studyDesignService.betweenParticipantFactorList[bfi].
                                categoryList[cat].category;

                            for (var z=0; z < numRepetitions; z++) {
                                columnList.push(categoryName);
                                perm++;
                            }
                        }
                    }
                }
                $scope.groupsTable.push(columnList);
            }
            lenList = columnList.length;
            $scope.groupsList = [];
            for (var li = 0; li < lenList; li++) {
                $scope.groupsList.push(li);
            }
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
            $scope.errorMessage = undefined;
            $scope.gridData = {};

            $scope.columnDefs = [
                { field: 'actualPower', displayName: 'Power', width: 80, cellFilter:'number:3'},
                { field: 'totalSampleSize', displayName: 'Total Sample Size', width: 200 },
                { field: 'nominalPower.value', displayName: 'Target Power', width: 200},
                { field: 'alpha.alphaValue', displayName: 'Type I Error Rate', width: 200},
                { field: 'test.type', displayName: 'Test', width: 200},
                { field: 'betaScale.value', displayName: 'Means Scale Factor', width: 200},
                { field: 'sigmaScale.value', displayName: 'Variability Scale Factor', width: 200}
            ];

            // build grid options
            $scope.resultsGridOptions = {
                data: 'gridData',
                columnDefs: 'columnDefs',
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

    })

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
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
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
                for(var i = 0; i < studyDesignService.powerCurveDescriptions.dataSeriesList.length; i++) {
                    var seriesDescription = studyDesignService.powerCurveDescriptions.dataSeriesList[i];
                    var newSeries = {
                        name: seriesDescription.label,
                        data: []
                    };
                    // for lower confidence limits
                    var lowerSeries = {
                        data: []
                    };
                    // for upper confidence limits
                    var upperSeries = {
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
                                lowerPoint.push(result.confidenceLimits.lower) ;
                                lowerSeries.data.push(lowerPoint);
                                upperPoint.push(point[0]) ;
                                upperPoint.push(result.confidenceLimits.upper) ;
                                upperSeries.data.push(upperPoint);

                            }


                        }
                    }

                    newSeries.data.sort($scope.sortByX);
                    $scope.chartConfig.series.push(newSeries);

                }
            }
        }

    })

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

    })



/**
 * Main study design controller
  */
.controller('StudyDesignController', ['services/studyDesignService'], function($scope) {
    $scope.nominalPowerList = [];
    $scope.newNominalPower = '';

    /* Unique id for the study design */
    $scope.uuid = [];

    /** The name. */
    $scope.name = null;

    /** Flag indicating if the user wishes to control for a
     * Gaussian covariate
     * */
    $scope.gaussianCovariate = false;

    /** Indicates what the user is solving for */
    $scope.solutionTypeEnum = 'power';

    /** The name of the independent sampling unit (deprecated) */
    $scope.participantLabel = null;

    /** Indicates whether the design was built in matrix or guided mode */
    $scope.viewTypeEnum = null;

    /** The confidence interval descriptions. */
    $scope.confidenceIntervalDescriptions = null;

    /** The power curve descriptions. */
    $scope.powerCurveDescriptions = null;

    /* separate sets for list objects */
    /** The alpha list. */
    $scope.alphaList = [];

    /** The beta scale list. */
    $scope.betaScaleList = [];

    /** The sigma scale list. */
    $scope.sigmaScaleList = [];

    /** The relative group size list. */
    $scope.relativeGroupSizeList = [];

    /** The sample size list. */
    $scope.sampleSizeList = [];

    /** The statistical test list. */
    $scope.statisticalTestList = [];

    /** The power method list. */
    $scope.powerMethodList = [];

    /** The quantile list. */
    $scope.quantileList = [];

    /** The nominal power list. */
    $scope.nominalPowerList = [];

    /** The response list. */
    $scope.responseList = [];

    /** The between participant factor list. */
    $scope.betweenParticipantFactorList = [];

    // private Set<StudyDesignNamedMatrix> matrixSet = null;
    /** The repeated measures tree. */
    $scope.repeatedMeasuresTree = [];

    /** The clustering tree. */
    $scope.clusteringTree = [];

    /** The hypothesis. */
    $scope.hypothesis = [];

    /** The covariance. */
    $scope.covariance = [];

    /** The matrix set. */
    $scope.matrixSet = [];

    /* Methods */

});