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
 * A resizable matrix directive used in matrix mode, and for
 * variability specification
 *
 * Attributes:
 *  resizable (required) - true/false.  If true, the user
 *      can change the row and column dimensions.
 *  symmetric (required) -  true/false. If true, the matrix
 *      will be symmetric and the user will only be able to edit the lower
 *      triangle
 *  editDiagonal (required) - true/false. If true, diagonal elements
 *      will be editable
 *  editOffDiagonal (required) - true/false. If true, off diagonal
 *      elements will be editable
 *
 *  rowLabels (required) - array list with row labels
 *  columnLabels (required) - array list of column labels
 *
 */
glimmpseApp.directive('ngResizableMatrix',['matrixUtilities', function() {
    return {
        restrict: 'E',
        require: '^ngModel',
        templateUrl: 'templates/ngResizableMatrixTemplate.html',
        scope: {
            matrix: '=ngModel',
            rowResizable: '=rowresizable',
            columnResizable: '=columnresizable',
            symmetric: '=symmetric',
            editDiagonal: '=editdiagonal',
            editOffDiagonal: '=editoffdiagonal',
            rowLabels: '=rowlabels',
            columnLabels: '=columnlabels',
            defaultDiagonal: '=defaultdiagonal',
            defaultOffDiagonal: '=defaultoffdiagonal',
            minrows: '=minrows',
            maxrows: '=maxrows',
            mincolumns: '=mincolumns',
            maxcolumns: '=maxcolumns'
        },

        controller: ['$scope', 'matrixUtilities', function($scope, matrixUtilities) {

            init();
            function init() {
                $scope.matrixUtils = matrixUtilities;
            }

            /**
             * Add or subtract rows when the user changes the row dimension
             */
            $scope.resizeRows = function() {
                $scope.matrixUtils.resizeRows($scope.matrix, $scope.matrix.rows,
                    $scope.defaultOffDiagonal, $scope.defaultDiagonal);
            };

            /**
             * Add or remove columns when the user changes the column dimension
             */
            $scope.resizeColumns = function() {
                $scope.matrixUtils.resizeColumns($scope.matrix, $scope.matrix.columns,
                    $scope.defaultOffDiagonal, $scope.defaultDiagonal);
            };

            /**
             * Called when cell contents change to implement symmetric matrices
             * @param contents
             * @param row
             * @param column
             */
            $scope.cellChangeHandler = function(contents, row, column) {
                if ($scope.symmetric) {
                    $scope.matrix.data.data[column][row] = contents;
                }
            };

            /**
             * Checks
             * @param row
             * @param column
             */
            $scope.isCellDisabled = function(row, column) {
                if ($scope.symmetric && column > row) {
                    return true;
                } else if (!$scope.editDiagonal && row == column) {
                    return true;
                } else if (!$scope.editOffDiagonal && row != column) {
                    return true;
                }
                return false;
            };
        }]


    };
}]);


/**
 * A trend selection panel used for specifying a trend hypothesis
 *
 * Attributes
 *   ng-model: the trend type variable
 *   name: the radio group
 *   levels: the number of levels of the factor
 */
glimmpseApp.directive('ngTrendSelect',['glimmpseConstants', function() {
    return {
        restrict: 'E',
        require: '^ngModel',
        templateUrl: 'templates/ngTrendSelectTemplate.html',
        scope: {
            type: '=ngModel',
            radiogroup: "=name",
            levels: "=levels",
            onselect: "&"
        },
        controller: ['$scope', 'glimmpseConstants', function($scope, glimmpseConstants) {
           $scope.constants = glimmpseConstants;
        }]
    };
}]);



