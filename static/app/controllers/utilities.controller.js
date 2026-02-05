// Utilities Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('UtilitiesController', ['$scope', '$timeout', 'ApiService', UtilitiesController]);

    function UtilitiesController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = false;
        vm.activeTab = 'electricity';
        vm.utilitiesData = {};
        
        // Header stats
        vm.totalConsumption = 481;
        vm.currentMonth = 'January 2026';
        vm.pendingBills = 1;

        vm.switchTab = function(tab) {
            console.log('Switching to:', tab);
            vm.activeTab = tab;
            // Reinitialize Lucide icons after tab switch
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        };

        // Action methods
        vm.payBill = function(utility) {
            console.log('Pay bill for:', utility);
            window.location.href = '#!/services';
        };

        vm.downloadBill = function(utility) {
            console.log('Download bill for:', utility);
            alert('Downloading ' + utility + ' bill...');
        };

        vm.viewHistory = function(utility) {
            console.log('View history for:', utility);
            window.location.href = '#!/records';
        };

        vm.raiseRequest = function(utility) {
            console.log('Raise request for:', utility);
            window.location.href = '#!/services';
        };

        vm.bookCylinder = function() {
            console.log('Book gas cylinder');
            alert('Redirecting to IGL booking portal...');
        };

        vm.reportLeakage = function() {
            console.log('Report water leakage');
            window.location.href = '#!/services';
        };

        vm.toggleChartType = function(utility) {
            console.log('Toggle chart type for:', utility);
        };

        vm.viewTariffDetails = function() {
            console.log('View tariff details');
            alert('Opening complete tariff schedule...');
        };

        vm.viewSafetyTips = function() {
            console.log('View safety tips');
            alert('Opening gas safety guidelines...');
        };

        vm.viewQualityReport = function() {
            console.log('View quality report');
            alert('Opening water quality report...');
        };

        console.log('UtilitiesController initialized, activeTab:', vm.activeTab);

        function initCharts() {
            // Wait for DOM to be ready
            $timeout(function() {
                // Shared Chart Options
                const commonOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: '#f0f0f0'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                };

                // Electricity Chart
                const ctxElec = document.getElementById('elecChart');
                if (ctxElec) {
                    new Chart(ctxElec, {
                        type: 'bar',
                        data: {
                            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                            datasets: [{
                                label: 'Units (kWh)',
                                data: [180, 190, 210, 280, 320, 350, 310, 290, 220, 200, 180, 245],
                                backgroundColor: '#0F52BA',
                                borderRadius: 4
                            }]
                        },
                        options: commonOptions
                    });
                }

                // Gas Chart
                const ctxGas = document.getElementById('gasChart');
                if (ctxGas) {
                    new Chart(ctxGas, {
                        type: 'line',
                        data: {
                            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                            datasets: [{
                                label: 'Units (SCM)',
                                data: [25, 22, 18, 15, 12, 10, 11, 13, 16, 20, 24, 18],
                                borderColor: '#FF9933',
                                backgroundColor: 'rgba(255, 153, 51, 0.1)',
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: commonOptions
                    });
                }

                // Water Chart
                const ctxWater = document.getElementById('waterChart');
                if (ctxWater) {
                    new Chart(ctxWater, {
                        type: 'bar',
                        data: {
                            labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                            datasets: [{
                                label: 'Units (KL)',
                                data: [18, 19, 20, 22, 24, 25, 23, 21, 20, 19, 18, 22],
                                backgroundColor: '#00A86B',
                                borderRadius: 4
                            }]
                        },
                        options: commonOptions
                    });
                }
            }, 100);
        }

        function init() {
            loadUtilitiesData();
            initCharts();
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
