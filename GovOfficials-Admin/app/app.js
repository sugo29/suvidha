/**
 * Government Dashboard - AngularJS Application
 * Suvidha City Control Room
 */

var app = angular.module('govDashboardApp', ['ngRoute']);

// Route Configuration
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: './app/views/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/grievance', {
            templateUrl: './app/views/grievance.html',
            controller: 'GrievanceController'
        })
        .when('/meter', {
            templateUrl: './app/views/meter.html',
            controller: 'MeterController'
        })
        .when('/rwa', {
            templateUrl: './app/views/rwa.html',
            controller: 'RWAController'
        })
        .when('/participation', {
            templateUrl: './app/views/participation.html',
            controller: 'ParticipationController'
        })
        .when('/policy', {
            templateUrl: './app/views/policy.html',
            controller: 'PolicyController'
        })
        .when('/audit', {
            templateUrl: './app/views/audit.html',
            controller: 'AuditController'
        })
        .when('/settings', {
            templateUrl: './app/views/settings.html',
            controller: 'SettingsController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

// Main Controller (Handles sidebar and common functionality)
app.controller('MainController', ['$scope', '$location', function ($scope, $location) {
    $scope.currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    $scope.user = {
        name: 'Rajesh Kumar',
        initials: 'RK',
        role: 'Government Official',
        lastLogin: 'Today, 09:30 AM'
    };

    $scope.notifications = 5;

    $scope.isActive = function (path) {
        return $location.path() === path;
    };

    $scope.getPageTitle = function () {
        var path = $location.path();
        var titles = {
            '/': 'Dashboard',
            '/grievance': 'Grievance Command',
            '/meter': 'Meter Integrity',
            '/rwa': 'RWA Oversight',
            '/participation': 'Participation & Incentives',
            '/policy': 'Policy Insights',
            '/audit': 'Audit Vault',
            '/settings': 'Settings & Configuration'
        };
        return titles[path] || 'Dashboard';
    };

    $scope.logout = function () {
        alert('Logging out...');
        // Add logout logic here
    };
}]);

// Dashboard Controller
app.controller('DashboardController', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.cityStats = {
        activeComplaints: 1247,
        slaBreaches: 23,
        stressAreas: 8,
        activeOutages: 3
    };

    $scope.chartPeriod = '7days';

    $scope.setChartPeriod = function (period) {
        $scope.chartPeriod = period;
    };

    $scope.actionAlerts = [
        { type: 'danger', icon: '🔴', text: 'Complaint to 8762 breached SLA > 24 hrs' },
        { type: 'warning', icon: '🟠', text: "Ward'S electricity load > 80%" },
        { type: 'info', icon: '🟡', text: 'Billing sync delayed > 1 hr' }
    ];

    $scope.revenueStats = {
        todayCollections: '12.5L',
        monthToDate: '2.18Cr',
        fcay: '54.6L',
        pending: '4.60L',
        syncAlerts: 2
    };

    // Initialize charts after view loads
    $timeout(function () {
        initDashboardCharts();
    }, 300);
}]);

// Grievance Controller
app.controller('GrievanceController', ['$scope', function ($scope) {
    $scope.stats = {
        pending: 89,
        slaRisk: 34,
        escalated: 12,
        resolved: 156
    };

    $scope.grievances = [
        { id: 'GRV-2024-001', utility: '⚡ Electricity', ward: 'Ward 15', severity: 'High', severityClass: 'danger', slaTime: '2h 15m', slaClass: 'critical', status: 'In Progress', statusClass: 'warning' },
        { id: 'GRV-2024-002', utility: '💧 Water', ward: 'Ward 8', severity: 'Medium', severityClass: 'warning', slaTime: '5h 30m', slaClass: 'warning', status: 'Assigned', statusClass: 'info' },
        { id: 'GRV-2024-003', utility: '🔥 Gas', ward: 'Ward 22', severity: 'Critical', severityClass: 'danger', slaTime: '0h 45m', slaClass: 'critical', status: 'Escalated', statusClass: 'danger' },
        { id: 'GRV-2024-004', utility: '⚡ Electricity', ward: 'Ward 3', severity: 'Low', severityClass: 'success', slaTime: '18h 00m', slaClass: 'safe', status: 'Pending', statusClass: 'info' },
        { id: 'GRV-2024-005', utility: '💧 Water', ward: 'Ward 11', severity: 'High', severityClass: 'danger', slaTime: '1h 20m', slaClass: 'critical', status: 'In Progress', statusClass: 'warning' }
    ];

    $scope.selectedGrievance = null;

    $scope.viewGrievance = function (grievance) {
        $scope.selectedGrievance = grievance;
    };

    $scope.closeDrawer = function () {
        $scope.selectedGrievance = null;
    };
}]);

