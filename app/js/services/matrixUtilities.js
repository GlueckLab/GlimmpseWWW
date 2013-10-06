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
 * Global results object
 * Retrieved via JSON from the Power Web Service
 */


glimmpseApp.factory('matrixUtilities',function($http, $q, glimmpseConstants){
    var matrixUtilitiesInstance = {};

    /**
     * Resize the rows of a matrix
     * @param matrix
     * @param oldRows
     * @param newRows
     */
    matrixUtilitiesInstance.resizeRows = function(matrix, oldRows, newRows) {
        if (newRows > oldRows) {
            for(var r = oldRows; r < newRows; r++) {
                var newRow = [];
                for(var c = 0; c < matrix.columns; c++) {
                    newRow.push(0);
                }
                matrix.data.data.push(newRow);
            }
        } else if (newRows < oldRows) {
            matrix.data.data.splice(newRows, oldRows - newRows);
        }
    }

    /**
     * Resize the columns of a matrix
     * @param matrix
     * @param oldColumns
     * @param newColumns
     */
    matrixUtilitiesInstance.resizeColumns = function(matrix, oldColumns, newColumns) {
        if (newColumns > oldColumns) {
            for(var r = 0; r < matrix.rows; r++) {
                for(var c = oldColumns; c < newColumns; c++) {
                    matrix.data.data[r].push(0);
                }
            }

        } else if (newColumns < oldColumns) {
            for(var r = 0; r < matrix.rows; r++) {
                matrix.data.data[r].splice(newColumns, oldColumns-newColumns);
            }
        }
    }

})