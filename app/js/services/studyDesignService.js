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
glimmpseApp.factory('studyDesignService', function() {
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
    studyDesignInstance.solutionTypeEnum = 'power';

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
    studyDesignInstance.hypothesis = [];

    /** The covariance. */
    studyDesignInstance.covariance = [];

    /** The matrix set. */
    studyDesignInstance.matrixSet = [];

    return studyDesignInstance;

});

