// Utilities Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('UtilitiesController', ['$scope', 'ApiService', UtilitiesController]);

    function UtilitiesController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.activeTab = 'electricity';
        vm.utilitiesData = {};

        vm.switchTab = function(tab) {
            vm.activeTab = tab;
        };

        function init() {
            loadUtilitiesData();
        }

        function loadUtilitiesData() {
            ApiService.getUtilitiesData()
                .then(function(response) {
                    vm.utilitiesData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading utilities data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
