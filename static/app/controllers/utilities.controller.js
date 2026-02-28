// Utilities Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('UtilitiesController', ['$scope', '$timeout', 'ApiService', UtilitiesController]);

    function UtilitiesController($scope, $timeout, ApiService) {
        var vm = this;
        var $rootScope = $scope.$root;
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
            $rootScope.showDialog('Download Bill', 'Your ' + utility + ' bill for the current billing cycle is being prepared. The PDF will be ready for download shortly.', 'info');
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
            $rootScope.showDialog('Book Gas Cylinder', 'Your cylinder booking request has been placed with IGL. Expected delivery: 3–5 business days. You will receive an SMS confirmation.', 'success');
        };

        vm.reportLeakage = function() {
            console.log('Report water leakage');
            window.location.href = '#!/services';
        };

        vm.toggleChartType = function(utility) {
            $rootScope.showDialog('Chart View', 'Switching chart type for ' + utility + '. Bar and line chart views help visualize your consumption patterns differently.', 'info');
        };

        vm.viewTariffDetails = function() {
            $rootScope.showDialog('Tariff Schedule', 'Current electricity tariff (Domestic):\n• 0–200 units: ₹3.00/kWh\n• 201–400 units: ₹4.50/kWh\n• 401–800 units: ₹6.50/kWh\n• 800+ units: ₹7.00/kWh\nFixed charge: ₹25/kW/month', 'info');
        };

        vm.viewSafetyTips = function() {
            $rootScope.showDialog('Gas Safety Guidelines', '• Ensure proper ventilation near gas appliances\n• Check rubber tubes every 6 months\n• Use ISI-marked regulators only\n• In case of leak: Turn off regulator, open windows, call 1906\n• Never use matches to check for leaks', 'warning');
        };

        vm.viewQualityReport = function() {
            $rootScope.showDialog('Water Quality Report', 'Latest water quality parameters (DJB):\n• pH: 7.2 (Normal)\n• TDS: 180 ppm (Safe)\n• Chlorine: 0.2 mg/L (Within limits)\n• Coliform: Not detected\nLast tested: 10 Jan 2026', 'success');
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
