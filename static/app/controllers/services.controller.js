// Services Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('ServicesController', ['$scope', 'ApiService', ServicesController]);

    function ServicesController($scope, ApiService) {
        var vm = this;
        vm.loading = false;
        vm.serviceRequest = {};
        vm.requests = [];

        vm.submitRequest = function() {
            if (vm.serviceForm.$valid) {
                vm.loading = true;
                ApiService.submitServiceRequest(vm.serviceRequest)
                    .then(function(response) {
                        alert('Service request submitted successfully!');
                        vm.serviceRequest = {};
                        vm.serviceForm.$setPristine();
                        vm.loading = false;
                    })
                    .catch(function(error) {
                        console.error('Error submitting service request:', error);
                        alert('Error submitting request. Please try again.');
                        vm.loading = false;
                    });
            }
        };

        function init() {
            // Initialize services
        }

        init();
    }
})();
