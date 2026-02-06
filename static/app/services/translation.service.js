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
                if (self.translations[self.currentLang] && self.translations[self.currentLang][key]) {
                    return self.translations[self.currentLang][key];
                }
                return key; // Fallback to key if translation not found
            };

            self.setLanguage = function(lang) {
                self.currentLang = lang;
            };

            self.getLanguage = function() {
                return self.currentLang;
            };
        }])
        .filter('translate', ['TranslationService', function(TranslationService) {
            return function(key) {
                return TranslationService.translate(key);
            };
        }]);
})();