// Meter Controller
app.controller('MeterController', ['$scope', function ($scope) {
    $scope.stats = {
        verified: 342,
        review: 28,
        suspicious: 7,
        aiConfidence: 94
    };

    $scope.meterReadings = [
        { id: 'MTR-8847', location: 'Block A, Sector 15', reading: '4,521', confidence: 98, confidenceClass: 'success', status: 'Verified', statusClass: 'success', time: '10:45 AM' },
        { id: 'MTR-8848', location: 'Block C, Sector 12', reading: '2,187', confidence: 76, confidenceClass: 'warning', status: 'Review', statusClass: 'warning', time: '10:32 AM' },
        { id: 'MTR-8849', location: 'Block B, Sector 8', reading: '9,834', confidence: 45, confidenceClass: 'danger', status: 'Suspicious', statusClass: 'danger', time: '10:15 AM' },
        { id: 'MTR-8850', location: 'Block D, Sector 22', reading: '3,456', confidence: 92, confidenceClass: 'success', status: 'Verified', statusClass: 'success', time: '09:58 AM' },
        { id: 'MTR-8851', location: 'Block A, Sector 7', reading: '6,789', confidence: 88, confidenceClass: 'success', status: 'Verified', statusClass: 'success', time: '09:45 AM' },
        { id: 'MTR-8852', location: 'Block E, Sector 19', reading: '1,234', confidence: 62, confidenceClass: 'warning', status: 'Review', statusClass: 'warning', time: '09:30 AM' }
    ];

    $scope.approveMeter = function (meter) {
        meter.status = 'Verified';
        meter.statusClass = 'success';
        meter.confidence = 100;
        meter.confidenceClass = 'success';
    };

    $scope.reverifyMeter = function (meter) {
        meter.status = 'Re-verifying';
        meter.statusClass = 'info';
    };
}]);

// RWA Controller
app.controller('RWAController', ['$scope', function ($scope) {
    $scope.stats = {
        total: 45,
        completed: 28,
        inProgress: 12,
        delayed: 5
    };

    $scope.projects = [
        { name: 'Park Renovation - Sector 15', allocated: '12,00,000', purpose: 'Green Spaces', deadline: 'Mar 15, 2026', progress: 75, progressClass: 'success', status: 'On Track', statusClass: 'success', rwa: 'Sector 15 RWA' },
        { name: 'Street Light Installation', allocated: '8,50,000', purpose: 'Infrastructure', deadline: 'Feb 28, 2026', progress: 45, progressClass: 'warning', status: 'Delayed', statusClass: 'danger', rwa: 'Ward 8 RWA' },
        { name: 'Community Hall Repair', allocated: '5,25,000', purpose: 'Maintenance', deadline: 'Apr 10, 2026', progress: 90, progressClass: 'success', status: 'Near Complete', statusClass: 'success', rwa: 'Block C RWA' },
        { name: 'Water Tank Construction', allocated: '15,00,000', purpose: 'Water Supply', deadline: 'May 20, 2026', progress: 30, progressClass: 'info', status: 'In Progress', statusClass: 'info', rwa: 'Sector 22 RWA' },
        { name: 'Drainage System Upgrade', allocated: '20,00,000', purpose: 'Sanitation', deadline: 'Jun 30, 2026', progress: 15, progressClass: 'info', status: 'Started', statusClass: 'info', rwa: 'Ward 11 RWA' },
        { name: 'Playground Equipment', allocated: '4,75,000', purpose: 'Recreation', deadline: 'Mar 25, 2026', progress: 60, progressClass: 'warning', status: 'In Progress', statusClass: 'warning', rwa: 'Block B RWA' }
    ];
}]);

