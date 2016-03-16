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


(function () {
    "use strict";
    // this function is strict...
}());

/*
* Main glimmpse application module
 */
var glimmpseApp = angular.module('glimmpse', ['ui.bootstrap','ngGrid', 'highcharts-ng'])
    .constant('glimmpseConstants',{
        // debugging flag
        debug: false,

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

        // types of repeated measures
        repeatedMeasuresTypeNumeric: "NUMERICAL",
        repeatedMeasuresTypeOrdinal: "ORDINAL",
        repeatedMeasuresTypeCategorical: "CATEGORICAL",

        // hypothesis types
        hypothesisGrandMean: 'GRAND_MEAN',
        hypothesisMainEffect: 'MAIN_EFFECT',
        hypothesisManova: 'MANOVA',
        hypothesisTrend: 'TREND',
        hypothesisInteraction: 'INTERACTION',

        // trend types
        trendNone: 'NONE',
        trendChangeFromBaseline: 'CHANGE_FROM_BASELINE',
        trendAllNonconstantPolynomial: 'ALL_NONCONSTANT_POLYNOMIAL',
        trendLinear: 'LINEAR',
        trendQuadratic: 'QUADRATIC',
        trendCubic: 'CUBIC',

        // statistical tests
        testHotellingLawleyTrace: "HLT",
        testWilksLambda: "WL",
        testPillaiBartlettTrace: "PBT",
        testUnirep: "UNIREP",
        testUnirepBox: "UNIREPBOX",
        testUnirepGG: "UNIREPGG",
        testUnirepHF: "UNIREPHF",

        // power methods
        powerMethodUnconditional: "UNCONDITIONAL",
        powerMethodQuantile: "QUANTILE",

        // matrix names
        matrixXEssence: "design",
        matrixBeta: "beta",
        matrixBetaRandom: "betaRandom",
        matrixBetweenContrast: "betweenSubjectContrast",
        matrixBetweenContrastRandom: "betweenSubjectContrastRandom",
        matrixWithinContrast: "withinSubjectContrast",
        matrixSigmaE: "sigmaError",
        matrixSigmaY: "sigmaOutcome",
        matrixSigmaG: "sigmaGaussianRandom",
        matrixSigmaYG: "sigmaOutcomeGaussianRandom",
        matrixThetaNull: "thetaNull",

        // dimension names derived from linear model theory.
        // ensures that default matrix dimensions conform properly
        matrixDefaultN: 2,
        matrixDefaultQ: 2,
        matrixDefaultP: 1,
        matrixDefaultA: 1,
        matrixDefaultB: 1,

        // special label for covariance of response variables
        covarianceResponses: "__RESPONSE_COVARIANCE__",
        covarianceTypeUnstructured: "UNSTRUCTURED_COVARIANCE",
        correlationTypeUnstructured: "UNSTRUCTURED_CORRELATION",
        correlationTypeLear: "LEAR_CORRELATION",

        // plot axis names
        xAxisTotalSampleSize: "TOTAL_SAMPLE_SIZE",
        xAxisSigmaScale: "VARIABILITY_SCALE_FACTOR",
        xAxisBetaScale: "REGRESSION_COEEFICIENT_SCALE_FACTOR",
        xAxisDesiredPower: "DESIRED_POWER",

        // platform
        platform: /android/i.test(window.navigator.userAgent) ? 'android' : 'other'
    })
    .config(['$routeProvider', function($routeProvider, studyDesignService, powerService, dropboxService) {
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
            .when('/smallestGroupSize',
            {templateUrl: 'partials/smallestGroupSizeView.html', controller: 'sampleSizeController' }
        )
            .when('/groupSizes',
            {templateUrl: 'partials/groupSizesView.html', controller: 'groupSizesController' }
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
            {templateUrl: 'partials/variabilityWithinView.html', controller: 'variabilityWithinController' }
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
            .when('/beta',
            {templateUrl: 'partials/betaView.html', controller: 'betaController' }

        )
            .when('/betweenContrast',
            {templateUrl: 'partials/betweenContrastView.html', controller: 'betweenContrastController' }

        )
            .when('/withinContrast',
            {templateUrl: 'partials/withinContrastView.html', controller: 'withinContrastController' }

        )
            .when('/thetaNull',
            {templateUrl: 'partials/thetaNullView.html', controller: 'thetaNullController' }

        )
            .when('/sigmaE',
            {templateUrl: 'partials/sigmaEView.html', controller: 'sigmaEController' }

        )
            .when('/sigmaY',
            {templateUrl: 'partials/sigmaYView.html', controller: 'sigmaYController' }

        )
            .when('/sigmaG',
            {templateUrl: 'partials/sigmaGView.html', controller: 'sigmaGController' }

        )
            .when('/sigmaYG',
            {templateUrl: 'partials/sigmaYGView.html', controller: 'sigmaYGController' }

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
            .when('/modelIntro',
            {templateUrl: 'partials/modelIntroView.html'}

        )
            .when('/hypothesisIntro',
            {templateUrl: 'partials/hypothesisIntroView.html'}

        )
            .when('/meansIntro',
            {templateUrl: 'partials/meansIntroView.html'}

        )
            .when('/variabilityIntro',
            {templateUrl: 'partials/variabilityIntroView.html'}

        )
            .when('/optionsIntro',
            {templateUrl: 'partials/optionsIntroView.html'}

        )
            .when('/matrixDesignIntro',
            {templateUrl: 'partials/matrixDesignIntroView.html'}

        )
            .when('/matrixHypothesisIntro',
            {templateUrl: 'partials/matrixHypothesisIntroView.html'}

        )
            .when('/matrixCoefficientsIntro',
            {templateUrl: 'partials/matrixCoefficientsIntroView.html'}

        )
            .when('/matrixVariabilityIntro',
            {templateUrl: 'partials/matrixVariabilityIntroView.html'}

        )
            .otherwise({ redirectTo: '/' });
    }]);



