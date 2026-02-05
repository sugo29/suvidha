// Simulator Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('SimulatorController', ['$scope', SimulatorController]);

    function SimulatorController($scope) {
        var vm = this;
        vm.simulationData = {
            currentUsage: 0,
            projectedUsage: 0,
            tariffRate: 5.5
        };

        vm.calculateBill = function() {
            vm.simulationData.projectedBill = 
                vm.simulationData.projectedUsage * vm.simulationData.tariffRate;
        };

        function init() {
            // Initialize simulator
        }

        init();
    }
})();
