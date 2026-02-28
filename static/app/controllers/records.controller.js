// Records Controller - Enhanced
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('RecordsController', ['$scope', '$timeout', 'ApiService', RecordsController]);

    function RecordsController($scope, $timeout, ApiService) {
        var vm = this;
        var $rootScope = $scope.$root;
        vm.loading = true;
        vm.searchQuery = '';
        vm.utilityFilter = '';
        vm.statusFilter = '';
        vm.periodFilter = 'all';
        vm.viewMode = 'table';
        vm.sortColumn = 'date';
        vm.sortReverse = true;
        vm.currentPage = 1;
        vm.itemsPerPage = 10;
        
        // Header Stats
        vm.stats = {
            totalBills: 42,
            totalAmount: '₹48,240',
            avgMonthly: '₹4,020',
            pending: 2
        };
        
        // Sample Records Data
        vm.records = [
            {
                date: '15 Jan 2026',
                utility: 'Electricity',
                utilityClass: 'elec',
                icon: 'zap',
                billId: 'ELEC-2026-001',
                reading: '1245 kWh',
                amount: '1,450',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '10 Jan 2026',
                utility: 'Water',
                utilityClass: 'water',
                icon: 'droplet',
                billId: 'WAT-2026-001',
                reading: '18 KL',
                amount: '420',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '05 Jan 2026',
                utility: 'Gas',
                utilityClass: 'gas',
                icon: 'flame',
                billId: 'GAS-2026-001',
                reading: '142 SCM',
                amount: '1,280',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '15 Dec 2025',
                utility: 'Electricity',
                utilityClass: 'elec',
                icon: 'zap',
                billId: 'ELEC-2025-012',
                reading: '1320 kWh',
                amount: '1,580',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '10 Dec 2025',
                utility: 'Water',
                utilityClass: 'water',
                icon: 'droplet',
                billId: 'WAT-2025-012',
                reading: '20 KL',
                amount: '480',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '05 Dec 2025',
                utility: 'Gas',
                utilityClass: 'gas',
                icon: 'flame',
                billId: 'GAS-2025-012',
                reading: '155 SCM',
                amount: '1,395',
                status: 'Pending',
                statusClass: 'pending',
                statusIcon: 'clock'
            },
            {
                date: '15 Nov 2025',
                utility: 'Electricity',
                utilityClass: 'elec',
                icon: 'zap',
                billId: 'ELEC-2025-011',
                reading: '1180 kWh',
                amount: '1,380',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '10 Nov 2025',
                utility: 'Water',
                utilityClass: 'water',
                icon: 'droplet',
                billId: 'WAT-2025-011',
                reading: '17 KL',
                amount: '390',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '05 Nov 2025',
                utility: 'Gas',
                utilityClass: 'gas',
                icon: 'flame',
                billId: 'GAS-2025-011',
                reading: '138 SCM',
                amount: '1,242',
                status: 'Overdue',
                statusClass: 'overdue',
                statusIcon: 'alert-circle'
            },
            {
                date: '15 Oct 2025',
                utility: 'Electricity',
                utilityClass: 'elec',
                icon: 'zap',
                billId: 'ELEC-2025-010',
                reading: '1265 kWh',
                amount: '1,495',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '10 Oct 2025',
                utility: 'Water',
                utilityClass: 'water',
                icon: 'droplet',
                billId: 'WAT-2025-010',
                reading: '19 KL',
                amount: '450',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            },
            {
                date: '05 Oct 2025',
                utility: 'Gas',
                utilityClass: 'gas',
                icon: 'flame',
                billId: 'GAS-2025-010',
                reading: '148 SCM',
                amount: '1,332',
                status: 'Paid',
                statusClass: 'paid',
                statusIcon: 'check-circle'
            }
        ];
        
        vm.filteredRecords = vm.records;
        
        // Methods
        vm.filterRecords = function() {
            vm.filteredRecords = vm.records.filter(function(record) {
                var matchesSearch = !vm.searchQuery || 
                    record.billId.toLowerCase().indexOf(vm.searchQuery.toLowerCase()) !== -1 ||
                    record.utility.toLowerCase().indexOf(vm.searchQuery.toLowerCase()) !== -1;
                
                var matchesUtility = !vm.utilityFilter || 
                    record.utility.toLowerCase() === vm.utilityFilter.toLowerCase();
                
                var matchesStatus = !vm.statusFilter || 
                    record.status.toLowerCase() === vm.statusFilter.toLowerCase();
                
                return matchesSearch && matchesUtility && matchesStatus;
            });
            
            vm.updatePagination();
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        };
        
        vm.hasActiveFilters = function() {
            return vm.utilityFilter || vm.statusFilter || vm.periodFilter !== 'all';
        };
        
        vm.clearFilter = function(type) {
            if (type === 'utility') {
                vm.utilityFilter = '';
            } else if (type === 'status') {
                vm.statusFilter = '';
            } else if (type === 'period') {
                vm.periodFilter = 'all';
            }
            vm.filterRecords();
        };
        
        vm.clearAllFilters = function() {
            vm.searchQuery = '';
            vm.utilityFilter = '';
            vm.statusFilter = '';
            vm.periodFilter = 'all';
            vm.filterRecords();
        };
        
        vm.setViewMode = function(mode) {
            vm.viewMode = mode;
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        };
        
        vm.sortBy = function(column) {
            if (vm.sortColumn === column) {
                vm.sortReverse = !vm.sortReverse;
            } else {
                vm.sortColumn = column;
                vm.sortReverse = false;
            }
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        };
        
        vm.updatePagination = function() {
            vm.totalPages = Math.ceil(vm.filteredRecords.length / vm.itemsPerPage);
            vm.paginationStart = ((vm.currentPage - 1) * vm.itemsPerPage) + 1;
            vm.paginationEnd = Math.min(vm.currentPage * vm.itemsPerPage, vm.filteredRecords.length);
        };
        
        vm.previousPage = function() {
            if (vm.currentPage > 1) {
                vm.currentPage--;
                vm.updatePagination();
            }
        };
        
        vm.nextPage = function() {
            if (vm.currentPage < vm.totalPages) {
                vm.currentPage++;
                vm.updatePagination();
            }
        };
        
        vm.viewDocument = function(record) {
            $rootScope.showDialog('Bill Document — ' + record.billId, 'Utility: ' + record.utility + '\nDate: ' + record.date + '\nReading: ' + record.reading + '\nAmount: ₹' + record.amount + '\nStatus: ' + record.status, 'info');
        };
        
        vm.downloadBill = function(record) {
            $rootScope.showDialog('Download Bill', 'Preparing PDF for bill ' + record.billId + ' (' + record.utility + ', ₹' + record.amount + '). The file will download automatically.', 'info');
        };
        
        vm.downloadCSV = function() {
            $rootScope.showDialog('Export CSV', 'Exporting ' + vm.filteredRecords.length + ' records to CSV format. The file includes bill ID, utility, reading, amount, and status columns.', 'info');
        };
        
        vm.exportPDF = function() {
            $rootScope.showDialog('Export PDF', 'Generating a comprehensive PDF report of ' + vm.filteredRecords.length + ' billing records with summary statistics. This may take a moment.', 'info');
        };

        function init() {
            loadRecordsData();
            vm.updatePagination();
            
            // Initialize Lucide icons
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 100);
        }

        function loadRecordsData() {
            ApiService.getRecordsData()
                .then(function(response) {
                    if (response.data && response.data.length > 0) {
                        vm.records = response.data;
                        vm.filteredRecords = vm.records;
                        vm.updatePagination();
                    }
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading records data:', error);
                    vm.loading = false;
                });
        }

        init();
    }
})();
