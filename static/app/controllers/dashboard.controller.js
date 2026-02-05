// Dashboard Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('DashboardController', ['$scope', 'ApiService', DashboardController]);

    function DashboardController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.userData = {};

        // Initialize
        function init() {
            loadDashboardData();
        }

        function loadDashboardData() {
            ApiService.getDashboardData()
                .then(function(response) {
                    vm.userData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading dashboard data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
