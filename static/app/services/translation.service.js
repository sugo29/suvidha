// Translation Service
(function () {
    'use strict';

    angular.module('suvidhaApp')
        .service('TranslationService', ['$http', function ($http) {
            var self = this;
            self.translations = {};
            self.currentLang = 'en';

            self.init = function () {
                // Load translations from JSON file
                $http.get('/static/translations.json')
                    .then(function (response) {
                        self.translations = response.data;
                    })
                    .catch(function () {
                        console.warn('Could not load translations');
                    });
            };

            self.translate = function (key) {
                if (!self.translations[self.currentLang]) {
                    return key;
                }

                var keys = key.split('.');
                var value = self.translations[self.currentLang];

                for (var i = 0; i < keys.length; i++) {
                    if (value) {
                        value = value[keys[i]];
                    } else {
                        return key;
                    }
                }

                return value !== undefined ? value : key;
            };

            self.setLanguage = function (lang) {
                self.currentLang = lang;
            };

            self.getLanguage = function () {
                return self.currentLang;
            };
        }])
        .filter('translate', ['TranslationService', function (TranslationService) {
            return function (key) {
                return TranslationService.translate(key);
            };
        }]);
})();
