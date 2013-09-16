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
 * Model containing predefined values which are
 * shared throughout the application
 */
glimmpseApp.factory('constants', function() {
    var constantsInstance = {};

    // debugging flag
    constantsInstance.debug = true;

    /*** Enum names ***/

    // solution types
    constantsInstance.solutionTypeEnum.power = "POWER";
    constantsInstance.solutionTypeEnum.samplesize = "SAMPLE_SIZE";


    return constantsInstance;
});