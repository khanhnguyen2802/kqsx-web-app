(function() {
    'use strict';

    angular
        .module('erpApp')
        .factory('FileService', FileService);

    FileService.$inject = ['$http'];

    function FileService ($http) {
        return {
            uploadAvatar: uploadAvatar,
            deleteFileUpload: deleteFileUpload
        };

        function uploadAvatar(file, type) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('type', type);
            return $http.post('/api/file/upload/', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function(response) {
                return response;
            });
        }

        function deleteFileUpload(fileName) {
            return $http.delete('/api/file/deleteFileUploaded?fileName=' + fileName).then(function(response) {
                return response.data;
            });
        }
    }
})();
