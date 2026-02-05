// Translation Service
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .service('TranslationService', ['$http', function($http) {
            var self = this;
            self.translations = {};
            self.currentLang = 'en';

            self.init = function() {
                // Load translations from JSON file
                $http.get('/static/translations.json')
                    .then(function(response) {
                        self.translations = response.data;
                    })
                    .catch(function() {
                        console.warn('Could not load translations');
                    });
            };

            self.translate = function(key) {
                if (self.translations[key] && self.translations[key][self.currentLang]) {
                    return self.translations[key][self.currentLang];
                }
                return key; // Fallback to key if translation not found
            };

            self.setLanguage = function(lang) {
                self.currentLang = lang;
            };

            self.getLanguage = function() {
                return self.currentLang;
            };
        }]);
})();
