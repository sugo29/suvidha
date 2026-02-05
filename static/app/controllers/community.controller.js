// Community Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('CommunityController', ['$scope', 'ApiService', CommunityController]);

    function CommunityController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.activeSection = 'overview';
        vm.communityData = {};

        vm.showSection = function(section) {
            vm.activeSection = section;
        };

        function init() {
            loadCommunityData();
        }

        function loadCommunityData() {
            ApiService.getCommunityData()
                .then(function(response) {
                    vm.communityData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading community data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
