/**
 * Senior Citizen Portal - AngularJS Application
 * Suvidha - Simple & Accessible Design
 */

var app = angular.module('seniorApp', ['ngRoute']);

// Route Configuration
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/bills', {
            templateUrl: 'views/bills.html',
            controller: 'BillsController'
        })
        .when('/pay', {
            templateUrl: 'views/pay.html',
            controller: 'PayController'
        })
        .when('/complaints', {
            templateUrl: 'views/complaints.html',
            controller: 'ComplaintsController'
        })
        .when('/updates', {
            templateUrl: 'views/updates.html',
            controller: 'UpdatesController'
        })
        .when('/settings', {
            templateUrl: 'views/settings.html',
            controller: 'SettingsController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

// Dashboard Controller
app.controller('DashboardController', ['$scope', function ($scope) {
    // User Data
    $scope.user = {
        name: 'Vikram Singh',
        initials: 'VS',
        phone: '+91 98765 43210'
    };

    // Current Date
    $scope.currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Status Data
    $scope.lastBillPaid = '12 Jan 2026';
    $scope.complaintsStatus = 'No pending complaints';
    $scope.hasPendingComplaints = false;
}]);

// Bills Controller
app.controller('BillsController', ['$scope', function ($scope) {
    $scope.bills = [
        { id: 1, type: 'Electricity', amount: 1250, dueDate: '15 Feb 2026', status: 'unpaid' },
        { id: 2, type: 'Water', amount: 450, dueDate: '20 Feb 2026', status: 'unpaid' },
        { id: 3, type: 'Gas', amount: 800, dueDate: '25 Feb 2026', status: 'paid' }
    ];
}]);

// Pay Controller
app.controller('PayController', ['$scope', function ($scope) {
    $scope.paymentMethods = [
        { id: 'upi', name: 'UPI Payment', icon: '📱' },
        { id: 'card', name: 'Debit/Credit Card', icon: '💳' },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
        { id: 'cash', name: 'Pay at Center', icon: '🏪' }
    ];
}]);

// Complaints Controller
app.controller('ComplaintsController', ['$scope', function ($scope) {
    $scope.complaints = [];
    $scope.complaintTypes = [
        { id: 'billing', name: 'Billing Issue', icon: '💵' },
        { id: 'service', name: 'Service Problem', icon: '🔧' },
        { id: 'meter', name: 'Meter Reading', icon: '📊' },
        { id: 'other', name: 'Other', icon: '📝' }
    ];
}]);

// Updates Controller
app.controller('UpdatesController', ['$scope', function ($scope) {
    $scope.updates = [
        { id: 1, title: 'Water Supply Maintenance', date: '10 Feb 2026', type: 'info' },
        { id: 2, title: 'New Payment Options Available', date: '8 Feb 2026', type: 'success' }
    ];
}]);

// Settings Controller
app.controller('SettingsController', ['$scope', function ($scope) {
    $scope.settings = {
        notifications: true,
        language: 'EN',
        fontSize: 16
    };
}]);

// Global Service for User Data
app.factory('UserService', function () {
    return {
        user: {
            name: 'Vikram Singh',
            initials: 'VS',
            phone: '+91 98765 43210'
        },
        isLoggedIn: true
    };
});
