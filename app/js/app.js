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


'use strict';

/*
* Main glimmpse application module
 */
var glimmpseApp = angular.module('glimmpse', ['ui.bootstrap','ngGrid', 'highcharts-ng'])
    .constant('glimmpseConstants',{
        // debugging flag
        debug: true,

        /*** URIs for web services ***/
        uriPower: "/power/power",
        uriSampleSize: "/power/samplesize",
        uriCIWidth: "/power/ciwidth",
        uriMatrices: "/power/matrix/html",
        uriUpload: "/file/upload",
        uriSave: "/file/save",

        /*** Enum names ***/

        // view states
        stateDisabled: "disabled",
        stateBlocked: "blocked",
        stateIncomplete: "incomplete",
        stateComplete: "complete",

        // solution types
        solutionTypePower: "POWER",
        solutionTypeSampleSize: "SAMPLE_SIZE",

        // view types
        viewTypeStudyDesign: "studyDesign",
        viewTypeResults: "results",

        // input mode types
        modeGuided: "GUIDED_MODE",
        modeMatrix: "MATRIX_MODE",

        // statistical tests
        testHotellingLawleyTrace: "HLT",
        testWilksLambda: "WL",
        testPillaiBartlettTrace: "PBT",
        testUnirep: "UNIREP",
        testUnirepBox: "UNIREPBOX",
        testUnirepGG: "UNIREPGG",
        testUnirepHF: "UNIREPHF",

        // matrix names
        matrixXEssence: "",

        // plot axis names
        xAxisTotalSampleSize: "TOTAL_SAMPLE_SIZE",
        xAxisBetaScale: "VARIABILITY SCALE FACTOR",
        xAxisSigmaScale: "REGRESSION_COEEFICIENT_SCALE_FACTOR"

    })
    .config(['$routeProvider', function($routeProvider, studyDesignService, powerService) {
        /*
        * Main route provider for the study design tab
         */
        $routeProvider
            .when('/',
            {templateUrl: 'partials/home.html'}
        )
            .when('/solvingFor',
            {templateUrl: 'partials/solvingForView.html', controller: 'solutionTypeController' }
        )
            .when('/nominalPower',
            {templateUrl: 'partials/nominalPowerView.html', controller: 'nominalPowerController' }
        )
            .when('/typeIError',
            {templateUrl: 'partials/typeIErrorView.html', controller: 'typeIErrorRateController' }
        )
            .when('/predictors',
            {templateUrl: 'partials/predictorsView.html', controller: 'predictorsController' }
        )
            .when('/covariates',
            {templateUrl: 'partials/covariatesView.html', controller: 'covariatesController' }
        )
            .when('/isu',
            {templateUrl: 'partials/independentSamplingUnitView.html', controller: 'clusteringController' }
        )
            .when('/relativeGroupSize',
            {templateUrl: 'partials/relativeGroupSizesView.html', controller: 'relativeGroupSizeController' }
        )
            .when('/smallestGroupSize',
            {templateUrl: 'partials/smallestGroupSizeView.html', controller: 'sampleSizeController' }
        )
            .when('/responseVariables',
            {templateUrl: 'partials/responseVariablesView.html', controller: 'responseController' }
        )
            .when('/repeatedMeasures',
            {templateUrl: 'partials/repeatedMeasuresView.html', controller: 'repeatedMeasuresController' }
        )
            .when('/hypothesis',
            {templateUrl: 'partials/hypothesisView.html', controller: 'hypothesesController' }
        )
            .when('/means',
            {templateUrl: 'partials/meansView.html', controller: 'meansViewController' }
        )
            .when('/meansScale',
            {templateUrl: 'partials/scaleFactorsForMeansView.html', controller: 'scaleFactorForMeansController' }
        )
            .when('/variabilityWithin',
            {templateUrl: 'partials/variabilityView.html', controller: 'variabilityViewController' }
        )
            .when('/variabilityCovariate',
            {templateUrl: 'partials/variabilityCovariateView.html', controller: 'variabilityCovariateViewController' }
        )
            .when('/variabilityScale',
            {templateUrl: 'partials/scaleFactorsForVariabilityView.html', controller: 'scaleFactorForVarianceController' }
        )
            .when('/test',
            {templateUrl: 'partials/statisticalTestView.html', controller: 'statisticalTestsController' }
        )
            .when('/powerMethod',
            {templateUrl: 'partials/powerMethodView.html', controller: 'powerMethodController' }
        )
            .when('/confidenceIntervals',
            {templateUrl: 'partials/confidenceIntervalsView.html', controller: 'confidenceIntervalController' }
        )
            .when('/plotOptions',
            {templateUrl: 'partials/plotOptionsView.html', controller: 'plotOptionsController' }

        )
            // matrix mode screens
            .when('/designEssence',
            {templateUrl: 'partials/designEssenceView.html', controller: 'designEssenceController' }

        )
            // results screens
            .when('/results/report',
            {templateUrl: 'partials/resultsReportView.html', controller: 'resultsReportController' }

        )
            .when('/results/plot',
            {templateUrl: 'partials/resultsPlotView.html', controller: 'resultsPlotController' }

        )
            .when('/results/matrices',
            {templateUrl: 'partials/resultsMatrixView.html', controller: 'resultsMatrixController' }

        )
            .otherwise({ redirectTo: '/' });
    }]);



