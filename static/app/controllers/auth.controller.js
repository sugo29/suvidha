angular.module('suvidhaApp')
    .controller('AuthController', ['$scope', '$location', '$rootScope', 'AuthService', 'TranslationService', 
        function($scope, $location, $rootScope, AuthService, TranslationService) {
            
            // Current state
            $scope.currentStep = 1;
            $scope.totalSteps = 6;
            $scope.showLogin = true;
            
            // Language handling
            $scope.currentLang = $rootScope.currentLang || 'en';
            
            $scope.setLanguage = function(lang) {
                $scope.currentLang = lang;
                $rootScope.currentLang = lang;
                TranslationService.setLanguage(lang);
            };
            
            // Form data
            $scope.loginData = {
                identifier: '',
                password: ''
            };
            
            $scope.signupData = {
                fullName: '',
                language: '',
                email: '',
                phone: '',
                aadhaar: '',
                consent: false,
                state: '',
                city: '',
                ward: '',
                locality: '',
                electricityProvider: '',
                waterProvider: '',
                gasProvider: '',
                password: '',
                confirmPassword: '',
                alertsEnabled: true
            };
            
            // Language options
            $scope.languages = [
                { value: 'en', label: 'English (EN)' },
                { value: 'hi', label: 'हिंदी (Hindi)' },
                { value: 'ta', label: 'தமிழ் (Tamil)' },
                { value: 'te', label: 'తెలుగు (Telugu)' },
                { value: 'bn', label: 'বাংলা (Bengali)' }
            ];
            
            // Location options
            $scope.states = [
                { value: 'delhi', label: 'Delhi' },
                { value: 'mumbai', label: 'Maharashtra' },
                { value: 'karnataka', label: 'Karnataka' },
                { value: 'tamilnadu', label: 'Tamil Nadu' }
            ];
            
            $scope.cities = [
                { value: 'delhi', label: 'Delhi' },
                { value: 'mumbai', label: 'Mumbai' },
                { value: 'bangalore', label: 'Bangalore' },
                { value: 'chennai', label: 'Chennai' }
            ];
            
            $scope.wards = [
                { value: 'ward-1', label: 'Ward 1' },
                { value: 'ward-2', label: 'Ward 2' },
                { value: 'ward-3', label: 'Ward 3' },
                { value: 'ward-4', label: 'Ward 4' }
            ];
            
            // Service providers
            $scope.electricityProviders = [
                { value: 'bses', label: 'BSES Yamuna Power Ltd' },
                { value: 'tata', label: 'Tata Power Delhi' },
                { value: 'cesc', label: 'CESC Limited' },
                { value: 'torrent', label: 'Torrent Power' }
            ];
            
            $scope.waterProviders = [
                { value: 'djb', label: 'Delhi Jal Board' },
                { value: 'bmc', label: 'Brihanmumbai Municipal Corporation' },
                { value: 'bwssb', label: 'Bangalore Water Supply & Sewerage Board' },
                { value: 'cmwssb', label: 'Chennai Metropolitan Water Supply & Sewerage Board' }
            ];
            
            $scope.gasProviders = [
                { value: 'indane', label: 'Indane (Cylinder)' },
                { value: 'hp', label: 'HP Gas (Cylinder)' },
                { value: 'png', label: 'PNG (Pipeline Natural Gas)' },
                { value: 'bharat', label: 'Bharat Gas' }
            ];
            
            // Navigation functions
            $scope.goToSignup = function() {
                $scope.showLogin = false;
                $scope.currentStep = 1;
            };
            
            $scope.goToLogin = function() {
                $scope.showLogin = true;
                $scope.currentStep = 1;
            };
            
            // Progress calculation
            $scope.getProgressPercent = function() {
                return (($scope.currentStep - 1) / ($scope.totalSteps - 1)) * 100;
            };
            
            // Step class helpers
            $scope.isStepActive = function(step) {
                return $scope.currentStep === step;
            };
            
            $scope.isStepCompleted = function(step) {
                return step < $scope.currentStep;
            };
            
            // Navigate between steps
            $scope.goToStep = function(step) {
                $scope.currentStep = step;
            };
            
            // Validation helpers
            $scope.validateStep1 = function() {
                if (!$scope.signupData.fullName || !$scope.signupData.language) {
                    alert('Please fill in all required fields.');
                    return false;
                }
                return true;
            };
            
            $scope.validateStep2 = function() {
                if (!$scope.signupData.email || !$scope.signupData.phone) {
                    alert('Please fill in all required fields.');
                    return false;
                }
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test($scope.signupData.email)) {
                    alert('Please enter a valid email address.');
                    return false;
                }
                return true;
            };
            
            $scope.validateStep3 = function() {
                // Aadhaar is optional
                return true;
            };
            
            $scope.validateStep4 = function() {
                if (!$scope.signupData.state || !$scope.signupData.city || 
                    !$scope.signupData.ward || !$scope.signupData.locality) {
                    alert('Please fill in all required fields.');
                    return false;
                }
                return true;
            };
            
            $scope.validateStep5 = function() {
                if (!$scope.signupData.electricityProvider || 
                    !$scope.signupData.waterProvider || 
                    !$scope.signupData.gasProvider) {
                    alert('Please select all service providers.');
                    return false;
                }
                return true;
            };
            
            $scope.validateStep6 = function() {
                if ($scope.signupData.password !== $scope.signupData.confirmPassword) {
                    alert('Passwords do not match. Please try again.');
                    return false;
                }
                
                if ($scope.signupData.password.length < 8) {
                    alert('Password must be at least 8 characters long.');
                    return false;
                }
                return true;
            };
            
            // Step navigation with validation
            $scope.continueToStep2 = function() {
                if ($scope.validateStep1()) {
                    $scope.goToStep(2);
                }
            };
            
            $scope.continueToStep3 = function() {
                if ($scope.validateStep2()) {
                    $scope.goToStep(3);
                }
            };
            
            $scope.continueToStep4 = function() {
                if ($scope.validateStep3()) {
                    $scope.goToStep(4);
                }
            };
            
            $scope.continueToStep5 = function() {
                if ($scope.validateStep4()) {
                    $scope.goToStep(5);
                }
            };
            
            $scope.continueToStep6 = function() {
                if ($scope.validateStep5()) {
                    $scope.goToStep(6);
                }
            };
            
            // Aadhaar formatting
            $scope.formatAadhaar = function() {
                let value = $scope.signupData.aadhaar.replace(/\D/g, '');
                
                if (value.length > 0) {
                    value = value.match(/.{1,4}/g).join('-');
                }
                
                $scope.signupData.aadhaar = value.substring(0, 14);
            };
            
            // Form submissions
            $scope.login = function() {
                if (!$scope.loginData.identifier || !$scope.loginData.password) {
                    alert('Please fill in all fields.');
                    return;
                }
                
                $scope.isLoggingIn = true;
                
                AuthService.login($scope.loginData)
                    .then(function(response) {
                        alert('Login successful! Welcome to Suvidha Dashboard.');
                        $location.path('/dashboard');
                    })
                    .catch(function(error) {
                        alert('Login failed. Please check your credentials and try again.');
                    })
                    .finally(function() {
                        $scope.isLoggingIn = false;
                    });
            };
            
            $scope.signup = function() {
                if (!$scope.validateStep6()) {
                    return;
                }
                
                $scope.isCreatingAccount = true;
                
                AuthService.signup($scope.signupData)
                    .then(function(response) {
                        alert('Account created successfully! Redirecting to dashboard...');
                        
                        // Reset form and go back to login
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.goToLogin();
                                $scope.signupData = {
                                    fullName: '',
                                    language: '',
                                    email: '',
                                    phone: '',
                                    aadhaar: '',
                                    consent: false,
                                    state: '',
                                    city: '',
                                    ward: '',
                                    locality: '',
                                    electricityProvider: '',
                                    waterProvider: '',
                                    gasProvider: '',
                                    password: '',
                                    confirmPassword: '',
                                    alertsEnabled: true
                                };
                            });
                        }, 1500);
                    })
                    .catch(function(error) {
                        alert('Account creation failed. Please try again.');
                    })
                    .finally(function() {
                        $scope.isCreatingAccount = false;
                    });
            };
            
            $scope.forgotPassword = function() {
                alert('A password reset link has been sent to your registered email.');
            };
        }
    ]);
