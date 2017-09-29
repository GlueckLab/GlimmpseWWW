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
 * Utility functions for matrix objects and variability objects.
 *
 * <p>
 * For historical reasons, much of the code refers to variability
 * objects as "covariance objects" or "covariance matrices". This
 * nomenclature is unfortunate, since variability objects may
 * contain either covariance data or correlation data. Over time,
 * we may replace these older terms.
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

        if (covar.type == glimmpseConstants.variabilityTypeLearCorrelation &&
            (covar.rho === null || covar.rho === undefined ||
            covar.delta === null || covar.delta === undefined ||
            covar.scale === null || covar.scale === undefined)) {
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
     * Adjust an array, by inserting or deleting a number of elements
     * at an insertion or deletion point (array index).
     *
     * @param array    The array.
     * @param delta    The number of elements to insert (if positive)
     *                 or delete (if negative).
     * @param locus    The insertion or deletion point.
     * @param supplier The function to supply the values of inserted
     *                 elements.
     */
    matrixUtilitiesInstance.adjustArray = function(array, delta, locus, supplier) {
        if (delta === 0) {
            return;
        }

        if (delta > 0) {
            var spliceArguments =
                    matrixUtilitiesInstance.array(
                        2 + delta,
                        function(e, i) {return i === 0 ? locus : i === 1 ? 0 : supplier(i - 2);}
                    );

//          array.splice(locus, 0, supplier(0), supplier(1), ..., supplier(delta - 1));
            Array.prototype.splice.apply(array, spliceArguments);
        } else {
            array.splice(locus, - delta);
        }
    };

    /**
     * Adjust the rows of a matrix, by inserting or deleting
     * a number of rows at an insertion or deletion point (row
     * index). Elements in inserted rows are left undefined.
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
            var undefineds =
                matrixUtilitiesInstance.array(
                    matrix.columns,
                    function(e, i) {return undefined;}
                );

            var spliceArguments =
                matrixUtilitiesInstance.array(
                    2 + delta,
                    function(e, i) {return i === 0 ? locus : undefineds.slice();}
                );

//          rows.splice(locus, 0, [undefined, undefined, ..., undefined], ..., [undefined, undefined, ..., undefined]);
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
    matrixUtilitiesInstance.resizeRows = function(matrix, newRows, defaultOffDiagonal, defaultDiagonal) {
        if (newRows === undefined) {
            return;
        }

        var oldRows = matrix.data.data.length;
        matrix.rows = newRows;
        if (newRows > oldRows) {
            for(var r = oldRows; r < newRows; r++) {
                var newRow = [];
                for(var c = 0; c < matrix.columns; c++) {
                    newRow.push(r == c ? defaultDiagonal : defaultOffDiagonal);
                }
                matrix.data.data.push(newRow);
            }
        } else if (newRows < oldRows) {
            matrix.data.data.splice(newRows, oldRows - newRows);
        }
    };

    /**
     * Adjust the columns of a matrix, by inserting or deleting
     * a number of columns at an insertion or deletion point
     * (column index). Elements in inserted columns are left undefined.
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
                        function(e, i) {return i === 0 ? locus : i === 1 ? 0 : undefined;}
                    );

            for (r = 0; r < matrix.rows; r++) {
//              rows[r].splice(locus, 0, undefined, undefined, ..., undefined);
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
                    matrix.data.data[r].push(r == c ? defaultDiagonal : defaultOffDiagonal);
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
                colData.push(r == c ? 1 : 0);
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
     * Resize the rows of a covariance matrix
     * @param covariance
     * @param newRows
     */
    matrixUtilitiesInstance.resizeCovarianceRows = function(covariance, newRows) {
        var oldRows = covariance.rows;
        covariance.rows = newRows;
        if (newRows > oldRows) {
            for(var r = oldRows; r < newRows; r++) {
                var newRow = [];
                for(var c = 0; c < covariance.columns; c++) {
                    newRow.push(
                        r == c ? 1 : covariance.type === glimmpseConstants.variabilityTypeLearCorrelation ? 0 : undefined
                    );
                }
                covariance.blob.data.push(newRow);
            }
        } else if (newRows < oldRows) {
            covariance.blob.data.splice(newRows, oldRows - newRows);
        }
    };

    /**
     * Resize the columns of a covariance matrix
     * @param covariance
     * @param newColumns
     */
    matrixUtilitiesInstance.resizeCovarianceColumns = function(covariance, newColumns) {
        var oldColumns = covariance.columns;
        covariance.columns = newColumns;
        if (newColumns > oldColumns) {
            for(var r = 0; r < covariance.rows; r++) {
                for(var c = oldColumns; c < newColumns; c++) {
                    covariance.blob.data[r].push(
                        r == c ? 1 : covariance.type === glimmpseConstants.variabilityTypeLearCorrelation ? 0 : undefined
                    );
                }
            }
        } else if (newColumns < oldColumns) {
            for(var rr = 0; rr < covariance.rows; rr++) {
                covariance.blob.data[rr].splice(newColumns, oldColumns - newColumns);
            }
        }
    };

    /**
     * Resize the standard deviation list within a covariance object
     * @param covariance
     * @param dimension
     */
    matrixUtilitiesInstance.resizeCovarianceStandardDeviationList = function(covariance, dimension) {
        if (covariance.standardDeviationList.length < dimension) {
            for(var i = covariance.standardDeviationList.length; i < dimension; i++) {
                covariance.standardDeviationList.push(matrixUtilitiesInstance.defaultStandardDeviation(covariance));
            }
        } else if (covariance.standardDeviationList.length > dimension) {
            covariance.standardDeviationList.splice(dimension,
                covariance.standardDeviationList.length - dimension);
        }
    };

    /**
     * Adjust a variability object in response to the addition or removal
     * of a number of its underlying random variables. Inserted elements
     * are left undefined, except for diagonal elements of correlation
     * matrices, which are set to 1, and off-diagonal elements of LEAR
     * correlation matrices, which are set to 0 here (to avoid flagging
     * them as incomplete) and later set to their correct values elsewhere.
     *
     * @param variability The variability object.
     * @param delta       The number of random variables addded (if positive)
     *                    or removed (if negative).
     * @param locus       The addition or removal point.
     */
    matrixUtilitiesInstance.adjustVariability = function(variability, delta, locus) {
        // Make the variability object be also a matrix object.
        variability.data = variability.blob;

        // Call matrix object functions on it.
        matrixUtilitiesInstance.adjustRows(variability, delta, locus);
        matrixUtilitiesInstance.adjustColumns(variability, delta, locus);

        // Make the variability object not be also a matrix object.
        delete variability.data;

        var r, rMax = variability.rows;
        var c, cMax = variability.columns;

        switch (variability.type) {
        case glimmpseConstants.variabilityTypeLearCorrelation:
            for (r = 0; r < rMax; ++ r) {
                for (c = 0; c < cMax; ++ c) {
                    if (typeof variability.blob.data[r][c] === 'undefined') {
                        variability.blob.data[r][c] = 0;
                    }
                }
            }
            /* falls through */
        case glimmpseConstants.variabilityTypeUnstructuredCorrelation:
            for (r = 0; r < rMax; ++ r) {
                variability.blob.data[r][r] = 1;
            }
            break;
        }

        matrixUtilitiesInstance.adjustArray(
            variability.standardDeviationList,
            delta, locus,
            function() { return matrixUtilitiesInstance.defaultStandardDeviation(variability); }
        );
    };

    /**
     * Wrapper function to resize a covariance matrix
     * @param covariance
     * @param newSize
     */
    matrixUtilitiesInstance.resizeCovariance = function(covariance, newSize) {
        // TODO: remove this function and use adjustVariability instead
        matrixUtilitiesInstance.resizeCovarianceRows(covariance, newSize);
        matrixUtilitiesInstance.resizeCovarianceColumns(covariance, newSize);
        matrixUtilitiesInstance.resizeCovarianceStandardDeviationList(covariance, newSize);
    };

    /**
     * Create an "unstructured correlation" Responses variability object.
     *
     * @param dimension
     *
     * @returns The variability object.
     */
    matrixUtilitiesInstance.createUnstructuredCorrelation = function(dimension) {
        // create an empty variability object, with type unstructured correlation
        var variability = {
            idx: 0,
            type: glimmpseConstants.variabilityTypeUnstructuredCorrelation,
            name: glimmpseConstants.covarianceResponses,
            standardDeviationList:[],
            rho:-2,
            delta:-1,
            scale:false,
            rows: dimension,
            columns: dimension,
            blob: {
                data:[]
            }
        };

        // fill in the standard deviation list
        for(var i = 0; i < dimension; i++) {
            variability.standardDeviationList.push({idx: 0});
        }

        // fill in the data
        for(var r = 0; r < dimension; r++) {
            var colData = [];
            for(var c = 0; c < dimension; c++) {
                colData.push(r == c ? 1 : 0);
            }
            variability.blob.data.push(colData);
        }

        return variability;
    };

    /**
     * Create a 2x2 "LEAR correlation" variability object with no name.
     *
     * @returns The variability object.
     */
    matrixUtilitiesInstance.createLEARCorrelation = function() {
        // create an empty variability object, with type LEAR correlation
        var variability = {
            idx: 0,
            type: glimmpseConstants.variabilityTypeLearCorrelation,
            name: "",
            standardDeviationList:[],
            rho:0.1,
            delta:0,
            scale:true,
            rows: 2,
            columns: 2,
            blob: {
                data:[]
            }
        };

        // fill in the standard deviation list
        for(var i = 0; i < 2; i++) {
            variability.standardDeviationList.push({idx: 0, value: 1});
        }

        // fill in the data
        for(var r = 0; r < 2; r++) {
            var colData = [];
            for(var c = 0; c < 2; c++) {
                colData.push(r == c ? 1 : 0.1);
            }
            variability.blob.data.push(colData);
        }

        return variability;
    };

    /**
     * Return the default standard deviation object that is appropriate
     * for the kind of variability object we have. Standard deviations
     * are only displayed and editable for the Responses variability
     * object, and only then when its type is unstructured correlation;
     * so in that case we want new ones to have undefined values, to
     * force the user to define them. In the other cases, we hard-code
     * a value of 1.
     *
     * <p>
     * Is this a hack? You decide.
     *
     * @param variability The variability object.
     */
    matrixUtilitiesInstance.defaultStandardDeviation = function(variability) {
        var name = variability.name;
        var type = variability.type;

        var responses = glimmpseConstants.covarianceResponses;
        var unstrCorr = glimmpseConstants.variabilityTypeUnstructuredCorrelation;

        return name === responses && type === unstrCorr ? {idx:0} : {idx:0, value:1};
    };

    return matrixUtilitiesInstance;
});
