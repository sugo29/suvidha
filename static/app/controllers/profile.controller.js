// Profile Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('ProfileController', ['$scope', 'ApiService', ProfileController]);

    function ProfileController($scope, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.profileData = {};

        vm.updateProfile = function() {
            // Implement profile update
        };

        function init() {
            loadProfileData();
        }

        function loadProfileData() {
            ApiService.getProfileData()
                .then(function(response) {
                    vm.profileData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading profile data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
