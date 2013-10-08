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
    function($scope, $rootScope, $location, $http, $modal,
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

        // view mode (either "Study Design" or "Results"
        // input mode (either guided or matrix)
        /*
        * Mode indicates if the user selected guided or matrix mode
        * View indicates if the user is viewing the study design or
        *   results 'tab'
        * staleResults indicates that the design has changed since
        *   the user last clicked calculate.
         */
        $scope.state = {
            mode: undefined,
            view: 'studyDesign',
            staleResults: true
        }
    }



    /**
     * Convenience routine to determine if a screen is done
     * @param state
     * @returns {boolean}
     */
    $scope.testDone = function(state) {
        return (state == glimmpseConstants.stateComplete ||
            state == glimmpseConstants.stateDisabled);
    }


    /**
     *  Display the incomplete items dialog
     */
    $scope.showIncompleteItemsDialog = function () {

        $scope.incompleteViews = [];
        if (!$scope.testDone($scope.getStateSolvingFor())) { $scope.incompleteViews.push("Solving For")}
        if (!$scope.testDone($scope.getStateNominalPower())) { $scope.incompleteViews.push("Desired Power")}
        if (!$scope.testDone($scope.getStateTypeIError())) { $scope.incompleteViews.push("Type I Error")}
        if (!$scope.testDone($scope.getStatePredictors())) { $scope.incompleteViews.push("Study Groups")}
        if (!$scope.testDone($scope.getStateCovariate())) { $scope.incompleteViews.push("Covariate")}
        if (!$scope.testDone($scope.getStateClustering())) { $scope.incompleteViews.push("Clustering")}
        if (!$scope.testDone($scope.getStateRelativeGroupSize())) { $scope.incompleteViews.push("Relative Group Size")}
        if (!$scope.testDone($scope.getStateSmallestGroupSize())) { $scope.incompleteViews.push("Smallest Group Size")}
        if (!$scope.testDone($scope.getStateResponseVariables())) { $scope.incompleteViews.push("Response Variables")}
        if (!$scope.testDone($scope.getStateRepeatedMeasures())) { $scope.incompleteViews.push("Repeated Measures")}
        if (!$scope.testDone($scope.getStateHypothesis())) { $scope.incompleteViews.push("Hypothesis")}
        if (!$scope.testDone($scope.getStateMeans())) { $scope.incompleteViews.push("Means")}
        if (!$scope.testDone($scope.getStateScaleFactorsForMeans())) { $scope.incompleteViews.push("Scale Factor (means)")}
        if (!$scope.testDone($scope.getStateWithinVariability())) { $scope.incompleteViews.push("Within Participant Variability")}
        if (!$scope.testDone($scope.getStateCovariateVariability())) { $scope.incompleteViews.push("Covariate Variability")}
        if (!$scope.testDone($scope.getStateScaleFactorsForVariability())) { $scope.incompleteViews.push("Scale Factor (variability)")}
        if (!$scope.testDone($scope.getStateStatisticalTest())) { $scope.incompleteViews.push("Statistical Test")}
        if (!$scope.testDone($scope.getStatePowerMethod())) { $scope.incompleteViews.push("Power Method")}
        if (!$scope.testDone($scope.getStateConfidenceIntervals())) { $scope.incompleteViews.push("Confidence Intervals")}
        if (!$scope.testDone($scope.getStatePowerCurve())) { $scope.incompleteViews.push("Power Curve")}

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
        );
    }

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
    }


    /**
     * clear the study design
     */
    $scope.reset = function() {
        if (confirm('This action will clear any unsaved study design information.  Continue?')) {
            $scope.studyDesign.reset();
            $scope.powerService.clearCache();
            init();
        }
    }


    /**
     * Upload a study design file
     * @param input
     * @param parentScope
     */
    $scope.uploadFile = function(input) {
        $location.path('/')
        powerService.clearCache();

        var $form = $(input).parents('form');

        if (input.value == '') {
            window.alert("No file was selected.  Please try again");
        }
        $scope.showWaitDialog();

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
                $scope.waitDialog.close();
            },
            success: function(responseText, statusText, xhr, form) {
                // select the appropriate input mode
                $scope.$apply(function() {

                    // parse the json
                    try {
                        $scope.studyDesign.fromJSON(responseText)
                    } catch(err) {
                        window.alert("The file did not contain a valid study design");
                    }

                    $scope.state.mode = $scope.studyDesign.viewTypeEnum;
                    $scope.state.view = glimmpseConstants.viewTypeStudyDesign;
                });
                $scope.waitDialog.close();
                $form[0].reset();
            }
        });

    }

    /**
     * Called prior to submission of save form.  Updates
     * the value of the study design JSON in a hidden field
     * in the save form.
     */
    $scope.updateStudyDesignJSON = function() {
        $scope.studyDesignJSON = angular.toJson($scope.studyDesign);
    }

    /**
     * Called prior to submission of save form.  Updates
     * the value of the study design JSON in a hidden field
     * in the save form.
     */
    $scope.updateResultsCSV = function() {
        // add header row
        var resultsCSV = "desiredPower,actualPower,totalSampleSize,alpha,betaScale,sigmaScale,test,powerMethod,quantile," +
            "ciLower,ciUpper,errorCode,errorMessage\n";
        if ($scope.powerService.cachedResults != undefined) {
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
                        (result.quantile != null ? result.quantile.value : "") + "," +
                        (result.confidenceInterval != null ? result.confidenceInterval.lowerLimit : "") + "," +
                        (result.confidenceInterval != null ? result.confidenceInterval.upperLimit : "") + "," +
                        (result.errorCode != null ? result.errorCode : "") + "," +
                        (result.errorMessage != null ? result.errorMessage : "") + "\n"
                ;

            }
        }
        $scope.resultsCSV = resultsCSV;

    }

    /**
     * Switch between the study design view and the results view
     * @param view
     */
    $scope.setView = function(view) {
        $scope.state.view = view;
    }

    $scope.getView = function() {
        return $scope.state.view;
    }

    /**
     * Switch between matrix and guided mode
     * @param mode
     */
    $scope.setMode = function(mode) {
        $scope.state.mode = mode;
    }

    $scope.getMode = function() {
        return $scope.state.mode;
    }

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
    }

    /**
     * Determines if the study design is complete and
     * can be submitted to the power service
     *
     * @returns {boolean}
     */
    $scope.calculateAllowed = function() {
        if ($scope.getMode() == glimmpseConstants.modeGuided) {
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
        } else if ($scope.getMode() == glimmpseConstants.modeMatrix) {
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
    }

    /**
     * Clear the cached results so the results view will reload
     */
    $scope.calculate = function() {
        powerService.clearCache();
        $scope.setView(glimmpseConstants.viewTypeResults);
    }

    /**
     * Get the state of solution type view.  The view is
     * complete if a solution type has been selected
     *
     * @returns complete or incomplete
     */
    $scope.getStateSolvingFor = function() {
        if ($scope.studyDesign.solutionTypeEnum != undefined) {
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

    /**
     * Get the state of the nominal power list.  The list is
     * disabled if the user is solving for power.  It is
     * considered complete if at least one power has been entered.
     *
     * @returns complete, incomplete, or disabled
     */
    $scope.getStateNominalPower = function() {
        if ($scope.studyDesign.solutionTypeEnum == undefined ||
           $scope.studyDesign.solutionTypeEnum == glimmpseConstants.solutionTypePower) {
            return 'disabled';
        } else if ($scope.studyDesign.nominalPowerList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

    /**
     * Get the state of the Type I error list.  At least
     * one alpha value is required for the list to be complete.
     * @returns complete or incomplete
     */
    $scope.getStateTypeIError = function() {
        if ($scope.studyDesign.alphaList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

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
                    return 'incomplete';
                    break;
                }
            }
        }
        return 'complete';
    }

    /**
     * Get the state of the Gaussian covariate view.
     * In the current interface, this view is always complete.
     *
     * @returns complete
     */
    $scope.getStateCovariate = function() {
        return 'complete';
    }

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
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

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
            return 'disabled';
        } else if ($scope.getStatePredictors() == 'complete') {
            return 'complete';
        } else {
            return 'blocked';
        }
    }

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
            return 'disabled';
        } else if ($scope.studyDesign.sampleSizeList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

    /**
     * Get the state of response variables view.  The view
     * is complete when at least one variable has been specified.
     *
     * @returns complete or incomplete
     */
    $scope.getStateResponseVariables = function() {
        if ($scope.studyDesign.responseList.length > 0) {
            return 'complete';
        } else {
            return 'incomplete';
        }
    }

    /**
     * Get the state of the repeated measures view.  The view
     * is complete when
     * 1. No repeated measures are specified, or
     * 2. Information for all repeated measures are complete
     *
     * @returns {string}
     */
    $scope.getStateRepeatedMeasures = function() {
        var state = 'complete';
        if ($scope.studyDesign.repeatedMeasuresTree > 0) {
            for(factor in $scope.studyDesign.repeatedMeasuresTree) {
                if (factor.dimension == undefined || factor.dimension.length <= 0 ||
                    factor.repeatedMeasuresDimensionType == undefined ||
                    factor.numberOfMeasurements < 2 ||
                    factor.spacingList.length <= 0) {
                    state = 'incomplete';
                    break;
                }
            }
        }
        return state;
    }


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
        // TODO: finish state check
        return 'complete';
    }

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
    }

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
    }

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
    }

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
    }

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
    }

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
    }

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
    }

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
        if ($scope.studyDesign.confidenceIntervalDescriptions == null) {
            return 'complete';
        } else {
            if ($scope.studyDesign.confidenceIntervalDescriptions.betaFixed != undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.sigmaFixed != undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.upperTailProbability != undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.lowerTailProbability != undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.sampleSize != undefined &&
                $scope.studyDesign.confidenceIntervalDescriptions.rankOfDesignMatrix != undefined) {
                return 'complete';
            } else {
                return 'incomplete';
            }
        }
    }

    /**
     *
     * @returns {string}
     */
    $scope.getStatePowerCurve = function() {
        // TODO: finish
        return 'complete';
    }


    $scope.getStateDesignEssence = function() {
        // TODO
    }
    $scope.getStateBeta = function() {
        // TODO
    }
    $scope.getStateBetweenParticipantContrast = function() {
        // TODO
    }
    $scope.getStateWithinParticipantContrast = function() {
        // TODO
    }
    $scope.getStateThetaNull = function() {
        // TODO
    }
    $scope.getStateSigmaE = function() {
        // TODO
    }
    $scope.getStateSigmaG = function() {
        // TODO
    }
    $scope.getStateSigmaYG = function() {
        // TODO
    }
        $scope.getStateSigmaY = function() {
            // TODO
        }


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
        if (newPower != undefined) {
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
            if (newAlpha != undefined) {
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
            if (newScale != undefined) {
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
            if (newScale != undefined) {
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
            if (newN != undefined) {
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

        $scope.updateMatrixSet = function() {
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
                window.alert("diff < 0");
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;
                for (var i=difference; i < 0; i++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.pop();
                }
            }
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
        }

        /**
         * Add a new predictor name
         */
        $scope.addPredictor = function () {
            var newPredictor = $scope.newPredictorName;
            if (newPredictor != undefined) {
                // add the predictor to the list
                var newPredictorObject = {
                    idx: studyDesignService.betweenParticipantFactorList.length,
                    predictorName: newPredictor,
                    categoryList: []
                }
                studyDesignService.betweenParticipantFactorList.push(newPredictorObject);
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
        };

        /**
         * Display the categories for the given factor
         * @param factor
         */
        $scope.showCategories = function(factor) {
            $scope.currentPredictor = factor;
        }

        /**
         * Add a new category name
         */
        $scope.addCategory = function () {
            var newCategory = $scope.newCategoryName;
            if ($scope.currentPredictor != undefined &&
                newCategory != undefined) {
                // add the category to the list
                $scope.currentPredictor.categoryList.push({
                    idx: 0,
                    category: newCategory
                });
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
        }
    })

/**
 * Controller managing the covariates
 */
    .controller('covariatesController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.glimmpseConstants = glimmpseConstants;
            //$scope.hasCovariate = undefined;
        }

        $scope.setMatrixSet = function() {
            //studyDesignService.gaussianCovariate = $scope.hasCovariate;
            if (studyDesignService.gaussianCovariate == 'YES') {
                //studyDesignService.gaussianCovariate = true;
                var dataForBeta = [];
                var dataForBetaRandom = [];
                var dataForsigmaOutcomeGaussianRandom = [];
                var totalLength = 1;
                for (var i=0; i < studyDesignService.repeatedMeasuresTree.length; i++) {
                    totalLength *= studyDesignService.repeatedMeasuresTree[i].numberOfMeasurements;
                }
                totalLength *= studyDesignService.responseList.length;

                studyDesignService.matrixSet.push({
                    idx:0, name:'sigmaGaussianRandom', rows:1, columns:1,
                    data:{data:[[0]]}
                });

                for (var i=0; i < totalLength; i++) {
                    dataForBeta.push(0);
                    dataForBetaRandom.push(1);
                    dataForsigmaOutcomeGaussianRandom.push([0]);
                }

                //set the three lists in matrix set
                studyDesignService.matrixSet.push({
                    idx:0, name:'beta', rows:1,
                    columns:totalLength,
                    data:{data:[dataForBeta]}
                });

                studyDesignService.matrixSet.push({
                    idx:0, name:'betaRandom', rows:1,
                    columns:0,
                    data:{data:[dataForBetaRandom]}
                });

                studyDesignService.matrixSet.push({
                    idx:0, name:'sigmaOutcomeGaussianRandom',
                    rows:totalLength,
                    columns:1,
                    data:{data:dataForsigmaOutcomeGaussianRandom}
                });

            }
            else {
                //studyDesignService.gaussianCovariate = false;
                studyDesignService.matrixSet = [];
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
                    type: glimmpseConstants.testHotellingLawleyTrace,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testHotellingLawleyTrace) != -1)},
                {label: "Pillai-Bartlett Trace",
                    type: glimmpseConstants.testPillaiBartlettTrace,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testPillaiBartlettTrace) != -1)},
                {label: "Wilks Likelihood Ratio",
                    type: glimmpseConstants.testWilksLambda,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testWilksLambda) != -1)},
                {label: "Univariate Approach to Repeated Measures with Box Correction",
                    type: glimmpseConstants.testUnirepBox,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testUnirepBox) != -1)},
                {label: "Univariate Approach to Repeated Measures with Geisser-Greenhouse Correction",
                    type: glimmpseConstants.testUnirepGG,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testUnirepGG) != -1)},
                {label: "Univariate Approach to Repeated Measures with Huynh-Feldt Correction",
                    type: glimmpseConstants.testUnirepHF,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testUnirepHF) != -1)},
                {label: "Univariate Approach to Repeated Measures, uncorrected",
                    type: glimmpseConstants.testUnirep,
                    selected: ($scope.getTestIndexByName(glimmpseConstants.testUnirep) != -1)}
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
                })
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
            $scope.updateMatrixSet();
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

                for (var i=0; i < difference; i++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].push(0);
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].push(1);
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.push([0]);
                }
            }
            else if (difference < 0) {
                window.alert("diff < 0");
                studyDesignService.matrixSet[betaMatrixIndex].columns = currentLength;
                studyDesignService.matrixSet[sigmaOGMatrixIndex].rows = currentLength;
                for (var i=difference; i < 0; i++) {
                    studyDesignService.matrixSet[betaMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[betaRandomMatrixIndex].data.data[0].pop();
                    studyDesignService.matrixSet[sigmaOGMatrixIndex].data.data.pop();
                }
            }
        };

    })


