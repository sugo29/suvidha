// Insights Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('InsightsController', ['$scope', 'ApiService', InsightsController]);

    function InsightsController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.insightsData = {};

        function init() {
            loadInsightsData();
        }

        function loadInsightsData() {
            ApiService.getInsightsData()
                .then(function(response) {
                    vm.insightsData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading insights data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
