// Community Controller - Enhanced
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('CommunityController', ['$scope', '$timeout', 'ApiService', CommunityController]);

    function CommunityController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.activeSection = 'overview';
        vm.selectedWard = 'Kalkaji';
        vm.mapView = 'ward';
        vm.advisoryFilter = 'all';
        
        // Header Stats
        vm.stats = {
            healthScore: 78,
            activeParticipants: '342',
            recentReports: 24
        };
        
        // Participation Data
        vm.participation = {
            points: 120,
            rank: 'Top 15%'
        };
        
        vm.earnedBadges = [
            { name: 'Grid Supporter', icon: 'zap' },
            { name: 'Water Steward', icon: 'droplet' },
            { name: 'Community Leader', icon: 'award' }
        ];
        
        // Active Challenges
        vm.activeChallenges = [
            {
                name: 'Peak Hour Saver',
                type: 'elec',
                icon: 'zap',
                progress: 40,
                daysLeft: 3
            }
        ];
        
        // Advisories Data
        vm.advisories = [
            {
                id: 1,
                priority: 'urgent',
                utility: 'elec',
                utilityIcon: 'zap',
                title: 'Planned Maintenance - Block C',
                description: 'Transformer upgrade work scheduled. Power supply will be interrupted.',
                issuedBy: 'BRPL',
                validTill: 'Valid till: 20 Jan 2026',
                affectedArea: 'Block C, Kalkaji'
            },
            {
                id: 2,
                priority: 'info',
                utility: 'water',
                utilityIcon: 'droplet',
                title: 'Winter Water Supply Schedule',
                description: 'Morning supply hours adjusted for winter season.',
                issuedBy: 'DJB',
                validTill: 'Seasonal',
                affectedArea: 'All blocks'
            },
            {
                id: 3,
                priority: 'info',
                utility: 'gas',
                utilityIcon: 'flame',
                title: 'Safety Inspection Drive',
                description: 'Free gas connection safety inspection available for all households.',
                issuedBy: 'IGL',
                validTill: 'Valid till: 28 Feb 2026',
                affectedArea: 'Ward-wide'
            }
        ];
        
        vm.filteredAdvisories = vm.advisories;
        
        // Activity Feed
        vm.activityFeed = [
            {
                type: 'participation',
                icon: 'users',
                message: '<strong>38 households</strong> participated in "Peak Hour Saver" challenge yesterday.',
                timeAgo: '2 hours ago',
                actionable: true,
                likes: 12
            },
            {
                type: 'report',
                icon: 'wrench',
                message: '<strong>12 public water leaks</strong> reported and fixed in the last week.',
                timeAgo: '5 hours ago',
                location: 'Various blocks',
                actionable: true,
                likes: 8
            },
            {
                type: 'resolution',
                icon: 'check-circle',
                message: '<strong>5 power outages</strong> resolved faster than SLA due to community alerts.',
                timeAgo: '1 day ago',
                actionable: true,
                likes: 15
            },
            {
                type: 'achievement',
                icon: 'award',
                message: 'Ward achieved <strong>14% solar adoption</strong> - highest in South Delhi zone!',
                timeAgo: '2 days ago',
                actionable: true,
                likes: 24
            }
        ];
        
        vm.hasMoreActivity = true;
        
        // Comparison Metrics
        vm.comparisonMetrics = [
            {
                name: 'Avg Electricity Bill',
                icon: 'indian-rupee',
                ward: '₹1,150',
                wardTrend: 'down',
                zone: '₹1,300',
                city: '₹1,050'
            },
            {
                name: 'Water Reliability',
                icon: 'droplets',
                ward: '92%',
                wardTrend: 'up',
                zone: '88%',
                city: '85%'
            },
            {
                name: 'Solar Penetration',
                icon: 'sun',
                ward: '14%',
                wardTrend: 'up',
                zone: '10%',
                city: '8%'
            },
            {
                name: 'Power Cuts (hrs/month)',
                icon: 'power-off',
                ward: '1.2',
                wardTrend: 'up',
                zone: '2.1',
                city: '3.5'
            }
        ];

        // Methods
        vm.showSection = function(section) {
            vm.activeSection = section;
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 50);
        };
        
        vm.loadWardData = function() {
            vm.loading = true;
            // Simulate loading ward-specific data
            $timeout(function() {
                vm.loading = false;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 500);
        };
        
        vm.changeMapView = function(view) {
            vm.mapView = view;
        };
        
        vm.showBlockDetails = function(block) {
            console.log('Show details for block:', block);
            // Implementation for showing block details
        };
        
        vm.joinChallenge = function(challengeId) {
            console.log('Joining challenge:', challengeId);
            // Implementation for joining challenge
        };
        
        vm.reportLeak = function() {
            console.log('Report leak');
            // Navigate to services page with leak report pre-filled
            window.location.href = '#!/services';
        };
        
        vm.startSafetyChecklist = function() {
            console.log('Start safety checklist');
            // Implementation for safety checklist
        };
        
        vm.filterAdvisories = function(filter) {
            vm.advisoryFilter = filter;
            if (filter === 'all') {
                vm.filteredAdvisories = vm.advisories;
            } else {
                vm.filteredAdvisories = vm.advisories.filter(function(advisory) {
                    return advisory.utility === filter;
                });
            }
        };
        
        vm.viewAdvisoryDetails = function(advisory) {
            console.log('View advisory details:', advisory);
            // Implementation for viewing advisory details
        };
        
        vm.likeActivity = function(activity) {
            activity.likes = (activity.likes || 0) + 1;
        };
        
        vm.loadMoreActivity = function() {
            console.log('Load more activity');
            // Implementation for loading more activity
        };
        
        vm.exportInsights = function() {
            console.log('Export insights data');
            // Implementation for exporting insights
        };

        function init() {
            loadCommunityData();
            // Initialize Lucide icons
            $timeout(function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 100);
        }

        function loadCommunityData() {
            ApiService.getCommunityData()
                .then(function(response) {
                    if (response.data) {
                        // Merge API data if available
                        angular.extend(vm, response.data);
                    }
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
