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


glimmpseApp.factory('matrixUtilities',function(){
    var matrixUtilitiesInstance = {};

    /**
     * Resize the rows of a matrix
     * @param matrix
     * @param oldRows
     * @param newRows
     */
    matrixUtilitiesInstance.resizeRows = function(matrix, oldRows, newRows,
                                                  defaultOffDiagonal, defaultDiagonal) {
        matrix.rows = newRows;
        if (newRows > oldRows) {
            for(var r = oldRows; r < newRows; r++) {
                var newRow = [];
                for(var c = 0; c < matrix.columns; c++) {
                    newRow.push((r == c ? defaultDiagonal : defaultOffDiagonal));
                }
                matrix.data.data.push(newRow);
            }
        } else if (newRows < oldRows) {
            matrix.data.data.splice(newRows, oldRows - newRows);
        }
    };

    /**
     * Resize the columns of a matrix
     * @param matrix
     * @param oldColumns
     * @param newColumns
     */
    matrixUtilitiesInstance.resizeColumns = function(matrix, oldColumns, newColumns,
                                                     defaultOffDiagonal, defaultDiagonal) {
        matrix.columns = newColumns;
        if (newColumns > oldColumns) {
            for(var r = 0; r < matrix.rows; r++) {
                for(var c = oldColumns; c < newColumns; c++) {
                    matrix.data.data[r].push((r == c ? defaultDiagonal : defaultOffDiagonal));
                }
            }

        } else if (newColumns < oldColumns) {
            for(var rr = 0; rr < matrix.rows; rr++) {
                matrix.data.data[rr].splice(newColumns, oldColumns-newColumns);
            }
        }
    };

    /**
     * Create a named identity matrix of the specified size
     * @param name
     * @param size
     */
    matrixUtilitiesInstance.createNamedIdentityMatrix = function(name, size) {
        // create an empty matrix
        var matrix = {
            idx: 0,
            rows: size,
            columns: size,
            name: name,
            data: {
                data: []
            }
        };
        // fill in the data
        for(var r = 0; r < size; r++) {
            var colData = [];
            for(var c = 0; c < size; c++) {
                colData.push((r == c ? 1 : 0));
            }
            matrix.data.data.push(colData);
        }

        return matrix;
    };

    /**
     * Create a named matrix with the specified rows and columns filled
     * with the given value
     *
     * @param name
     * @param rows
     * @param columns
     * @param value
     * @returns {{idx: number, name: *, data: {data: Array}}}
     */
    matrixUtilitiesInstance.createNamedFilledMatrix = function(name, rows, columns, value) {
        // create an empty matrix
        var matrix = {
            idx: 0,
            name: name,
            rows: rows,
            columns: columns,
            data: {
                data: []
            }
        };
        // fill in the data
        for(var r = 0; r < rows; r++) {
            var colData = [];
            for(var c = 0; c < columns; c++) {
                colData.push(value);
            }
            matrix.data.data.push(colData);
        }

        return matrix;
    };

    /**********
     * !THESE FUNCTIONS SHOULD BE DEPRECATED IN FUTURE RELEASES!
     *
     * At present, the domain layer represents matrices (either covariance
     * or other) with two different naming conventions.
     *
     * For regular matrices, data appears in the "data" field
     * For covariance matrices, data appears in the "blob" field
     *
     * So, yup, we suck, and we'll fix this in a future release when
     * we tidy up the domain layer.
     *
     * But for now, we provide these convenience functions to resize
     * covariance blobs.
     ***********/

    /**
     * Resize the rows of a covariance object
     * @param matrix
     * @param oldRows
     * @param newRows
     */
    matrixUtilitiesInstance.resizeCovarianceRows = function(covariance, oldRows, newRows,
                                                  defaultOffDiagonal, defaultDiagonal) {
        covariance.rows = newRows;
        if (newRows > oldRows) {
            for(var r = oldRows; r < newRows; r++) {
                var newRow = [];
                for(var c = 0; c < covariance.columns; c++) {
                    newRow.push((r == c ? defaultDiagonal : defaultOffDiagonal));
                }
                covariance.blob.data.push(newRow);
            }
        } else if (newRows < oldRows) {
            covariance.blob.data.splice(newRows, oldRows - newRows);
        }
    };

    /**
     * Resize the columns of a matrix
     * @param matrix
     * @param oldColumns
     * @param newColumns
     */
    matrixUtilitiesInstance.resizeCovarianceColumns = function(covariance, oldColumns, newColumns,
                                                     defaultOffDiagonal, defaultDiagonal) {
        covariance.columns = newColumns;
        if (newColumns > oldColumns) {
            for(var r = 0; r < covariance.rows; r++) {
                for(var c = oldColumns; c < newColumns; c++) {
                    covariance.blob.data[r].push((r == c ? defaultDiagonal : defaultOffDiagonal));
                }
            }

        } else if (newColumns < oldColumns) {
            for(var rr = 0; rr < covariance.rows; rr++) {
                covariance.blob.data[rr].splice(newColumns, oldColumns-newColumns);
            }
        }
    };

    return matrixUtilitiesInstance;
});