// Participation Controller
app.controller('ParticipationController', ['$scope', function ($scope) {
    // Engagement Health Score Calculation
    var calculateEHS = function() {
        var participationRate = 78;
        var repeatParticipation = 65;
        var abuseFlags = 92;
        var completionRate = 88;
        return Math.round((participationRate + repeatParticipation + abuseFlags + completionRate) / 4);
    };

    $scope.stats = {
        totalParticipants: 45678,
        activeSchemes: 12,
        pendingRedemptions: 47,
        abuseAlerts: 3,
        engagementHealthScore: calculateEHS()
    };

    // Generate ward heatmap with detailed data
    $scope.wards = [];
    var levels = ['low', 'medium', 'high', 'very-high'];
    var trends = ['+2.3%', '-1.5%', '+4.2%', '+0.9%'];
    for (var i = 1; i <= 32; i++) {
        var level = levels[Math.floor(Math.random() * 4)];
        var participation = Math.floor(Math.random() * 100);
        $scope.wards.push({
            id: i,
            level: level,
            participation: participation,
            trend: trends[Math.floor(Math.random() * 4)],
            topScheme: ['Water Saving Bonus', 'Waste Segregation', 'Electricity Efficiency'][Math.floor(Math.random() * 3)],
            avgPointsPerCitizen: Math.floor(Math.random() * 500) + 100,
            abuseRiskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        });
    }

    // Scheme Performance Data
    $scope.schemePerformance = [
        {
            name: 'Water Saving Bonus',
            activeWards: 28,
            participation: '82%',
            costPerEngagement: '₹12.50',
            status: 'High Impact',
            statusClass: 'success',
            abuseRate: 'Low'
        },
        {
            name: 'Waste Segregation Initiative',
            activeWards: 24,
            participation: '65%',
            costPerEngagement: '₹18.75',
            status: 'Medium Impact',
            statusClass: 'warning',
            abuseRate: 'Medium'
        },
        {
            name: 'Electricity Efficiency Program',
            activeWards: 20,
            participation: '58%',
            costPerEngagement: '₹22.30',
            status: 'Medium Impact',
            statusClass: 'warning',
            abuseRate: 'High'
        },
        {
            name: 'Community Health Reporting',
            activeWards: 15,
            participation: '42%',
            costPerEngagement: '₹35.50',
            status: 'Low Impact',
            statusClass: 'danger',
            abuseRate: 'Low'
        }
    ];

    // Enhanced redemptions with masked identities
    $scope.redemptions = [
        { user: 'Amit S.', reward: 'Movie Ticket', points: 500, date: 'Feb 8, 2026', ward: 'Ward 12', verified: true },
        { user: 'Priya S.', reward: 'Shopping Voucher', points: 1000, date: 'Feb 8, 2026', ward: 'Ward 5', verified: true },
        { user: 'Rahul V.', reward: 'Bus Pass', points: 750, date: 'Feb 7, 2026', ward: 'Ward 18', verified: true },
        { user: 'Sunita D.', reward: 'Electricity Credit', points: 1500, date: 'Feb 7, 2026', ward: 'Ward 8', verified: true }
    ];

    // Enhanced abuse alerts with actions
    $scope.abuseAlerts = [
        {
            type: 'Multiple Accounts',
            description: 'Same device detected for 5 accounts',
            ward: 'Ward 18',
            severity: 'high',
            pattern: 'Device-based clustering',
            actions: [
                { label: '🔍 Review Pattern', action: 'review' },
                { label: '⏸ Pause Scheme', action: 'pause' },
                { label: '📝 Add Remark', action: 'remark' }
            ]
        },
        {
            type: 'Unusual Activity',
            description: 'Rapid point accumulation pattern',
            ward: 'Ward 7',
            severity: 'medium',
            pattern: 'Temporal anomaly',
            actions: [
                { label: '🔍 Review Pattern', action: 'review' },
                { label: '⏸ Pause Scheme', action: 'pause' },
                { label: '📝 Add Remark', action: 'remark' }
            ]
        },
        {
            type: 'Suspicious Redemption',
            description: 'Multiple high-value redemptions',
            ward: 'Ward 22',
            severity: 'low',
            pattern: 'Value-based spike',
            actions: [
                { label: '🔍 Review Pattern', action: 'review' },
                { label: '⏸ Pause Scheme', action: 'pause' },
                { label: '📝 Add Remark', action: 'remark' }
            ]
        }
    ];

    // Policy Actions Recommendations
    $scope.policyActions = [
        {
            title: 'Increase Water-Saving Incentives',
            description: 'Wards 3, 15, 22 show low participation rates',
            recommendation: 'Boost point multiplier by 20% for Q1',
            priority: 'high'
        },
        {
            title: 'Pause Waste Segregation in Ward 7',
            description: 'Unusual activity detected; abuse risk elevated',
            recommendation: 'Restrict redemptions pending investigation',
            priority: 'high'
        },
        {
            title: 'Expand Electricity Program',
            description: 'Strong demand in 20 wards; resource-efficient',
            recommendation: 'Roll out to remaining 8 wards',
            priority: 'medium'
        }
    ];

    // Interactive ward drawer state
    $scope.selectedWard = null;
    $scope.showWardDetails = false;

    $scope.selectWard = function(ward) {
        $scope.selectedWard = ward;
        $scope.showWardDetails = true;
    };

    $scope.closeWardDetails = function() {
        $scope.showWardDetails = false;
        $scope.selectedWard = null;
    };

    // Action handlers
    $scope.handleAlertAction = function(alert, action) {
        console.log('Action ' + action + ' on alert: ' + alert.type);
        // Will integrate with backend API
    };

    $scope.handlePolicyAction = function(action) {
        console.log('Executing policy action: ' + action.title);
        // Will integrate with backend API
    };
}]);

