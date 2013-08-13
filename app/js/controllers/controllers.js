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

/* Controllers defined in index.html for the moment.  Will move here soon */

/**
 * Controller to get/set what the user is solving for
 */
glimmpseApp.controller('solutionTypeController', function($scope, studyDesignService) {

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

            var newCluster = {value:'clusterName', nOfObs:'1', corr:'0.1'};
            if (newCluster.value != '' && studyDesignService.clusteringTree.length < 1) {

                studyDesignService.clusteringTree.push({
                id: studyDesignService.clusteringTree.length,
                value: newCluster
                })
            }
        };

        $scope.removeCluster = function(clusterToRemove) {
            var index = studyDesignService.clusteringTree.indexOf(clusterToRemove);
            studyDesignService.clusteringTree.splice(index, 1);

        };

        $scope.addSubgroup = function(cluster) {
            var newCluster = {value:'clusterName', nOfObs:'1', corr:'0.1'};
            cluster.list= [];
            cluster.list.push({
                id: cluster.list.length,
                value: newCluster
            })
        };

        $scope.removeSubgroup = function(cluster, subgroupToRemove) {
            var index = cluster.list.indexOf(subgroupToRemove);
            cluster.list.splice(index, 1);
        };

        $scope.addSubSubgroup = function(subgroup) {

            var newCluster = {value:'clusterName', nOfObs:'1', corr:'0.1'};
            subgroup.list= [];
            subgroup.list.push({
                id: subgroup.list.length,
                value: newCluster
            })
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

            var newMeasure = {units:'measureName', type:'Numeric', nOfMeasurements:'2'};
            if (newMeasure.units != '' && studyDesignService.repeatedMeasuresTree.length < 1) {
                studyDesignService.repeatedMeasuresTree.push({
                    id: studyDesignService.repeatedMeasuresTree.length,
                    value: newMeasure
                })
            }
        };

        $scope.removeMeasure = function(measureToRemove) {
            var index = studyDesignService.repeatedMeasuresTree.indexOf(measureToRemove);
            studyDesignService.repeatedMeasuresTree.splice(index, 1);

        };

        $scope.addSublevel = function(measure) {
            var newMeasure = {units:'measureName', type:'Numeric', nOfMeasurements:'2'};
            measure.list= [];
            measure.list.push({
                id: measure.list.length,
                value: newMeasure
            })
        };

        $scope.removeSublevel = function(measure, sublevelToRemove) {
            var index = measure.list.indexOf(sublevelToRemove);
            measure.list.splice(index, 1);
        };

        $scope.addSubSublevel = function(sublevel) {

            var newMeasure = {units:'measureName', type:'Numeric', nOfMeasurements:'2'};
            sublevel.list= [];
            sublevel.list.push({
                id: sublevel.list.length,
                value: newMeasure
            })
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