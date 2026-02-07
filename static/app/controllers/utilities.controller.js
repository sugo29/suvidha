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
        
        // Display properties
        vm.totalConsumption = 0;
        vm.currentMonth = 'January 2026';
        vm.pendingBills = 0;
        vm.connectionId = 'Not Available';
        
        // Calculate average consumption
        vm.getAverage = function(utilityType) {
            if (!vm.utilitiesData[utilityType] || !vm.utilitiesData[utilityType].monthly_data) {
                return 0;
            }
            var data = vm.utilitiesData[utilityType].monthly_data;
            if (data.length === 0) return 0;
            var sum = data.reduce(function(a, b) { return a + b; }, 0);
            return Math.round(sum / data.length);
        };
        
        // Get current bill amount (most recent month)
        vm.getCurrentBill = function(utilityType) {
            if (!vm.utilitiesData[utilityType] || !vm.utilitiesData[utilityType].monthly_data) {
                return 0;
            }
            var data = vm.utilitiesData[utilityType].monthly_data;
            if (data.length === 0) return 0;
            // Most recent is last in array, estimate bill (dummy calculation)
            var consumption = data[data.length - 1] || 0;
            // Simple rate calculation
            if (utilityType === 'electricity') {
                return Math.round(consumption * 4.5); // Average rate
            } else if (utilityType === 'water') {
                return Math.round(consumption * 20); // Average rate  
            } else if (utilityType === 'gas') {
                return Math.round(consumption * 50); // Average rate
            }
            return 0;
        };

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
                    const elecData = vm.utilitiesData.electricity || {};
                    const elecMonths = elecData.months || ['No Data'];
                    const elecValues = elecData.monthly_data || [0];
                    
                    new Chart(ctxElec, {
                        type: 'bar',
                        data: {
                            labels: elecMonths,
                            datasets: [{
                                label: 'Units (kWh)',
                                data: elecValues,
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
                    const gasData = vm.utilitiesData.gas || {};
                    const gasMonths = gasData.months || ['No Data'];
                    const gasValues = gasData.monthly_data || [0];
                    
                    new Chart(ctxGas, {
                        type: 'line',
                        data: {
                            labels: gasMonths,
                            datasets: [{
                                label: 'Units (SCM)',
                                data: gasValues,
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
                    const waterData = vm.utilitiesData.water || {};
                    const waterMonths = waterData.months || ['No Data'];
                    const waterValues = waterData.monthly_data || [0];
                    
                    new Chart(ctxWater, {
                        type: 'bar',
                        data: {
                            labels: waterMonths,
                            datasets: [{
                                label: 'Units (KL)',
                                data: waterValues,
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
        }

        function loadUtilitiesData() {
            ApiService.getUtilitiesData()
                .then(function(response) {
                    vm.utilitiesData = response.data;
                    
                    // Calculate total consumption from most recent month
                    var elecData = response.data.electricity?.monthly_data || [0];
                    var waterData = response.data.water?.monthly_data || [0];
                    var gasData = response.data.gas?.monthly_data || [0];
                    
                    vm.totalConsumption = (elecData[elecData.length - 1] || 0) + 
                                          (waterData[waterData.length - 1] || 0) + 
                                          (gasData[gasData.length - 1] || 0);
                    
                    // Calculate pending bills (simplified check)
                    vm.pendingBills = 0;
                    if (elecData[elecData.length - 1] > 0) vm.pendingBills++;
                    if (waterData[waterData.length - 1] > 0) vm.pendingBills++;
                    if (gasData[gasData.length - 1] > 0) vm.pendingBills++;
                    
                    vm.loading = false;
                    // Initialize charts with API data
                    initCharts();
                })
                .catch(function(error) {
                    console.error('Error loading utilities data:', error);
                    vm.loading = false;
                    // Initialize with empty data
                    initCharts();
                });
        }

        init();
    }
})();
