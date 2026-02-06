// AngularJS Application Module
(function() {
    'use strict';

    angular.module('suvidhaApp', ['ngRoute', 'ngSanitize'])
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/auth', {
                    templateUrl: '/static/app/views/auth.html',
                    controller: 'AuthController',
                    controllerAs: 'vm'
                })
                .when('/', {
                    templateUrl: '/static/app/views/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm'
                })
                .when('/dashboard', {
                    templateUrl: '/static/app/views/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm'
                })
                .when('/utilities', {
                    templateUrl: '/static/app/views/utilities.html',
                    controller: 'UtilitiesController',
                    controllerAs: 'vm'
                })
                .when('/insights', {
                    templateUrl: '/static/app/views/insights.html',
                    controller: 'InsightsController',
                    controllerAs: 'vm'
                })
                .when('/simulator', {
                    templateUrl: '/static/app/views/simulator.html',
                    controller: 'SimulatorController',
                    controllerAs: 'vm'
                })
                .when('/services', {
                    templateUrl: '/static/app/views/services.html',
                    controller: 'ServicesController',
                    controllerAs: 'vm'
                })
                .when('/community', {
                    templateUrl: '/static/app/views/community.html',
                    controller: 'CommunityController',
                    controllerAs: 'vm'
                })
                .when('/records', {
                    templateUrl: '/static/app/views/records.html',
                    controller: 'RecordsController',
                    controllerAs: 'vm'
                })
                .when('/profile', {
                    templateUrl: '/static/app/views/profile.html',
                    controller: 'ProfileController',
                    controllerAs: 'vm'
                })
                .otherwise({
                    redirectTo: '/'
                });

            // Use HTML5 mode (optional - removes # from URLs)
            // $locationProvider.html5Mode(true);
        }])
        .run(['$rootScope', '$location', 'TranslationService', function($rootScope, $location, TranslationService) {
            // Initialize translation service
            TranslationService.init();

            // Set current language
            $rootScope.currentLang = 'en';
            
            // Translation function
            $rootScope.t = function(key) {
                return TranslationService.translate(key);
            };

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
