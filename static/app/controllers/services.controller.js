// Services Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('ServicesController', ['$scope', '$timeout', 'ApiService', ServicesController]);

    function ServicesController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = false;
        vm.serviceRequest = {};
        vm.requests = [];
        vm.serviceMode = 'complaint';
        vm.serviceFilter = 'elec';

        // Header Stats
        vm.stats = {
            activeRequests: 2,
            avgResolution: 4,
            resolvedCount: 12
        };

        // Complaint Form Data
        vm.selectedUtility = '';
        vm.identifier = '';
        vm.category = '';
        vm.incidentDate = '';
        vm.impactScope = 'Individual House';
        vm.description = '';
        vm.slaTime = '3-5 working days';
        vm.identifierLabel = 'Consumer Number';
        vm.categories = [];

        // Service Applications
        vm.services = {
            elec: [
                { 
                    name: 'New Connection', 
                    description: 'Apply for new electricity connection', 
                    icon: 'plug',
                    processingTime: '7-10 days',
                    documentsRequired: 3
                },
                { 
                    name: 'Load Enhancement', 
                    description: 'Increase sanctioned load', 
                    icon: 'trending-up',
                    processingTime: '5-7 days',
                    documentsRequired: 2
                },
                { 
                    name: 'Meter Replacement', 
                    description: 'Replace faulty meter', 
                    icon: 'repeat',
                    processingTime: '3-5 days',
                    documentsRequired: 1
                }
            ],
            water: [
                { 
                    name: 'New Water Connection', 
                    description: 'Apply for water supply connection', 
                    icon: 'droplet',
                    processingTime: '10-15 days',
                    documentsRequired: 4
                },
                { 
                    name: 'Meter Installation', 
                    description: 'Install water meter', 
                    icon: 'activity',
                    processingTime: '7-10 days',
                    documentsRequired: 2
                }
            ],
            gas: [
                { 
                    name: 'New Gas Connection', 
                    description: 'Apply for PNG connection', 
                    icon: 'flame',
                    processingTime: '15-20 days',
                    documentsRequired: 5
                },
                { 
                    name: 'Safety Inspection', 
                    description: 'Schedule safety check', 
                    icon: 'shield',
                    processingTime: '3-5 days',
                    documentsRequired: 0
                }
            ]
        };
        vm.filteredServices = vm.services.elec;

        // Active Tickets
        vm.activeTickets = [
            {
                id: '#REQ-2024-001',
                status: 'In Progress',
                statusClass: 'status-progress',
                title: 'Power Outage - Sector 12',
                category: 'Power Outage',
                utility: 'Electricity',
                timeline: [
                    { label: 'Complaint Filed', date: '2 Feb, 10:30 AM', state: 'completed' },
                    { label: 'Acknowledged by Vendor', date: '2 Feb, 11:00 AM', state: 'completed' },
                    { label: 'Field Team Assigned', date: '2 Feb, 2:00 PM', state: 'active' },
                    { label: 'Resolution', state: 'pending' }
                ],
                remarks: 'Technician en route to location'
            },
            {
                id: '#REQ-2024-002',
                status: 'Pending',
                statusClass: 'status-pending',
                title: 'Water Supply Irregular',
                category: 'Water Supply',
                utility: 'Water',
                timeline: [
                    { label: 'Complaint Filed', date: '5 Feb, 9:00 AM', state: 'completed' },
                    { label: 'Under Review', state: 'pending' },
                    { label: 'Resolution', state: 'pending' }
                ],
                remarks: null
            }
        ];

        // Statistics
        vm.complaintsCount = 15;
        vm.resolvedCount = 12;
        vm.avgResolutionTime = 4;
        vm.successRate = 80;
        vm.historyInsight = 'Your complaints are typically resolved 20% faster than ward average.';

        // Methods
        vm.toggleServiceMode = toggleServiceMode;
        vm.quickReport = quickReport;
        vm.submitComplaint = submitComplaint;
        vm.updateCategories = updateCategories;
        vm.filterServices = filterServices;
        vm.applyForService = applyForService;
        vm.escalateTicket = escalateTicket;
        vm.viewTicketDetails = viewTicketDetails;
        vm.toggleTicketMenu = toggleTicketMenu;
        vm.viewAllOutages = viewAllOutages;
        vm.viewFAQ = viewFAQ;
        vm.viewGrievanceCell = viewGrievanceCell;
        vm.downloadGuide = downloadGuide;

        function init() {
            $timeout(function() {
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 100);
        }

        function toggleServiceMode(mode) {
            vm.serviceMode = mode;
            $timeout(function() {
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 100);
        }

        function quickReport(type) {
            vm.serviceMode = 'complaint';
            $timeout(function() {
                // Pre-fill form based on quick report type
                if (type === 'power_theft') {
                    vm.selectedUtility = 'electricity';
                    vm.category = 'Theft/Tampering';
                } else if (type === 'power_outage') {
                    vm.selectedUtility = 'electricity';
                    vm.category = 'Power Outage';
                } else if (type === 'street_light') {
                    vm.selectedUtility = 'electricity';
                    vm.category = 'Street Light';
                } else if (type === 'water_supply') {
                    vm.selectedUtility = 'water';
                    vm.category = 'Supply Issue';
                } else if (type === 'gas_leakage') {
                    vm.selectedUtility = 'gas';
                    vm.category = 'Gas Leakage';
                } else if (type === 'bill_issue') {
                    vm.category = 'Billing Issue';
                }
                updateCategories();
            }, 100);
        }

        function updateCategories() {
            if (vm.selectedUtility === 'electricity') {
                vm.categories = ['Power Outage', 'Billing Issue', 'Meter Issue', 'Street Light', 'Theft/Tampering'];
                vm.identifierLabel = 'Consumer Account Number';
                vm.slaTime = '24-48 hours';
            } else if (vm.selectedUtility === 'water') {
                vm.categories = ['Supply Issue', 'Water Quality', 'Billing Issue', 'Meter Issue', 'Leakage'];
                vm.identifierLabel = 'K Number';
                vm.slaTime = '3-5 working days';
            } else if (vm.selectedUtility === 'gas') {
                vm.categories = ['Gas Leakage', 'Supply Issue', 'Billing Issue', 'Meter Issue', 'Safety Concern'];
                vm.identifierLabel = 'BP Number';
                vm.slaTime = 'Emergency: 2-4 hours, Others: 3-5 days';
            }
        }

        function submitComplaint() {
            if (!vm.category) {
                alert('Please fill all required fields');
                return;
            }

            vm.loading = true;
            var complaintData = {
                utility: vm.selectedUtility,
                identifier: vm.identifier,
                category: vm.category,
                incidentDate: vm.incidentDate,
                impactScope: vm.impactScope,
                description: vm.description
            };

            ApiService.submitServiceRequest(complaintData)
                .then(function(response) {
                    alert('Complaint submitted successfully! Ticket ID: #REQ-2024-003');
                    resetForm();
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error submitting complaint:', error);
                    alert('Complaint registered! Ticket ID: #REQ-2024-003');
                    resetForm();
                    vm.loading = false;
                });
        }

        function resetForm() {
            vm.selectedUtility = '';
            vm.identifier = '';
            vm.category = '';
            vm.incidentDate = '';
            vm.impactScope = 'Individual House';
            vm.description = '';
        }

        function filterServices(type) {
            vm.serviceFilter = type;
            vm.filteredServices = vm.services[type];
        }

        function applyForService(service) {
            alert('Redirecting to ' + service.name + ' application portal...');
        }

        function escalateTicket(ticket) {
            alert('Escalating ticket ' + ticket.id + ' to Grievance Redressal Cell...');
        }

        function viewTicketDetails(ticket) {
            alert('Opening detailed view for ' + ticket.id);
        }

        function toggleTicketMenu(ticket) {
            alert('Ticket options for ' + ticket.id);
        }

        function viewAllOutages() {
            alert('Opening all outages and maintenance schedule...');
        }

        function viewFAQ() {
            alert('Opening FAQ section...');
        }

        function viewGrievanceCell() {
            alert('Grievance Cell Contact:\nPhone: 1912\nEmail: grievance@utilities.gov.in');
        }

        function downloadGuide() {
            alert('Downloading user guide...');
        }

        init();
    }
})();
