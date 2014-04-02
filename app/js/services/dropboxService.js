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


glimmpseApp.factory('dropboxService', function($http, $q, config, glimmpseConstants){
    var dropboxServiceInstance = {};

    dropboxServiceInstance.dropboxServiceToken = undefined;

    dropboxServiceInstance.fileListFromDropbox = null;

    dropboxServiceInstance.status = false;

    dropboxServiceInstance.studyDesignFileName = undefined;

    dropboxServiceInstance.resultsFileName = undefined;

    dropboxServiceInstance.customURL = undefined;

    dropboxServiceInstance.studyDesignData = undefined;

    dropboxServiceInstance.resultsData = undefined;

    /**
     *  Access dropbox for saving the file
     */

    dropboxServiceInstance.saveStudyDesign = function() {
        window.alert('inside dropboxservice with token:');
        var defer = $q.defer();
    };

    return dropboxServiceInstance;

});

