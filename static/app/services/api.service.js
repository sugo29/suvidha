// API Service for backend communication
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .service('ApiService', ['$http', function($http) {
            var self = this;
            var baseUrl = '/api';

            self.get = function(endpoint) {
                return $http.get(baseUrl + endpoint);
            };

            self.post = function(endpoint, data) {
                return $http.post(baseUrl + endpoint, data);
            };

            self.put = function(endpoint, data) {
                return $http.put(baseUrl + endpoint, data);
            };

            self.delete = function(endpoint) {
                return $http.delete(baseUrl + endpoint);
            };

            // Specific API methods
            self.getDashboardData = function() {
                return self.get('/dashboard');
            };

            self.getUtilitiesData = function() {
                return self.get('/utilities');
            };

            self.getInsightsData = function() {
                return self.get('/insights');
            };

            self.getRecordsData = function() {
                return self.get('/records');
            };

            self.getCommunityData = function() {
                return self.get('/community');
            };

            self.getProfileData = function() {
                return self.get('/profile');
            };

            self.submitServiceRequest = function(data) {
                return self.post('/services/submit', data);
            };
        }]);
})();