/**
 * Controller managing the covariates
 */
    .controller('meansViewController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.groupsTable = [];
            $scope.groupsList = [];
            $scope.startColumn = 0;
            $scope.numberOfColumns = 0;
            $scope.rmIndex = [];
            for (var i=0; i < studyDesignService.repeatedMeasuresTree.length; i++) {
                $scope.rmIndex.push(0);
            }

            var lenList = 1;

            var totalPermutations = 1;
            for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
                var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
                if (len >= 2 )
                    totalPermutations = totalPermutations * len;
            }

            var matrixIndex = studyDesignService.getMatrixSetListIndexByName('beta');
            //window.alert("returned index -1" + matrixIndex);

            studyDesignService.matrixSet[matrixIndex].rows = totalPermutations;
            var numberOfColumns = studyDesignService.matrixSet[matrixIndex].columns;
            $scope.numberOfColumns = numberOfColumns;
            while (studyDesignService.matrixSet[matrixIndex].data.data.length < totalPermutations) {
                studyDesignService.matrixSet[matrixIndex].data.data.push([]);
            }


            for (var i=1; i < totalPermutations; i++) {
                while (studyDesignService.matrixSet[matrixIndex].data.data[i].length < numberOfColumns) {
                    studyDesignService.matrixSet[matrixIndex].data.data[i].push(0);
                }
            }

            var columnList = [];

            var numRepetitions = totalPermutations;
            for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
                columnList = [];
                var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
                if (len >= 2 ) {
                    numRepetitions /= len;
                    for (var perm = 0; perm < totalPermutations;) {
                        for (var cat=0; cat < len; cat++) {
                            var categoryName = studyDesignService.betweenParticipantFactorList[i].
                                categoryList[cat].category;

                            for (var z=0; z < numRepetitions; z++) {
                                columnList.push(categoryName);
                                perm++;
                            }
                        }
                    }
                    //window.alert("list is:" + columnList);
                }
                $scope.groupsTable.push(columnList);

            }
            lenList = columnList.length;
            $scope.groupsList = [];
            for (var i = 0; i < lenList; i++) {
                $scope.groupsList.push(i);
            }

        }

        /**
         * Shift the counter to the left
         */
        $scope.shiftLeft = function() {
            if ($scope.startColumn > 0) {
                $scope.startColumn = $scope.startColumn-1;
            }
        };

        /**
         * Shift the counter to the right
         */
        $scope.shiftRight = function() {
            if ($scope.startColumn < $scope.numberOfColumns/studyDesignService.responseList.length-1) {
                $scope.startColumn = $scope.startColumn+1;
            }
        };
    })

