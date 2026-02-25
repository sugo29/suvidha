// AngularJS Application Module
(function() {
    'use strict';

    angular.module('suvidhaApp', ['ngRoute', 'ngSanitize'])
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/landing', {
                    templateUrl: '/static/app/views/landing.html',
                    controller: 'AuthController',
                    controllerAs: 'vm',
                    requireAuth: false
                })
                .when('/auth', {
                    templateUrl: '/static/app/views/auth.html',
                    controller: 'AuthController',
                    controllerAs: 'vm',
                    requireAuth: false
                })
                .when('/', {
                    templateUrl: '/static/app/views/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/dashboard', {
                    templateUrl: '/static/app/views/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/utilities', {
                    templateUrl: '/static/app/views/utilities.html',
                    controller: 'UtilitiesController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/insights', {
                    templateUrl: '/static/app/views/insights.html',
                    controller: 'InsightsController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/simulator', {
                    templateUrl: '/static/app/views/simulator.html',
                    controller: 'SimulatorController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/services', {
                    templateUrl: '/static/app/views/services.html',
                    controller: 'ServicesController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/community', {
                    templateUrl: '/static/app/views/community.html',
                    controller: 'CommunityController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/records', {
                    templateUrl: '/static/app/views/records.html',
                    controller: 'RecordsController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/profile', {
                    templateUrl: '/static/app/views/profile.html',
                    controller: 'ProfileController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .when('/waste-management', {
                    templateUrl: '/static/app/views/waste-management.html',
                    controller: 'WasteManagementController',
                    controllerAs: 'vm',
                    requireAuth: true
                })
                .otherwise({
                    redirectTo: '/landing'
                });

            // Use HTML5 mode (optional - removes # from URLs)
            // $locationProvider.html5Mode(true);
        }])
        .run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
            // Set current language (for backward compatibility)
            $rootScope.currentLang = 'en';

            // Logout function
            $rootScope.logout = function() {
                AuthService.logout()
                    .then(function() {
                        $location.path('/auth');
                    })
                    .catch(function() {
                        // Even if logout fails on server, redirect to auth
                        $location.path('/auth');
                    });
            };

            // Authentication check on route change
            $rootScope.$on('$routeChangeStart', function(event, next) {
                // Check if route requires authentication
                if (next.requireAuth && !AuthService.isAuthenticated()) {
                    // Redirect to login page
                    event.preventDefault();
                    $location.path('/auth');
                } else if (next.$$route && next.$$route.originalPath === '/auth' && AuthService.isAuthenticated()) {
                    // If already authenticated and trying to access auth page, redirect to dashboard
                    event.preventDefault();
                    $location.path('/dashboard');
                }
            });

            // Track current page for sidebar active state
            $rootScope.$on('$routeChangeSuccess', function() {
                var path = $location.path().substring(1) || 'dashboard';
                $rootScope.currentPage = path;
            });

            // Initialize Lucide icons after route change
            $rootScope.$on('$viewContentLoaded', function() {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        }]);
})();
