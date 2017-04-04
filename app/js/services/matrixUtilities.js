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


glimmpseApp.factory('matrixUtilities',function(glimmpseConstants){
    var matrixUtilitiesInstance = {};

    /**
     * Construct an array.
     *
     * @param count    The number of elements in the array.
     * @param supplier A function supplying the elements in the
     *                 array, suitable as the first argument to
     *                 Array.prototype.map.
     */
    matrixUtilitiesInstance.array = function(count, supplier) {
        return Array.apply(null, {length: count}).map(supplier);
    };

    /**
     * Check if a matrix is valid
     * @param matrix
     */
    matrixUtilitiesInstance.isValidMatrix = function(matrix, min, max) {
        if (matrix === null || matrix === undefined) {
            return false;
        }
        if (matrix.rows === null || matrix.rows === undefined || matrix.rows <= 0) {
            return false;
        }
        if (matrix.columns === null || matrix.columns === undefined || matrix.columns <= 0) {
            return false;
        }

        // make sure data matches row/columns specified
        if (matrix.rows != matrix.data.data.length) {
            return false;
        }
        if (matrix.columns != matrix.data.data[0].length) {
            return false;
        }
        // make sure no cells are null
        for(var r = 0; r < matrix.rows; r++) {
            for(var c = 0; c < matrix.columns; c++) {
                var cell = matrix.data.data[r][c];
                if (cell === null || cell === undefined) {
                    return false;
                }
                if (min !== undefined && cell < min) {
                    return false;
                }
                if (max !== undefined && cell > max) {
                    return false;
                }
            }
        }

        return true;

    };

    /**
     * Check if a covariance is valid
     * @param matrix
     */
    matrixUtilitiesInstance.isValidCovariance = function(covar) {
        // must be non-null
        if (covar === null || covar === undefined) {
            return false;
        }

        if (covar.type == glimmpseConstants.correlationTypeLear &&
            covar.rho === null || covar.rho === undefined ||
            covar.delta === null || covar.delta === undefined) {
            return false;
        }

        // make sure it is square
        if (covar.rows != covar.columns) {
            return false;
        }
        // make sure data matches row/columns specified
        if (covar.rows != covar.blob.data.length) {
            return false;
        }
        if (covar.rows > 0) {
            if (covar.columns != covar.blob.data[0].length) {
                return false;
            }
        }
        // make sure no cells are null and the matrix is symmetric
        for(var r = 0; r < covar.rows; r++) {
            for(var c = 0; c < r; c++) {
                var cell = covar.blob.data[r][c];
                if (cell === null || cell === undefined ||
                    (r != c && cell != covar.blob.data[c][r])) {
                    return false;
                }
            }
        }

        // make sure the standard deviations are valid
        if (covar.standardDeviationList.length != covar.rows) {
            return false;
        }
        for(var i = 0; i < covar.standardDeviationList.length; i++) {
            var stddev = covar.standardDeviationList[i];
            if (stddev === null || stddev === undefined ||
                typeof stddev.value !== 'number' || stddev.value <= 0) {
                return false;
            }
        }

        return true;

    };

    /**
     * Adjust the rows of a matrix, by inserting or deleting
     * a number of rows at an insertion point (row index).
     * Inserted rows are filled with zeros.
     *
     * @param matrix The matrix.
     * @param delta  The number of rows to insert (if positive)
     *               or delete (if negative).
     * @param locus  The insertion or deletion point.
     */
    matrixUtilitiesInstance.adjustRows = function(matrix, delta, locus) {
        if (delta === 0) {
            return;
        }

        var rows = matrix.data.data;

        matrix.rows += delta;
        if (delta > 0) {
            var zeros =
                matrixUtilitiesInstance.array(
                    matrix.columns,
                    function(e, i) {return 0;}
                );

            var spliceArguments =
                matrixUtilitiesInstance.array(
                    2 + delta,
                    function(e, i) {return i === 0 ? locus : zeros.slice();}
                );

//          rows.splice(locus, 0, [0, 0, ..., 0], ..., [0, 0, ..., 0]);
            Array.prototype.splice.apply(rows, spliceArguments);
        } else {
            rows.splice(locus, - delta);
        }
    };

    /**
     * Resize the rows of a matrix
     * @param matrix
     * @param newRows
     */
    matrixUtilitiesInstance.resizeRows = function(matrix, newRows,
                                                  defaultOffDiagonal, defaultDiagonal) {
        if (newRows === undefined) {
            return;
        }

        var oldRows = matrix.data.data.length;
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
     * Adjust the columns of a matrix, by inserting or deleting
     * a number of columns at an insertion point (column index).
     * Inserted columns are filled with zeros.
     *
     * @param matrix The matrix.
     * @param delta  The number of columns to insert (if positive)
     *               or delete (if negative).
     * @param locus  The insertion or deletion point.
     */
    matrixUtilitiesInstance.adjustColumns = function(matrix, delta, locus) {
        if (delta === 0) {
            return;
        }

        var rows = matrix.data.data;
        var r;

        matrix.columns += delta;
        if (delta > 0) {
            var spliceArguments =
                    matrixUtilitiesInstance.array(
                        2 + delta,
                        function(e, i) {return i === 0 ? locus : 0;}
                    );

            for (r = 0; r < matrix.rows; r++) {
//              rows[r].splice(locus, 0, 0, ..., 0);
                Array.prototype.splice.apply(rows[r], spliceArguments);
            }
        } else {
            for (r = 0; r < matrix.rows; r++) {
                rows[r].splice(locus, - delta);
            }
        }
    };

    /**
     * Resize the columns of a matrix
     * @param matrix
     * @param newColumns
     */
    matrixUtilitiesInstance.resizeColumns = function(matrix, newColumns,
                                                     defaultOffDiagonal, defaultDiagonal) {
        if (newColumns === undefined) {
            return;
        }

        var oldColumns = matrix.data.data[0].length;
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
     *
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

    /**
     * Resize the standard deviation list within a covariance object
     * @param covariance
     * @param defaultValue
     */
    matrixUtilitiesInstance.resizeCovarianceStandardDeviationList = function(covariance, dimension) {
        if (covariance.standardDeviationList.length < dimension) {
            for(var i = covariance.standardDeviationList.length; i < dimension; i++) {
                covariance.standardDeviationList.push({idx: 0, value: 1});
            }
        } else if (covariance.standardDeviationList.length > dimension) {
            covariance.standardDeviationList.splice(dimension,
                covariance.standardDeviationList.length - dimension);
        }
    };

    /**
     * Wrapper function to resize a covariance matrix
     * @param covariance
     * @param oldColumns
     * @param newColumns
     * @param defaultOffDiagonal
     * @param defaultDiagonal
     */
    matrixUtilitiesInstance.resizeCovariance = function(covariance, oldSize, newSize,
        defaultOffDiagonal, defaultDiagonal) {
        matrixUtilitiesInstance.resizeCovarianceRows(covariance, oldSize, newSize,
            defaultOffDiagonal, defaultDiagonal);
        matrixUtilitiesInstance.resizeCovarianceColumns(covariance, oldSize, newSize,
            defaultOffDiagonal, defaultDiagonal);
        matrixUtilitiesInstance.resizeCovarianceStandardDeviationList(covariance, newSize);

    };

    /**
     * Create an unstructured covariance object
     * @param name
     * @param dimension
     * @returns covariance
     */
    matrixUtilitiesInstance.createCovariance = function(name, dimension) {
        // create an empty covariance object, with type unstructured correlation
        var covariance = {
            idx: 0,
            type: glimmpseConstants.covarianceTypeUnstructured,
            name: name,
            standardDeviationList:[],
            rho:-2,
            delta:-1,
            rows: dimension,
            columns: dimension,
            blob: {
                data:[]
            }
        };

        // fill in the standard deviation list
        for(var i = 0; i < dimension; i++) {
            covariance.standardDeviationList.push({idx: 0, value: 1});
        }

        // fill in the data
        for(var r = 0; r < dimension; r++) {
            var colData = [];
            for(var c = 0; c < dimension; c++) {
                colData.push((r == c ? 1 : 0));
            }
            covariance.blob.data.push(colData);
        }

        return covariance;
    };

    /**
     * Create an unstructured correlation object
     * @param name
     * @param dimension
     * @returns covariance
     */
    matrixUtilitiesInstance.createUnstructuredCorrelation = function(name, dimension) {
        // create an empty covariance object, with type unstructured correlation
        var covariance = {
            idx: 0,
            type: glimmpseConstants.correlationTypeUnstructured,
            name: name,
            standardDeviationList:[],
            rho:-2,
            delta:-1,
            rows: dimension,
            columns: dimension,
            blob: {
                data:[]
            }
        };

        // fill in the standard deviation list
        for(var i = 0; i < dimension; i++) {
            covariance.standardDeviationList.push({idx: 0, value: 1});
        }

        // fill in the data
        for(var r = 0; r < dimension; r++) {
            var colData = [];
            for(var c = 0; c < dimension; c++) {
                colData.push((r == c ? 1 : 0));
            }
            covariance.blob.data.push(colData);
        }

        return covariance;
    };

    /**
     * Create a LEAR correlation object
     * @param name
     * @param dimension
     * @returns covariance
     */
    matrixUtilitiesInstance.createLEARCorrelation = function(name, dimension) {
        // create an empty covariance object, with type LEAR correlation
        var covariance = {
            idx: 0,
            type: glimmpseConstants.correlationTypeLear,
            name: name,
            standardDeviationList:[],
            rho:0.1,
            delta:0,
            rows: dimension,
            columns: dimension,
            blob: {
                data:[]
            }
        };

        // fill in the standard deviation list
        for(var i = 0; i < dimension; i++) {
            covariance.standardDeviationList.push({idx: 0, value: 1});
        }

        // fill in the data
        for(var r = 0; r < dimension; r++) {
            var colData = [];
            for(var c = 0; c < dimension; c++) {
                colData.push((r == c ? 1 : 0.1));
            }
            covariance.blob.data.push(colData);
        }

        return covariance;
    };

    return matrixUtilitiesInstance;
});
