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
glimmpseApp.directive('ngResizableMatrix',function() {
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
            columnLabels: '=columnlabels'
        },

        controller: ['$scope', function($scope) {

            /**
             * Add or subtract rows when the user changes the row dimension
             */
            $scope.resizeRows = function() {
                var currentRows = $scope.matrix.data.data.length;
                if ($scope.matrix.rows > currentRows) {
                    for(var r = currentRows; r < $scope.matrix.rows; r++) {
                        var newRow = [];
                        for(var c = 0; c < $scope.matrix.columns; c++) {
                            newRow.push(0);
                        }
                        $scope.matrix.data.data.push(newRow);
                    }
                } else if ($scope.matrix.rows < currentRows) {
                    $scope.matrix.data.data.splice($scope.matrix.rows,
                        currentRows-$scope.matrix.rows);
                }
            }

            /**
             * Add or remove columns when the user changes the column dimension
             */
            $scope.resizeColumns = function() {
                var currentColumns = $scope.matrix.data.data[0].length;
                if ($scope.matrix.columns > currentColumns) {
                    for(var r = 0; r < $scope.matrix.rows; r++) {
                        for(var c = currentColumns; c < $scope.matrix.columns; c++) {
                            $scope.matrix.data.data[r].push(0);
                        }
                    }

                } else if ($scope.matrix.columns < currentColumns) {
                    for(var r = 0; r < $scope.matrix.rows; r++) {
                        $scope.matrix.data.data[r].splice($scope.matrix.columns,
                            currentColumns-$scope.matrix.columns);
                    }
                }
            }
        }]


    }
})