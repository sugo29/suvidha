// Records Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('RecordsController', ['$scope', 'ApiService', RecordsController]);

    function RecordsController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.records = [];
        vm.searchQuery = '';
        vm.filterUtility = 'all';

        vm.filterRecords = function() {
            // Implement filtering logic
        };

        function init() {
            loadRecordsData();
        }

        function loadRecordsData() {
            ApiService.getRecordsData()
                .then(function(response) {
                    vm.records = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading records data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