// Policy Controller
app.controller('PolicyController', ['$scope', '$timeout', function ($scope, $timeout) {
    // Policy Summary - Key insights
    $scope.policySummary = {
        keyInsight: 'Complaint volume reduced by 28% over 6 months, driven primarily by faster electricity issue resolution in high-performing wards.',
        riskAlert: 'Water-related complaints show slower improvement in low-performing wards (Wards 3, 11).',
        opportunity: 'Implementing best practices from Ward 15 (Rohini) could improve average satisfaction by 8-12%.',
        trend: 'positive'
    };

    // Enhanced Ward Rankings with explanations
    $scope.wardRankings = [
        {
            name: 'Ward 15 - Rohini',
            resolved: 234,
            avgTime: '4.2 hrs',
            satisfaction: 92,
            score: 'A+',
            scoreClass: 'success',
            explanation: 'High resolution rate • Low SLA breaches • Superior citizen satisfaction',
            participationScore: 87,
            waterComplaints: 12,
            electricityComplaints: 45,
            gasComplaints: 8,
            trend: '+4.3%'
        },
        {
            name: 'Ward 8 - Dwarka',
            resolved: 198,
            avgTime: '5.1 hrs',
            satisfaction: 88,
            score: 'A',
            scoreClass: 'success',
            explanation: 'Good resolution efficiency • Consistent performance • Strong citizen feedback',
            participationScore: 78,
            waterComplaints: 18,
            electricityComplaints: 52,
            gasComplaints: 12,
            trend: '+2.1%'
        },
        {
            name: 'Ward 22 - Saket',
            resolved: 176,
            avgTime: '6.3 hrs',
            satisfaction: 82,
            score: 'B+',
            scoreClass: 'info',
            explanation: 'Moderate performance • Room for improvement • Above average',
            participationScore: 65,
            waterComplaints: 35,
            electricityComplaints: 38,
            gasComplaints: 15,
            trend: '+0.9%'
        },
        {
            name: 'Ward 3 - Civil Lines',
            resolved: 145,
            avgTime: '7.8 hrs',
            satisfaction: 75,
            score: 'B',
            scoreClass: 'warning',
            explanation: 'Slower resolution times • Lower satisfaction • Needs intervention',
            participationScore: 42,
            waterComplaints: 68,
            electricityComplaints: 35,
            gasComplaints: 22,
            trend: '-1.2%'
        },
        {
            name: 'Ward 11 - Lajpat Nagar',
            resolved: 132,
            avgTime: '8.5 hrs',
            satisfaction: 70,
            score: 'B-',
            scoreClass: 'warning',
            explanation: 'Slowest resolution • Below-target satisfaction • Critical improvements needed',
            participationScore: 38,
            waterComplaints: 82,
            electricityComplaints: 28,
            gasComplaints: 18,
            trend: '-3.5%'
        }
    ];

    // Policy Impact Correlation Analysis
    $scope.policyImpacts = [
        {
            policy: 'Water-Saving Incentive Program',
            participationLink: 'Wards with 70%+ participation show 35% fewer water complaints',
            impactMetric: '-3.5 complaints/month',
            effectiveness: 'High'
        },
        {
            policy: 'Electricity Efficiency Initiative',
            participationLink: 'Active participants report 42% faster electricity issue resolution',
            impactMetric: '-1.2 hrs avg time',
            effectiveness: 'High'
        },
        {
            policy: 'Community Engagement Program',
            participationLink: 'High participation wards show 18% higher satisfaction scores',
            impactMetric: '+8.2% satisfaction',
            effectiveness: 'Medium'
        }
    ];

    // What-If Policy Scenarios
    $scope.scenarios = [
        {
            title: 'Increase Incentives in Low-Performing Wards',
            assumption: 'Boost point multiplier by 20% for Wards 3, 11',
            expectedImpact: '+12% participation, -2.5 hrs avg resolution time',
            confidence: '85%',
            riskLevel: 'Low'
        },
        {
            title: 'Add More Meter Verification Teams',
            assumption: '2 additional verification teams in high-water-complaint wards',
            expectedImpact: '-25% water complaints, +18% satisfaction',
            confidence: '78%',
            riskLevel: 'Low'
        },
        {
            title: 'Reduce SLA Thresholds by 1 Hour',
            assumption: 'All grievances must be resolved within 24 hours (down from 25)',
            expectedImpact: '+15% operational cost, +6% satisfaction',
            confidence: '72%',
            riskLevel: 'Medium'
        }
    ];

    // Recommended Policy Actions
    $scope.recommendedActions = [
        {
            priority: 'high',
            title: 'Expand Best Practices from Ward 15',
            description: 'Ward 15 (Rohini) demonstrates excellence. Document and share their operational model.',
            expectedOutcome: 'Could improve average satisfaction by 8-12% across low-performing wards',
            status: 'pending'
        },
        {
            priority: 'high',
            title: 'Prioritise Water Infrastructure in Wards 3 & 11',
            description: 'Water complaints represent 45-48% of grievances in these wards.',
            expectedOutcome: 'Reduce complaint volume by 30-40%, improve satisfaction by 12-15%',
            status: 'pending'
        },
        {
            priority: 'medium',
            title: 'Launch Targeted Incentive Campaign',
            description: 'Focus on low-participation wards (target: 50%+ participation by Q2).',
            expectedOutcome: 'Increase community engagement, accelerate complaint resolution',
            status: 'pending'
        },
        {
            priority: 'medium',
            title: 'Review SLA Policies for Gas Services',
            description: 'Gas complaint resolution time averages 9.2 hrs; industry standard is 6 hrs.',
            expectedOutcome: 'Standardise response times, improve emergency preparedness',
            status: 'pending'
        }
    ];

    // Toggle explanation visibility
    $scope.selectedWardForExplanation = null;
    $scope.toggleExplanation = function(wardIndex) {
        if ($scope.selectedWardForExplanation === wardIndex) {
            $scope.selectedWardForExplanation = null;
        } else {
            $scope.selectedWardForExplanation = wardIndex;
        }
    };

    // Action handlers
    $scope.approveAction = function(action) {
        action.status = 'approved';
        console.log('Action approved: ' + action.title);
    };

    $scope.exploreScenario = function(scenario) {
        console.log('Exploring scenario: ' + scenario.title);
        // Would open detailed scenario analysis modal
    };

    $timeout(function () {
        initPolicyCharts();
    }, 300);
}]);

