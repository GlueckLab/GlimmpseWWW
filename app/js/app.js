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
var glimmpseApp = angular.module('glimmpse', [])
    .config(['$routeProvider', function($routeProvider) {
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
            {templateUrl: 'partials/relativeGroupSizesView.html', controller: 'StudyDesignController' }
        )
            .when('/smallestGroupSize',
            {templateUrl: 'partials/smallestGroupSizeView.html', controller: 'sampleSizeController' }
        )
            .when('/responseVariables',
            {templateUrl: 'partials/responseVariablesView.html', controller: 'responseController' }
        )
            .when('/repeatedMeasures',
            {templateUrl: 'partials/repeatedMeasuresView.html', controller: 'StudyDesignController' }
        )
            .when('/hypothesis',
            {templateUrl: 'partials/hypothesisView.html', controller: 'StudyDesignController' }
        )
            .when('/means',
            {templateUrl: 'partials/meansView.html', controller: 'StudyDesignController' }
        )
            .when('/meansScale',
            {templateUrl: 'partials/scaleFactorsForMeansView.html', controller: 'scaleFactorForMeansController' }
        )
            .when('/variabilityWithin',
            {templateUrl: 'partials/variabilityView.html', controller: 'StudyDesignController' }
        )
            .when('/variabilityCovariate',
            {templateUrl: 'partials/variabilityView.html', controller: 'StudyDesignController' }
        )
            .when('/variabilityScale',
            {templateUrl: 'partials/scaleFactorsForVariabilityView.html', controller: 'scaleFactorForVarianceController' }
        )
            .when('/test',
            {templateUrl: 'partials/statisticalTestView.html', controller: 'StudyDesignController' }
        )
            .when('/powerMethod',
            {templateUrl: 'partials/powerMethodView.html', controller: 'powerMethodController' }
        )
            .when('/confidenceIntervals',
            {templateUrl: 'partials/confidenceIntervalsView.html', controller: 'confidenceIntervalController' }
        )
            .when('/plotOptions',
            {templateUrl: 'partials/plotOptionsView.html', controller: 'StudyDesignController' }

        )
            .otherwise({ redirectTo: '/' });
    }]);