/**
 * Controller managing the hypotheses
 */
    .controller('hypothesesController', function($scope, glimmpseConstants, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.hypothesisOfInterest = undefined;
            $scope.varList = [];
            $scope.selectedTrend = undefined;

            for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++)  {
                $scope.varList.push({
                    name:studyDesignService.betweenParticipantFactorList[i].value, selected:false
                    });
            }

            for (var i=0; i < studyDesignService.repeatedMeasuresTree.length; i++)  {
                $scope.varList.push({
                    name:studyDesignService.repeatedMeasuresTree[i].dimension, selected:false
                });
            }
        }

        /**
         * Update matrixSet with grand mean values
         */
        $scope.addMeansToMatrixSet = function() {
            studyDesignService.matrixSet.push({
            idx:0,name:'thetaNull',rows:2,columns:1,data:{data:[[25],[35]]}
            });

        };

        /**
         * Update predictors of interest for between factors
         */
        $scope.updateBetweenFactor =function(factor, element) {
               element.checked = !element.checked;
                if(element.checked == true) {
                    if ($scope.getBetweenFactorIndexByName(factor.value) == -1) {
                        studyDesignService.hypothesis[0].betweenParticipantFactorMapList.push({
                        type:'NONE', betweenParticipantFactor:factor
                        });
                    }
                    for (var i=0; i < $scope.varList.length; i++) {
                        if ($scope.varList[i].name == factor.value) {
                            $scope.varList[i].selected = true;
                        }
                    }
                }
                else {
                    studyDesignService.hypothesis[0].
                        betweenParticipantFactorMapList.splice(
                            $scope.getBetweenFactorIndexByName(factor.value), 1);
                    for (var i=0; i < $scope.varList.length; i++) {
                        if ($scope.varList[i].name == factor.value) {
                            $scope.varList[i].selected = false;
                        }
                    }
                }
        };

        /**
         * Update predictors of interest for within factors
         */

        $scope.updateWithinFactor = function(measure, element) {
                element.checked = !element.checked;
                if(element.checked == true) {
                    if ($scope.getWithinFactorIndexByName(measure.dimension) == -1) {
                        studyDesignService.hypothesis[0].repeatedMeasuresMapTree.push({
                        type:'NONE', repeatedMeasuresNode:measure
                        });
                    }
                    for (var i=0; i < $scope.varList.length; i++) {
                        if ($scope.varList[i].name == measure.dimension) {
                            $scope.varList[i].selected = true;
                        }
                    }
                }
                else {
                    studyDesignService.hypothesis[0].
                        repeatedMeasuresMapTree.splice(
                            $scope.getWithinFactorIndexByName(measure.dimension), 1);
                    for (var i=0; i < $scope.varList.length; i++) {
                        if ($scope.varList[i].name == measure.dimension) {
                            $scope.varList[i].selected = false;
                        }
                    }
                }
        };

        /**
         * Use the name of a between factor to find its index
         */
        $scope.getBetweenFactorIndexByName = function(factorName) {

            for (var i=0; i < studyDesignService.hypothesis[0].betweenParticipantFactorMapList.
                length; i++) {
                if (factorName == studyDesignService.hypothesis[0].
                    betweenParticipantFactorMapList[i].betweenParticipantFactor.value) {
                    return i;
                }
            }
            return -1;
        };

        /**
         * Use the name of a within factor to find its index
         */
        $scope.getWithinFactorIndexByName = function(measureName) {

            for (var i=0; i < studyDesignService.hypothesis[0].repeatedMeasuresMapTree.length; i++) {
                if (measureName == studyDesignService.hypothesis[0].repeatedMeasuresMapTree[i].
                    repeatedMeasuresNode.dimension) {
                    return i;
                }
            }
            return -1;
        };

        /**
         * Test if the predictor is selected
         */
        $scope.isSelected = function(varName) {

            for (var i=0; i < $scope.varList.length; i++) {
                if ($scope.varList[i].name == varName) {
                    return $scope.varList[i].selected;
                }
            }
        };

        /**
         * Display a dialog box to select trend
         */
        $scope.showTrendDialog = function(predictorName) {
            document.getElementById(predictorName).style.display = "block";
            document.getElementById(predictorName+"-trend").style.display = "block";


        };

        /*$scope.centeredPopup = function(url,winName,w,h,scroll) {
            var LeftPosition = (screen.width) ? (screen.width-w)/2 : 0;
            var TopPosition = (screen.height) ? (screen.height-h)/2 : 0;
            var settings =
                'height='+h+',width='+w+',top='+TopPosition+',left='+LeftPosition+',scrollbars='+scroll+',resizable'
            popupWindow = window.open(url,winName,settings)
        }; */

        $scope.addBetweenPredictorMainEffect = function(factor) {

            studyDesignService.hypothesis[0].betweenParticipantFactorMapList=[];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree = [];
            studyDesignService.hypothesis[0].betweenParticipantFactorMapList.push(
                {type:'NONE', betweenParticipantFactor:factor
                });


        };

        $scope.addWithinPredictorMainEffect = function(measure) {

            studyDesignService.hypothesis[0].betweenParticipantFactorMapList = [];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree = [];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree.push({
            type:'NONE', repeatedMeasuresNode:measure
            });

        };

        $scope.addBetweenPredictorForTrend = function(factor) {

            studyDesignService.hypothesis[0].betweenParticipantFactorMapList=[];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree = [];
            studyDesignService.hypothesis[0].betweenParticipantFactorMapList.push(
                {type:'NONE', betweenParticipantFactor:factor
                });


        };

        $scope.addWithinPredictorForTrend = function(measure) {

            studyDesignService.hypothesis[0].betweenParticipantFactorMapList = [];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree = [];
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree.push({
                type:'NONE', repeatedMeasuresNode:measure
            });

        };

        $scope.updateTypeOfTrend = function(typeOfTrend) {
              if (studyDesignService.hypothesis[0].betweenParticipantFactorMapList.length < 1) {
                  //window.alert("inside update trend with [] betweenFactor");
                  //var index = $scope.getWithinFactorIndexByName(divNameToHide);
                  studyDesignService.hypothesis[0].repeatedMeasuresMapTree[0].type = typeOfTrend;
              }
              else if (studyDesignService.hypothesis[0].repeatedMeasuresMapTree.length < 1) {
                  //window.alert("inside update trend with [] repeatedMeasure");
                  //var index = $scope.getBetweenFactorIndexByName(divNameToHide);
                  studyDesignService.hypothesis[0].betweenParticipantFactorMapList[0].type = typeOfTrend;
              }

        };

        $scope.updateWithinFactorTypeOfTrend = function(typeOfTrend, divNameToHide) {
            var index = $scope.getWithinFactorIndexByName(divNameToHide);
            studyDesignService.hypothesis[0].repeatedMeasuresMapTree[index].type = typeOfTrend;
            document.getElementById(divNameToHide).style.display = "none";
            document.getElementById(divNameToHide+"-trend").style.display = "block";
        };

        $scope.updateBetweenFactorTypeOfTrend = function(typeOfTrend, divNameToHide) {
            var index = $scope.getBetweenFactorIndexByName(divNameToHide);
            studyDesignService.hypothesis[0].betweenParticipantFactorMapList[index].type = typeOfTrend;
            document.getElementById(divNameToHide).style.display = "none";
            document.getElementById(divNameToHide+"-trend").style.display = "block";
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
                studyDesignService.confidenceIntervalDescriptions != null &&
                studyDesignService.confidenceIntervalDescriptions.betaFixed &&
                !studyDesignService.confidenceIntervalDescriptions.sigmaFixed
                );
            $scope.betaEstimatedSigmaEstimated = (
                studyDesignService.confidenceIntervalDescriptions != null &&
                !studyDesignService.confidenceIntervalDescriptions.betaFixed &&
                !studyDesignService.confidenceIntervalDescriptions.sigmaFixed
                );
        }

        /**
         * Toggle the confidence interval description on and off
         */
        $scope.toggleConfidenceIntervalDescription = function() {
            if ($scope.studyDesign.confidenceIntervalDescriptions != null) {
                $scope.studyDesign.confidenceIntervalDescriptions = null;
            } else {
                $scope.studyDesign.confidenceIntervalDescriptions = {};
            }
        }

        /**
         * Set the assumptions regarding estimation of beta and sigma
         */
        $scope.setAssumptions = function(betaFixed, sigmaFixed) {
             if ($scope.studyDesign.confidenceIntervalDescriptions != null) {
                 $scope.studyDesign.confidenceIntervalDescriptions.betaFixed = betaFixed;
                 $scope.studyDesign.confidenceIntervalDescriptions.sigmaFixed = sigmaFixed;
             }
        }
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
                if (method.value == 'unconditional') {
                    $scope.unconditionalChecked = true;
                } else if (method.value == 'quantile') {
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
            if (checked == true) {
                if (method == null) {
                    // add the power to the list
                    studyDesignService.powerMethodList.push({
                        idx: 0,
                        value: methodName
                    });
                }
            } else {
                if (method != null) {
                    studyDesignService.powerMethodList.splice(
                        studyDesignService.powerMethodList.indexOf(method), 1);
                }
            }
        }

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
        }

        /**
         * Add a new quantile
         */
        $scope.addQuantile = function () {
            var newQuantile = $scope.newQuantile;
            if (newQuantile != undefined) {
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


            if ($scope.hasSameCorrelation != undefined) {
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
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.XAxisOptions = [
                {label: "Total Sample Size", value: "TOTAL_SAMPLE_SIZE"},
                {label: "Variability Scale Factor", value: "VARIABILITY_SCALE_FACTOR"},
                {label: "Regression Coefficient Scale Factor", value: "REGRESSION_COEEFICIENT_SCALE_FACTOR"}
            ];
            $scope.newDataSeries = {
                idx: 0,
                label: "",
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
            if (studyDesignService.powerCurveDescriptions != null) {
                $scope.gridData = $scopstudyDesignService.powerCurveDescriptions.dataSeriesList;
            } else {
                $scope.gridData = [];
            }
            $scope.dataSeriesGridOptions = {
                data: 'gridData',
                jqueryUITheme: true,
                selectedItems: []
            };
        }

        /**
         *  Toggle the power curve on/off
         */
        $scope.togglePowerCurveDescription = function() {
            if ($scope.studyDesign.powerCurveDescriptions != null) {
                $scope.studyDesign.powerCurveDescriptions = null;
                $scope.gridData = [];
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
                $scope.gridData = $scopstudyDesignService.powerCurveDescriptions.dataSeriesList;
            }
        }

        /**
         * Add data series to the power curve description
         */
        $scope.addDataSeries = function() {
            if (studyDesignService.powerCurveDescriptions != null) {
                studyDesignService.powerCurveDescriptions.dataSeriesList.push({
                    idx: 0,
                    label: $scope.newDataSeries.label,
                    confidenceLimits: $scope.newDataSeries.confidenceLimits,
                    statisticalTestTypeEnum: $scope.newDataSeries.statisticalTestTypeEnum,
                    betaScale: $scope.newDataSeries.betaScale,
                    sigmaScale: $scope.newDataSeries.sigmaScale,
                    typeIError: $scope.newDataSeries.typeIError,
                    sampleSize: $scope.newDataSeries.sampleSize,
                    nominalPower: $scope.newDataSeries.nominalPower,
                    powerMethod: $scope.newDataSeries.powerMethod,
                    quantile: $scope.newDataSeries.quantile
                });
                $scope.gridData = studyDesignService.powerCurveDescriptions.dataSeriesList;
            }
        }

        /**
         * Delete the specified data series from the power curve
         * @param dataSeries
         */
        $scope.deleteDataSeries = function() {
            for(var i = 0; i < $scope.dataSeriesGridOptions.selectedItems.length; i++) {
                var dataSeries = $scope.dataSeriesGridOptions.selectedItems[i];
                studyDesignService.powerCurveDescriptions.dataSeriesList.splice(
                    studyDesignService.powerCurveDescriptions.dataSeriesList.indexOf(dataSeries), 1);
            }
            $scope.gridData = studyDesignService.powerCurveDescriptions.dataSeriesList;
        }
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
                for (var i=0; i < difference; i++) {
                    studyDesignService.relativeGroupSizeList.push({
                        idx:0, value:1
                    });
                }
            }

            if (studyDesignService.relativeGroupSizeList.length <  totalPermutations) {
                for (var i=0; i < totalPermutations; i++) {
                    studyDesignService.relativeGroupSizeList.push({
                        idx:0, value:1
                    });
                }
            }



            var columnList = [];

            var numRepetitions = totalPermutations;
            for (var i=0; i < studyDesignService.betweenParticipantFactorList.length; i++) {
                columnList = [];
                var len = studyDesignService.betweenParticipantFactorList[i].categoryList.length;
                if (len >= 2 ) {
                    numRepetitions /= len;
                    for (var perm = 0; perm < totalPermutations;) {
                        for (var cat=0; cat < len; cat++) {
                            var categoryName = studyDesignService.betweenParticipantFactorList[i].
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
            for (var i = 0; i < lenList; i++) {
                $scope.groupsList.push(i);
            }
        }

    })
    /**
     * controller for the design essence screen in matrix mode
     */
    .controller('designEssenceController', function($scope, glimmpseConstants, studyDesignService) {
        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.data = [
                [1,2,1],
                [4,5,6],
                [7,8,9]
            ];

            window.alert("design controller");
        };
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
            $scope.gridData;

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

            if (powerService.cachedResults == undefined && powerService.cachedError == undefined) {

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

        };

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
        }

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
        }

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.powerService = powerService;
            $scope.noPlotRequested = (studyDesignService.powerCurveDescriptions == null ||
                                        studyDesignService.powerCurveDescriptions.dataSeriesList.length <= 0);
            $scope.showCurve = (!$scope.noPlotRequested &&
                                powerService.cachedResults != undefined &&
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
                        borderWidth: 0
                    },
                    legend: {
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
            }

            if ($scope.showCurve == true) {
                // set the title
                if (studyDesignService.powerCurveDescriptions.title != null &&
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

                            if (seriesDescription.confidenceLimits == true) {
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

            if (powerService.cachedMatrixHtml == undefined && powerService.cachedMatrixError == undefined) {

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
        };

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