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
glimmpseApp.controller('stateController', function($scope, $location, studyDesignService) {

    /**
     * Initialize the controller
     */
    init();
    function init() {
        $scope.studyDesign = studyDesignService;
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
        var nominalPowerState = $scope.getStateNominalPower();
        var relativeGroupSizeState = $scope.getStateRelativeGroupSize();
        var smallestGroupSize = $scope.getStateSmallestGroupSize();
        var covariateVariabilityState = $scope.getStateCovariateVariability();
        var powerMethodState = $scope.getStatePowerMethod();
        return (
                ($scope.getStateSolvingFor() == 'complete') &&
                (nominalPowerState == 'complete' || nominalPowerState == 'disabled') &&
                ($scope.getStateTypeIError() == 'complete') &&
                ($scope.getStatePredictors() == 'complete') &&
                ($scope.getStateCovariate() == 'complete') &&
                ($scope.getStateClustering() == 'complete') &&
                (relativeGroupSizeState == 'complete' || relativeGroupSizeState == 'disabled') &&
                (smallestGroupSize == 'complete' || smallestGroupSize == 'disabled') &&
                ($scope.getStateResponseVariables() == 'complete') &&
                ($scope.getStateRepeatedMeasures() == 'complete') &&
                ($scope.getStateHypothesis() == 'complete') &&
                ($scope.getStateMeans() == 'complete') &&
                ($scope.getStateScaleFactorsForMeans() == 'complete') &&
                (covariateVariabilityState == 'complete' || covariateVariabilityState == 'disabled') &&
                ($scope.getStateCovariateVariability() == 'complete') &&
                ($scope.getStateScaleFactorsForVariability() == 'complete') &&
                ($scope.getStateStatisticalTest() == 'complete') &&
                (powerMethodState == 'complete' || powerMethodState == 'disabled') &&
                ($scope.getStateConfidenceIntervals() == 'complete') &&
                ($scope.getStatePowerCurve() == 'complete')
        );
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
           $scope.studyDesign.solutionTypeEnum == 'power') {
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
        var state = 'complete';
        if ($scope.studyDesign.betweenParticipantFactorList > 0) {
            for(factor in $scope.studyDesign.betweenParticipantFactorList) {
                if (factor.categoryList.length < 2) {
                    state = 'incomplete';
                    break;
                }
            }
        }
        return state;
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
        if ($scope.studyDesign.clusteringTree.length <= 0
            ){
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
        if ($scope.studyDesign.solutionTypeEnum == 'samplesize') {
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
        // TODO: remove when Aarti is done with this view
        return 'complete';
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

})


/**
 * Controller to get/set what the user is solving for
 */
.controller('solutionTypeController', function($scope, studyDesignService) {

    init();
    function init() {
        $scope.studyDesign = studyDesignService;
    }

})


/**
 * Controller managing the nominal power list
 */
.controller('nominalPowerController', function($scope, studyDesignService) {

    init();
    function init() {
        $scope.studyDesign = studyDesignService;
        $scope.newNominalPower = undefined;
        $scope.editedNominalPower = undefined;
    }
    /**
     * Add a new nominal power value
     */
    $scope.addNominalPower = function () {
        var newPower = $scope.newNominalPower;
        if (newPower != undefined) {
            // add the power to the list
            studyDesignService.nominalPowerList.push({
                id: studyDesignService.nominalPowerList.length,
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
.controller('typeIErrorRateController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newTypeIErrorRate = undefined;
            $scope.editedTypeIErrorRate = undefined;
        }
        /**
         * Add a new type I error rate
         */
        $scope.addTypeIErrorRate = function () {
            var newAlpha = $scope.newTypeIErrorRate;
            if (newAlpha != undefined) {
            // add the power to the list
                studyDesignService.alphaList.push({
                    id: studyDesignService.alphaList.length,
                    value: newAlpha
                });
            }
            // reset the new power to null
            $scope.newTypeIErrorRate = undefined;
        };

        /**
         * Edit an existing type I error rate
         */
        $scope.editTypeIErrorRate = function(alpha) {
            $scope.editedTypeIErrorRate = alpha;
        };


        /**
         * Called when editing is complete
         * @param alpha
         */
        $scope.doneEditing = function (alpha) {
            $scope.editedTypeIErrorRate = null;
            alpha.value = alpha.value.trim();

            if (!alpha.value) {
                $scope.deleteTypeIErrorRate(alpha);
            }
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
    .controller('scaleFactorForVarianceController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newScaleFactorForVariance = undefined;
            $scope.editedScaleFactorForVariance= undefined;
        }
        /**
         * Add a new scale factor for covariance
         */
        $scope.addScaleFactorForVariance = function () {
            var newScale = $scope.newScaleFactorForVariance;
            if (newScale != undefined) {
                // add the scale factor to the list
                studyDesignService.sigmaScaleList.push({
                    id: studyDesignService.sigmaScaleList.length,
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
    .controller('scaleFactorForMeansController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newScaleFactorForMeans = undefined;
            $scope.editedScaleFactorForMeans= undefined;
        }
        /**
         * Add a new scale factor for means
         */
        $scope.addScaleFactorForMeans = function () {
            var newScale = $scope.newScaleFactorForMeans;
            if (newScale != undefined) {
                // add the scale factor to the list
                studyDesignService.betaScaleList.push({
                    id: studyDesignService.betaScaleList.length,
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
    .controller('sampleSizeController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newSampleSize = undefined;
            $scope.editedSampleSize = undefined;
        }
        /**
         * Add a new sample size
         */
        $scope.addSampleSize = function () {
            var newN = $scope.newSampleSize;
            if (newN != undefined) {
                // add the power to the list
                studyDesignService.sampleSizeList.push({
                    id: studyDesignService.sampleSizeList.length,
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
    .controller('responseController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newResponse = '';
            $scope.editedResponse = '';
        }
        /**
         * Add a new response variable
         */
        $scope.addResponse = function () {
            var newOutcome = $scope.newResponse;
            if (newOutcome.length > 0) {
                // add the response to the list
                studyDesignService.responseList.push({
                    id: studyDesignService.responseList.length,
                    value: newOutcome
                });
            }
            // reset the new response to null
            $scope.newResponse = '';
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
        };
    })

/**
 * Controller managing the predictors
 */
    .controller('predictorsController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.newPredictorName = undefined;
            $scope.editedPredictor = undefined;
            $scope.newCategoryName = undefined;
        }

        /**
         * Add a new predictor name
         */
        $scope.addPredictors = function () {
            var newPredictor = $scope.newPredictorName;
            if (newPredictor != undefined) {
                // add the predictor to the list
                studyDesignService.betweenParticipantFactorList.push({
                    id: studyDesignService.betweenParticipantFactorList.length,
                    value: newPredictor
                });
            }
            // reset the new sample size to null
            $scope.newPredictorName = undefined;
        };

        /**
         * Edit an existing predictor variable
         */
        $scope.editPredictor = function(factor) {
            $scope.editedPredictor = factor;
        };


        /**
         * Called when editing is complete
         * @param factor
         */
        $scope.doneEditing = function (factor) {
            $scope.editedPredictor = null;
            factor.value = factor.value.trim();

            if (!factor.value) {
                $scope.deletePredictor(factor);
            }
        };

        /**
         * Delete an existing predictor variable
         */
        $scope.deletePredictor = function(factor) {
            studyDesignService.betweenParticipantFactorList.splice(
                studyDesignService.betweenParticipantFactorList.indexOf(factor), 1);
        };

        /**
         * Add a new category name
         */
        $scope.addCategories = function (factor) {
            window.alert("in adding category" + $scope.newCategoryName);
            var newCategory = $scope.newCategoryName;
            if (newCategory != undefined) {
                // add the category to the list
                factor.categoryList.push({
                    id: factor.categoryList.length,
                    value: newCategory
                });
            }
            // reset the new sample size to null
            $scope.newCategoryName = undefined;
        };
    })

/**
 * Controller managing the covariates
 */
    .controller('covariatesController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
        }
    })


/**
 * Controller managing the statistical tests
 */
    .controller('statisticalTestsController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.tests= {hotelling: false, pillai: false, wilks: false, box: false, geisser: false, huynh: false, uncorrected: false};
        }

        /**
         * Add the statistical test
         */
        $scope.addStatisticalTest = function () {

            if (newTest != undefined) {
                // add the statistical test to the list
                studyDesignService.statisticalTestList.push({
                    id: studyDesignService.statisticalTestList.length,
                    value: newTest
                });
            }

        }

    })

/**
 * Controller managing the clusters
 */
    .controller('clusteringController', function($scope, studyDesignService) {

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
         *
         */
        $scope.removeCluster = function() {

            studyDesignService.clusteringTree.pop();
        };

        $scope.removeClustering = function() {
            studyDesignService.clusteringTree = [];
        };
    })

/**
 * Controller managing repeated measures
 */
    .controller('repeatedMeasuresController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
        }

        $scope.addMeasure = function() {

            if (studyDesignService.repeatedMeasuresTree.length < 3) {
                studyDesignService.repeatedMeasuresTree.push({
                    idx: studyDesignService.repeatedMeasuresTree.length,
                    node: 0, parent: 0
                })
            }
        };

        $scope.removeMeasure = function() {
            studyDesignService.repeatedMeasuresTree.pop();
        };

        $scope.removeMeasuring = function() {
            studyDesignService.repeatedMeasuresTree = [];
        };

    })

/**
 * Controller managing the covariates
 */
    .controller('meansViewController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
        }

        $scope.addMeans = function() {
             //window.alert("wohoo!");

        };


    })

/**
 * Controller managing the covariates
 */
    .controller('hypothesesController', function($scope, studyDesignService) {

        init();
        function init() {
            $scope.studyDesign = studyDesignService;
            $scope.hypothesisOfInterest = undefined;
        }

        $scope.addPredictorOfInterest = function() {
            window.alert("In here");
        };
    })

    /*
    * Controller for the confidence intervals view
     */
    .controller('confidenceIntervalController', function($scope, studyDesignService) {
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
    .controller('powerMethodController', function($scope, studyDesignService) {
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
                    id: studyDesignService.quantileList.length,
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