// Audit Controller
app.controller('AuditController', ['$scope', function ($scope) {
    // Enhanced log data with forensic detail
    $scope.logs = [
        {
            id: 'LOG-20260208-00001',
            icon: '✅',
            action: 'Grievance Resolved',
            official: 'S. Kumar (ID: GOV-1234)',
            department: 'Grievance Management',
            reason: 'Issue fixed on-site inspection',
            date: 'Feb 8, 2026',
            time: '11:45 AM',
            timestamp: '2026-02-08T11:45:00Z',
            type: 'success',
            source: 'Manual',
            relatedId: 'GRV-2026-045821',
            impact: 'Complaint Closed',
            severity: 'Normal'
        },
        {
            id: 'LOG-20260208-00002',
            icon: '⬆️',
            action: 'Complaint Escalated',
            official: 'R. Singh (ID: GOV-1567)',
            department: 'Grievance Management',
            reason: 'SLA breach imminent - priority upgrade',
            date: 'Feb 8, 2026',
            time: '10:30 AM',
            timestamp: '2026-02-08T10:30:00Z',
            type: 'warning',
            source: 'Manual',
            relatedId: 'GRV-2026-045798',
            impact: 'Escalation Triggered',
            severity: 'High'
        },
        {
            id: 'LOG-20260207-00003',
            icon: '📝',
            action: 'Policy Updated',
            official: 'Admin (ID: GOV-0001)',
            department: 'Policy Administration',
            reason: 'New SLA guidelines implementation',
            date: 'Feb 7, 2026',
            time: '04:15 PM',
            timestamp: '2026-02-07T16:15:00Z',
            type: 'info',
            source: 'Manual',
            relatedId: 'POLICY-2026-00012',
            impact: 'SLA Thresholds Updated',
            severity: 'Normal'
        },
        {
            id: 'LOG-20260207-00004',
            icon: '🔒',
            action: 'Access Revoked',
            official: 'Security (ID: SEC-0012)',
            department: 'Security & Access Control',
            reason: 'Account security protocol - Inactivity timeout',
            date: 'Feb 7, 2026',
            time: '02:00 PM',
            timestamp: '2026-02-07T14:00:00Z',
            type: 'danger',
            source: 'System (AUTO)',
            relatedId: 'USER-2026-GOV-5432',
            impact: 'Access Denied',
            severity: 'High'
        },
        {
            id: 'LOG-20260207-00005',
            icon: '💳',
            action: 'Payment Verified',
            official: 'A. Patel (ID: GOV-2890)',
            department: 'Finance & Billing',
            reason: 'Manual verification completed',
            date: 'Feb 7, 2026',
            time: '11:20 AM',
            timestamp: '2026-02-07T11:20:00Z',
            type: 'success',
            source: 'Manual',
            relatedId: 'PAY-2026-00156',
            impact: 'Payment Confirmed',
            severity: 'Normal'
        },
        {
            id: 'LOG-20260206-00006',
            icon: '📊',
            action: 'Report Generated',
            official: 'System (AUTO)',
            department: 'Analytics & Reporting',
            reason: 'Weekly analytics report generation',
            date: 'Feb 6, 2026',
            time: '06:00 AM',
            timestamp: '2026-02-06T06:00:00Z',
            type: 'info',
            source: 'System (AUTO)',
            relatedId: 'RPT-2026-W06',
            impact: 'Report Available',
            severity: 'Normal'
        },
        {
            id: 'LOG-20260206-00007',
            icon: '🔄',
            action: 'Data Sync Completed',
            official: 'System (AUTO)',
            department: 'Database Administration',
            reason: 'Daily database synchronization',
            date: 'Feb 6, 2026',
            time: '12:00 AM',
            timestamp: '2026-02-06T00:00:00Z',
            type: 'info',
            source: 'System (AUTO)',
            relatedId: 'SYNC-2026-D06',
            impact: 'Data Synchronized',
            severity: 'Normal'
        },
        {
            id: 'LOG-20260205-00008',
            icon: '⚡',
            action: 'System Configuration Changed',
            official: 'Admin (ID: GOV-0001)',
            department: 'System Administration',
            reason: 'Updated complaint triage rules for electricity category',
            date: 'Feb 5, 2026',
            time: '03:30 PM',
            timestamp: '2026-02-05T15:30:00Z',
            type: 'warning',
            source: 'Manual',
            relatedId: 'CONFIG-2026-00089',
            impact: 'Configuration Modified',
            severity: 'Medium'
        }
    ];

    // Filter state
    $scope.filterType = 'all';
    $scope.filterActionType = 'all';
    $scope.filterSource = 'all';
    $scope.selectedDateRange = 'all'; // all, today, week, month

    // Get unique values for filters
    $scope.uniqueActionTypes = ['All', ...new Set($scope.logs.map(log => log.action))];
    $scope.uniqueSources = ['All', 'Manual', 'System (AUTO)'];

    // Apply filters
    $scope.setFilter = function (type) {
        $scope.filterType = type;
    };

    $scope.setActionFilter = function (action) {
        $scope.filterActionType = action;
    };

    $scope.setSourceFilter = function (source) {
        $scope.filterSource = source;
    };

    $scope.setDateRange = function (range) {
        $scope.selectedDateRange = range;
    };

    // Master filter function
    $scope.filterLogs = function (log) {
        // Type filter (success, warning, danger, info, all)
        if ($scope.filterType !== 'all' && log.type !== $scope.filterType) {
            return false;
        }

        // Action filter
        if ($scope.filterActionType !== 'All' && log.action !== $scope.filterActionType) {
            return false;
        }

        // Source filter (Manual vs System)
        if ($scope.filterSource !== 'all' && log.source !== $scope.filterSource) {
            return false;
        }

        return true;
    };

    // Export functionality
    $scope.exportAuditLog = function (format) {
        var filteredLogs = $scope.logs.filter($scope.filterLogs);

        if (format === 'csv') {
            // CSV Export
            var csvContent = 'Log ID,Timestamp,Action,Official,Department,Reason,Type,Source,Related ID,Impact\n';
            filteredLogs.forEach(function (log) {
                csvContent += `"${log.id}","${log.timestamp}","${log.action}","${log.official}","${log.department}","${log.reason}","${log.type}","${log.source}","${log.relatedId}","${log.impact}"\n`;
            });

            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement('a');
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'audit-log-' + new Date().getTime() + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Audit log exported to CSV');
        } else if (format === 'pdf') {
            // PDF Export (simplified)
            var pdfContent = 'AUDIT LOG EXPORT\n';
            pdfContent += 'Generated: ' + new Date().toLocaleDateString('en-IN') + '\n';
            pdfContent += 'Status: Append-Only, Immutable Record\n\n';

            filteredLogs.forEach(function (log) {
                pdfContent += '─────────────────────────────────────\n';
                pdfContent += 'LOG ID: ' + log.id + '\n';
                pdfContent += 'Timestamp: ' + log.timestamp + '\n';
                pdfContent += 'Action: ' + log.action + '\n';
                pdfContent += 'Official: ' + log.official + '\n';
                pdfContent += 'Department: ' + log.department + '\n';
                pdfContent += 'Reason: ' + log.reason + '\n';
                pdfContent += 'Source: ' + log.source + '\n';
                pdfContent += 'Related ID: ' + log.relatedId + '\n';
                pdfContent += 'Impact: ' + log.impact + '\n';
            });

            var blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
            var link = document.createElement('a');
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'audit-log-' + new Date().getTime() + '.txt');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Audit log exported as text (PDF export available in production)');
        }
    };

    // Log details drawer
    $scope.selectedLogEntry = null;
    $scope.showLogDetails = false;

    $scope.viewLogDetails = function (log) {
        $scope.selectedLogEntry = log;
        $scope.showLogDetails = true;
    };

    $scope.closeLogDetails = function () {
        $scope.showLogDetails = false;
        $scope.selectedLogEntry = null;
    };

    // Get log detail context (simulated)
    $scope.getLogContext = function (log) {
        return {
            relatedGrievance: 'GRV-' + log.relatedId,
            previousState: 'Open',
            newState: log.impact,
            changeReason: log.reason,
            approvalStatus: 'Verified',
            verifiedBy: 'System',
            verifiedTime: log.timestamp
        };
    };
}]);

