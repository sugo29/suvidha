// Insights Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('InsightsController', ['$scope', '$timeout', 'ApiService', InsightsController]);

    function InsightsController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.insightsData = {};
        vm.activeSection = 'profile';
        
        // Header Stats
        vm.stats = {
            efficiency: 85,
            analysisMonths: 8,
            wardRank: 40
        };

        // Profile Data
        vm.profile = {
            electricity: {
                score: 8.5,
                avgMonthly: 245,
                trend: 'improving'
            },
            water: {
                score: 6.2,
                avgMonthly: 18500,
                trend: 'warning'
            },
            gas: {
                score: 7.8,
                avgMonthly: 42,
                trend: 'stable'
            }
        };

        // Recommendations
        vm.recommendations = {
            electricity: {
                savings: 2400
            }
        };

        // Methods
        vm.switchSection = switchSection;
        vm.viewDataDisclaimer = viewDataDisclaimer;
        vm.exportTrendData = exportTrendData;
        vm.viewMethodology = viewMethodology;
        vm.viewGovernmentAdvisory = viewGovernmentAdvisory;
        vm.raiseServiceRequest = raiseServiceRequest;
        vm.viewSafetyGuidelines = viewSafetyGuidelines;
        vm.viewProgramme = viewProgramme;

        function init() {
            loadInsightsData();
            $timeout(function() {
                initCharts();
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 100);
        }

        function switchSection(section) {
            vm.activeSection = section;
            $timeout(function() {
                if (section === 'trends') {
                    initCharts();
                }
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 100);
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

        function initCharts() {
            // Electricity Trend Chart
            var elecCtx = document.getElementById('electricityTrendChart');
            if (elecCtx && typeof Chart !== 'undefined') {
                new Chart(elecCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            data: [280, 265, 250, 240, 235, 225],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: false, display: false },
                            x: { display: true, grid: { display: false } }
                        }
                    }
                });
            }

            // Water Trend Chart
            var waterCtx = document.getElementById('waterTrendChart');
            if (waterCtx && typeof Chart !== 'undefined') {
                new Chart(waterCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            data: [16000, 16500, 17200, 17800, 18200, 18500],
                            borderColor: 'rgb(245, 158, 11)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: false, display: false },
                            x: { display: true, grid: { display: false } }
                        }
                    }
                });
            }

            // Gas Trend Chart
            var gasCtx = document.getElementById('gasTrendChart');
            if (gasCtx && typeof Chart !== 'undefined') {
                new Chart(gasCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            data: [45, 42, 44, 40, 43, 42],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: false, display: false },
                            x: { display: true, grid: { display: false } }
                        }
                    }
                });
            }
        }

        function viewDataDisclaimer() {
            alert('Data Disclaimer: All insights are based on official utility billing records and ward-level benchmarks provided by government agencies.');
        }

        function exportTrendData() {
            alert('Trend data export feature coming soon!');
        }

        function viewMethodology() {
            alert('Methodology: We analyze your consumption patterns against ward averages, seasonal trends, and household size benchmarks to generate personalized insights.');
        }

        function viewGovernmentAdvisory(utility) {
            alert('Opening ' + utility + ' government advisory...');
        }

        function raiseServiceRequest(utility) {
            window.location.href = '#!/services';
        }

        function viewSafetyGuidelines(utility) {
            alert('Opening safety guidelines for ' + utility + '...');
        }

        function viewProgramme(programme) {
            alert('Opening information for ' + programme + ' programme...');
        }

        init();
    }
})();