// Settings Controller - Government-Compliant with Governance Enforcement
app.controller('SettingsController', ['$scope', function ($scope) {
    // Initialize settings object with government-grade enforcement
    $scope.settings = {
        profile: {
            fullName: 'Rajesh Kumar',
            email: 'rajesh.kumar@gov.in',
            phone: '+91-9876543210',
            department: 'grievance',
            departmentName: 'Grievance Management'  // Read-only display
        },
        security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            twoFactorAuth: true  // MANDATORY - Cannot be changed
        },
        notifications: {
            emailAlerts: true,
            smsAlerts: true,
            mandatorySlaBreachAlerts: true,       // MANDATORY - Locked
            mandatoryIntegrityAlerts: true,        // MANDATORY - Locked
            mandatorySecurityAlerts: true,         // MANDATORY - Locked
            dailyReport: true,
            frequency: 'immediate'
        },
        display: {
            theme: 'light',  // LOCKED - Government standard
            language: 'en',
            dateFormat: 'dd/mm/yyyy',
            compactView: false
        },
        api: {
            key: 'sk_live_••••••••••••••••••••••••••',  // Masked for security
            webhooksStatus: 'Centrally Managed (Read-Only)',  // LOCKED
            webhookUrl: '(Managed by System Administration)'   // LOCKED
        }
    };

    // System information
    $scope.systemInfo = {
        version: '2.1.0',
        lastUpdated: 'Feb 5, 2026',
        dbStatus: 'Connected',
        serverStatus: 'Operational',
        lastBackup: 'Feb 8, 2026 - 02:00 AM'
    };

    // Data governance and compliance
    $scope.dataGovernance = {
        retentionPolicy: '7-Year Mandatory Retention',
        auditConsent: true,  // Cannot be unchecked
        dataRetentionMonths: 84  // 7 years
    };

    // Save profile settings (only name, email, phone - NOT department)
    $scope.saveProfileSettings = function () {
        // Department change not allowed here - would require admin approval
        $scope.successMessage = {
            type: 'success',
            text: '✓ Profile settings saved successfully. Department change requires administrator approval.'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Change password
    $scope.changePassword = function () {
        if ($scope.settings.security.newPassword !== $scope.settings.security.confirmPassword) {
            $scope.successMessage = {
                type: 'error',
                text: '✗ Passwords do not match'
            };
            return;
        }
        $scope.successMessage = {
            type: 'success',
            text: '✓ Password changed successfully. Change logged in Audit Vault.'
        };
        $scope.settings.security.currentPassword = '';
        $scope.settings.security.newPassword = '';
        $scope.settings.security.confirmPassword = '';
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Save notification settings - enforce mandatory alerts
    $scope.saveNotificationSettings = function () {
        // Force mandatory alerts to always be true (governance enforcement)
        $scope.settings.notifications.mandatorySlaBreachAlerts = true;
        $scope.settings.notifications.mandatoryIntegrityAlerts = true;
        $scope.settings.notifications.mandatorySecurityAlerts = true;

        $scope.successMessage = {
            type: 'success',
            text: '✓ Notification preferences saved. Mandatory critical alerts always active.'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Save display settings (theme is locked)
    $scope.saveDisplaySettings = function () {
        // Enforce government theme (cannot change from light)
        $scope.settings.display.theme = 'light';

        $scope.successMessage = {
            type: 'success',
            text: '✓ Display settings updated. Theme locked to Government Standard.'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Check for updates
    $scope.checkUpdates = function () {
        $scope.successMessage = {
            type: 'info',
            text: 'ℹ You are running the latest version'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Generate compliance report
    $scope.generateComplianceReport = function () {
        var report = 'COMPLIANCE REPORT\n';
        report += 'Generated: ' + new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN') + '\n\n';
        report += 'OFFICIAL: ' + $scope.settings.profile.fullName + '\n';
        report += 'EMAIL: ' + $scope.settings.profile.email + '\n';
        report += 'DEPARTMENT: ' + $scope.settings.profile.departmentName + '\n\n';
        report += 'SECURITY COMPLIANCE:\n';
        report += '✓ Two-Factor Authentication: ENABLED (Mandatory)\n';
        report += '✓ Critical Alerts: ALL ACTIVE (Mandatory)\n';
        report += '✓ Theme: Government Standard (Locked)\n';
        report += '✓ Data Retention: 7-Year Policy (Locked)\n\n';
        report += 'SYSTEM GOVERNANCE:\n';
        report += '✓ API Management: Centrally Controlled\n';
        report += '✓ Integration Changes: Require Admin Approval\n';
        report += '✓ All Changes: Logged in Audit Vault\n\n';
        report += 'GOVERNANCE STATEMENT:\n';
        report += 'All locked settings are centrally managed for government compliance,\n';
        report += 'data integrity, and accountability.\n';

        var blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'compliance-report-' + new Date().getTime() + '.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $scope.successMessage = {
            type: 'success',
            text: '✓ Compliance report generated and downloaded'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Download audit trail
    $scope.downloadAuditTrail = function () {
        var trail = 'AUDIT TRAIL - SETTINGS CHANGES\n';
        trail += 'Generated: ' + new Date().toLocaleDateString('en-IN') + '\n';
        trail += 'Official: ' + $scope.settings.profile.fullName + '\n\n';
        trail += 'RECENT ACTIVITY:\n';
        trail += '─────────────────────────────────────\n';
        trail += '[2026-02-08 02:30 PM] Password Changed by ' + $scope.settings.profile.fullName + '\n';
        trail += 'Source: Self-Service | Status: Success\n\n';
        trail += '[2026-02-08 09:15 AM] Settings Accessed\n';
        trail += 'Source: Web Portal | Device: Chrome/Windows\n\n';
        trail += '[2026-02-07 04:45 PM] Profile Updated\n';
        trail += 'Source: Self-Service | Changed: Email, Phone\n\n';
        trail += 'NOTE: All locked settings cannot be changed and are immutable.\n';
        trail += 'Any attempted modifications are logged as security events.\n';

        var blob = new Blob([trail], { type: 'text/plain;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'audit-trail-' + new Date().getTime() + '.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $scope.successMessage = {
            type: 'success',
            text: '✓ Audit trail downloaded'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Download governance report (renamed from downloadData for compliance)
    $scope.downloadData = function () {
        var report = 'GOVERNANCE & DATA REPORT\n';
        report += 'Generated: ' + new Date().toLocaleDateString('en-IN') + '\n';
        report += 'Official: ' + $scope.settings.profile.fullName + '\n\n';
        report += 'DATA RETENTION POLICY\n';
        report += '─────────────────────────────────────\n';
        report += 'All audit records, logs, and operational data are retained for 7 years\n';
        report += 'in compliance with government archival standards.\n\n';
        report += 'AUDIT CONSENT\n';
        report += '─────────────────────────────────────\n';
        report += 'I acknowledge that all my actions in this system are subject to audit\n';
        report += 'and compliance review. This consent cannot be withdrawn.\n\n';
        report += 'RECENT LOGIN HISTORY\n';
        report += '─────────────────────────────────────\n';
        report += '✓ Feb 8, 2026 - 02:30 PM | 192.168.1.105 | Chrome, Windows\n';
        report += '✓ Feb 8, 2026 - 09:15 AM | 192.168.1.105 | Safari, iPhone\n';
        report += '✗ Feb 7, 2026 - 04:45 PM | 192.168.1.112 | Chrome, Windows (FAILED)\n\n';
        report += 'COMPLIANCE STATUS: ✓ COMPLIANT\n';
        report += 'This report is read-only and for your records only.\n';

        var blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'governance-report-' + new Date().getTime() + '.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $scope.successMessage = {
            type: 'success',
            text: '✓ Governance report generated and downloaded'
        };
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.successMessage = null;
            });
        }, 3000);
    };

    // Prevent 2FA from being disabled - enforcement function
    $scope.$watch('settings.security.twoFactorAuth', function (newVal, oldVal) {
        if (newVal === false && oldVal === true) {
            // Prevent disabling 2FA
            $scope.settings.security.twoFactorAuth = true;
            $scope.successMessage = {
                type: 'error',
                text: '✗ Two-Factor Authentication is mandatory and cannot be disabled'
            };
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.successMessage = null;
                });
            }, 3000);
        }
    });

    // Prevent disabling mandatory critical alerts
    $scope.$watch('settings.notifications.mandatorySlaBreachAlerts', function (newVal, oldVal) {
        if (newVal === false && oldVal === true) {
            $scope.settings.notifications.mandatorySlaBreachAlerts = true;
            $scope.successMessage = {
                type: 'error',
                text: '✗ SLA Breach Alerts are mandatory for operational excellence'
            };
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.successMessage = null;
                });
            }, 2000);
        }
    });

    $scope.$watch('settings.notifications.mandatoryIntegrityAlerts', function (newVal, oldVal) {
        if (newVal === false && oldVal === true) {
            $scope.settings.notifications.mandatoryIntegrityAlerts = true;
            $scope.successMessage = {
                type: 'error',
                text: '✗ Integrity Alerts are mandatory for audit compliance'
            };
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.successMessage = null;
                });
            }, 2000);
        }
    });

    $scope.$watch('settings.notifications.mandatorySecurityAlerts', function (newVal, oldVal) {
        if (newVal === false && oldVal === true) {
            $scope.settings.notifications.mandatorySecurityAlerts = true;
            $scope.successMessage = {
                type: 'error',
                text: '✗ Security Alerts are mandatory for system governance'
            };
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.successMessage = null;
                });
            }, 2000);
        }
    });

    // Prevent theme from being changed to anything other than light
    $scope.$watch('settings.display.theme', function (newVal, oldVal) {
        if (newVal !== 'light' && oldVal === 'light') {
            $scope.settings.display.theme = 'light';
            $scope.successMessage = {
                type: 'error',
                text: '✗ Theme is locked to Government Standard (Light) for consistency'
            };
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.successMessage = null;
                });
            }, 2000);
        }
    });
}]);

// Chart Initialization Functions
function initDashboardCharts() {
    // Utility Consumption Chart
    var utilityCtx = document.getElementById('utilityChart');
    if (utilityCtx) {
        new Chart(utilityCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Electricity',
                        data: [65, 72, 68, 80, 75, 70, 78],
                        borderColor: '#f6ad55',
                        backgroundColor: 'rgba(246, 173, 85, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Water',
                        data: [45, 48, 52, 49, 53, 47, 50],
                        borderColor: '#63b3ed',
                        backgroundColor: 'rgba(99, 179, 237, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Gas',
                        data: [30, 32, 28, 35, 33, 31, 34],
                        borderColor: '#fc8181',
                        backgroundColor: 'rgba(252, 129, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function initPolicyCharts() {
    // Trend Chart
    var trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Complaints Trend',
                    data: [1200, 1150, 1080, 950, 890, 820],
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Comparison Chart
    var comparisonCtx = document.getElementById('comparisonChart');
    if (comparisonCtx) {
        new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: ['Electricity', 'Water', 'Gas'],
                datasets: [
                    { label: 'This Month', data: [450, 320, 180], backgroundColor: '#3182ce' },
                    { label: 'Last Month', data: [520, 380, 210], backgroundColor: '#a0aec0' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}
