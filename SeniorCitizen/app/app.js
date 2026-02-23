/**
 * Senior Citizen Portal - AngularJS Application
 * Suvidha - Simple & Accessible Design
 * 
 * Complete Angular JS setup with proper routing, controllers, and modal management
 */

var app = angular.module('seniorApp', ['ngRoute']);

// Font Size Service - Accessible to all controllers
app.factory('FontSizeService', ['$rootScope', function($rootScope) {
    return {
        currentFontSize: localStorage.getItem('Senior_FontSize') || 'normal',
        
        increase: function() {
            document.documentElement.classList.add('font-size-increased');
            this.currentFontSize = 'increased';
            localStorage.setItem('Senior_FontSize', 'increased');
            $rootScope.$broadcast('fontSizeChanged', 'increased');
        },
        
        decrease: function() {
            document.documentElement.classList.remove('font-size-increased');
            this.currentFontSize = 'normal';
            localStorage.setItem('Senior_FontSize', 'normal');
            $rootScope.$broadcast('fontSizeChanged', 'normal');
        },
        
        getCurrentSize: function() {
            return this.currentFontSize;
        },
        
        applyOnLoad: function() {
            if (this.currentFontSize === 'increased') {
                document.documentElement.classList.add('font-size-increased');
            }
        }
    };
}]);

// Apply saved font size preference on app startup
app.run(['FontSizeService', function(FontSizeService) {
    FontSizeService.applyOnLoad();
}]);

// Route Configuration
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/bills', {
            templateUrl: 'app/views/bills.html',
            controller: 'BillsController'
        })
        .when('/pay', {
            templateUrl: 'app/views/pay.html',
            controller: 'PayController'
        })
        .when('/complaints', {
            templateUrl: 'app/views/complaints.html',
            controller: 'ComplaintsController'
        })
        .when('/updates', {
            templateUrl: 'app/views/updates.html',
            controller: 'UpdatesController'
        })
        .when('/settings', {
            templateUrl: 'app/views/settings.html',
            controller: 'SettingsController'
        })
        .otherwise({
            redirectTo: '/'
        });
    
    // Use HTML5 mode for clean URLs
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
}]);

// Dashboard Controller - Complete with Modal Management
app.controller('DashboardController', ['$scope', '$location', '$rootScope', 'FontSizeService', function ($scope, $location, $rootScope, FontSizeService) {
    // ========================================
    // USER DATA & INITIALIZATION
    // ========================================
    $scope.user = {
        name: 'Vikram Singh',
        initials: 'VS',
        phone: '+91 98765 43210'
    };

    // Current Date - Friendly format
    $scope.currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Language Support
    $scope.selectedLang = 'EN';
    $scope.showLangMenu = false;
    $scope.languages = [
        { code: 'EN', name: 'English' },
        { code: 'HI', name: 'हिन्दी' },
        { code: 'TA', name: 'தமிழ்' },
        { code: 'TE', name: 'తెలుగు' }
    ];

    // Bills Data
    $scope.bills = [
        { id: 1, type: 'Electricity', amount: 1250, dueDate: '15 Feb 2026', status: 'unpaid' },
        { id: 2, type: 'Water', amount: 450, dueDate: '20 Feb 2026', status: 'unpaid' },
        { id: 3, type: 'Gas', amount: 800, dueDate: '25 Feb 2026', status: 'paid' }
    ];

    // Calculate pending bills
    $scope.totalPendingAmount = $scope.bills
        .filter(function (b) { return b.status === 'unpaid'; })
        .reduce(function (sum, b) { return sum + b.amount; }, 0);

    $scope.pendingBillsCount = $scope.bills.filter(function (b) { return b.status === 'unpaid'; }).length;

    // Status Tracking
    $scope.lastBillPaid = '12 January 2026';
    $scope.lastComplaintResolved = '5 January 2026';
    $scope.hasPendingComplaints = false;
    $scope.complaintsStatus = 'No pending complaints';

    // Area Updates
    $scope.areaUpdates = [
        { icon: '💧', text: 'Water supply normal tomorrow' },
        { icon: '⚡', text: 'No planned outages this week' },
        { icon: '🔧', text: 'Road work on Main Street' }
    ];

    // Complaints List
    $scope.complaints = [];
    $scope.complaintTypes = [
        { id: 'billing', name: 'Billing Issue', icon: '💵' },
        { id: 'service', name: 'Service Problem', icon: '🔧' },
        { id: 'meter', name: 'Meter Reading', icon: '📊' },
        { id: 'other', name: 'Other', icon: '📝' }
    ];

    // Updates List
    $scope.updates = [
        { id: 1, title: 'Water Supply Maintenance', date: '10 Feb 2026', type: 'info' },
        { id: 2, title: 'New Payment Options Available', date: '8 Feb 2026', type: 'success' }
    ];

    // ========================================
    // MODAL STATE MANAGEMENT
    // ========================================
    $scope.activeModal = null;
    $scope.modalData = {};
    $scope.showEmergencyModal = false;
    $scope.showVoiceModal = false;
    $scope.voiceListening = false;
    $scope.showFamilyModal = false;
    $scope.familyShareSent = false;
    $scope.showHelpModal = false;
    $scope.showLogoutModal = false;
    $scope.showComplaints = false;
    $scope.showUpdates = false;

    // ========================================
    // GENERIC MODAL SYSTEM
    // ========================================
    $scope.openModal = function (modalType, data) {
        $scope.activeModal = modalType;
        $scope.modalData = data || {};
        document.body.style.overflow = 'hidden';
    };

    $scope.closeModal = function () {
        $scope.activeModal = null;
        $scope.modalData = {};
        document.body.style.overflow = 'auto';
    };

    // ========================================
    // EMERGENCY HELP MODAL
    // ========================================
    $scope.openEmergencyHelp = function () {
        $scope.showEmergencyModal = true;
        document.body.style.overflow = 'hidden';
    };

    $scope.closeEmergencyHelp = function () {
        $scope.showEmergencyModal = false;
        document.body.style.overflow = 'auto';
    };

    // ========================================
    // VOICE ASSISTANT MODAL
    // ========================================
    $scope.startVoiceAssistant = function () {
        $scope.showVoiceModal = true;
        $scope.voiceListening = true;
        document.body.style.overflow = 'hidden';
    };

    $scope.closeVoiceModal = function () {
        $scope.showVoiceModal = false;
        $scope.voiceListening = false;
        document.body.style.overflow = 'auto';
    };

    // ========================================
    // SHARE WITH FAMILY MODAL
    // ========================================
    $scope.shareWithFamily = function () {
        $scope.showFamilyModal = true;
        $scope.familyShareSent = false;
        document.body.style.overflow = 'hidden';
    };

    $scope.closeFamilyModal = function () {
        $scope.showFamilyModal = false;
        $scope.familyShareSent = false;
        document.body.style.overflow = 'auto';
    };

    $scope.confirmFamilyShare = function () {
        $scope.familyShareSent = true;
    };

    // ========================================
    // HELP MODAL
    // ========================================
    $scope.openHelp = function () {
        $scope.showHelpModal = true;
        document.body.style.overflow = 'hidden';
    };

    $scope.closeHelp = function () {
        $scope.showHelpModal = false;
        document.body.style.overflow = 'auto';
    };

    // ========================================
    // LOGOUT MODAL & CONFIRMATION
    // ========================================
    $scope.logout = function () {
        $scope.showLogoutModal = true;
        document.body.style.overflow = 'hidden';
    };

    $scope.cancelLogout = function () {
        $scope.showLogoutModal = false;
        document.body.style.overflow = 'auto';
    };

    $scope.confirmLogout = function () {
        $scope.showLogoutModal = false;
        document.body.style.overflow = 'auto';
        
        // Show success modal then redirect
        $scope.openModal('success', {
            icon: '✅',
            title: 'Logged Out Successfully',
            message: 'Thank you for using Suvidha! See you soon.'
        });
        
        // In production, redirect to login page after a delay
        setTimeout(function () {
            window.location.href = '/login';
        }, 2000);
    };

    // ========================================
    // PAYMENT DIALOG
    // ========================================
    $scope.openPaymentDialog = function (billId) {
        var bill = $scope.bills.find(function (b) { return b.id === billId; });
        if (bill && bill.status === 'unpaid') {
            $scope.openModal('payment', {
                type: bill.type,
                amount: bill.amount,
                dueDate: bill.dueDate
            });
        }
    };

    $scope.confirmPayment = function () {
        $scope.openModal('success', {
            icon: '💰',
            title: 'Payment Successful!',
            message: 'Your bill payment has been processed successfully.'
        });
    };

    // ========================================
    // COMPLAINT DIALOG
    // ========================================
    $scope.openComplaintDialog = function (type) {
        $scope.openModal('complaint', {
            type: type,
            title: 'Report Issue'
        });
    };

    $scope.submitComplaint = function (complaintType) {
        if (!complaintType) return;
        
        var newComplaint = {
            id: $scope.complaints.length + 1,
            type: complaintType.name,
            status: 'pending',
            date: new Date().toLocaleDateString('en-IN')
        };
        
        $scope.complaints.push(newComplaint);
        $scope.closeModal();
        
        $scope.openModal('success', {
            icon: '📝',
            title: 'Complaint Submitted',
            message: 'Your complaint has been registered. Reference ID: #' + newComplaint.id
        });
    };

    // ========================================
    // COLLAPSIBLE SECTIONS
    // ========================================
    $scope.toggleComplaints = function () {
        $scope.showComplaints = !$scope.showComplaints;
    };

    $scope.toggleUpdates = function () {
        $scope.showUpdates = !$scope.showUpdates;
    };

    // ========================================
    // VIEW MODE & ACCESSIBILITY
    // ========================================
    $scope.viewMode = 'easy';
    $scope.fontSize = 16;

    $scope.setMode = function (mode) {
        $scope.viewMode = mode;
        if (mode === 'standard') {
            // Could switch to a different template
            $scope.viewMode = 'standard';
        }
    };

    $scope.increaseFontSize = function () {
        if ($scope.fontSize < 24) {
            $scope.fontSize += 2;
            document.body.style.fontSize = $scope.fontSize + 'px';
        }
    };

    $scope.decreaseFontSize = function () {
        if ($scope.fontSize > 14) {
            $scope.fontSize -= 2;
            document.body.style.fontSize = $scope.fontSize + 'px';
        }
    };

    // ========================================
    // LANGUAGE MANAGEMENT
    // ========================================
    $scope.toggleLangMenu = function ($event) {
        $event.stopPropagation();
        $scope.showLangMenu = !$scope.showLangMenu;
    };

    $scope.selectLang = function (lang, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.selectedLang = lang.code;
        $scope.showLangMenu = false;
    };

    // Close language menu on outside click
    $scope.$on('$destroy', function () {
        document.removeEventListener('click', function () {
            $scope.$apply(function () {
                $scope.showLangMenu = false;
            });
        });
    });

    // ========================================
    // FONT SIZE ACCESSIBILITY
    // ========================================
    $scope.currentFontSize = FontSizeService.getCurrentSize();

    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };

    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };

    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
}]);

// Bills Controller
app.controller('BillsController', ['$scope', '$location', '$rootScope', 'FontSizeService', function ($scope, $location, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
    $scope.bills = [
        { id: 1, type: 'Electricity', amount: 1250, dueDate: '15 Feb 2026', status: 'unpaid', provider: 'DM Water Supply' },
        { id: 2, type: 'Water', amount: 450, dueDate: '20 Feb 2026', status: 'unpaid', provider: 'Municipal Corporation' },
        { id: 3, type: 'Gas', amount: 800, dueDate: '25 Feb 2026', status: 'paid', provider: 'Gas Authority' }
    ];

    $scope.selectedBill = null;
    $scope.showBillDetails = false;

    $scope.viewBillDetails = function (billId) {
        $scope.selectedBill = $scope.bills.find(function (b) { return b.id === billId; });
        $scope.showBillDetails = true;
    };

    $scope.payBill = function (billId) {
        $scope.selectedBill = $scope.bills.find(function (b) { return b.id === billId; });
        if ($scope.selectedBill && $scope.selectedBill.status === 'unpaid') {
            $location.path('/pay');
        }
    };

    $scope.downloadBill = function (billId) {
        // In production, this would trigger a PDF download
        alert('Downloading bill #' + billId + '...');
    };
}]);

// Pay Controller
app.controller('PayController', ['$scope', '$location', '$rootScope', 'FontSizeService', function ($scope, $location, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
    $scope.bills = [
        { id: 1, type: 'Electricity', amount: 1250, dueDate: '15 Feb 2026', status: 'unpaid' },
        { id: 2, type: 'Water', amount: 450, dueDate: '20 Feb 2026', status: 'unpaid' },
        { id: 3, type: 'Gas', amount: 800, dueDate: '25 Feb 2026', status: 'paid' }
    ];

    $scope.paymentMethods = [
        { id: 'upi', name: 'UPI Payment', icon: '📱', description: 'Pay with Google Pay, PhonePe, or UPI app' },
        { id: 'card', name: 'Debit/Credit Card', icon: '💳', description: 'Visa, Mastercard, or RuPay' },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'Direct bank transfer' },
        { id: 'cash', name: 'Pay at Center', icon: '🏪', description: 'Visit our service center' }
    ];

    $scope.selectedBill = null;
    $scope.selectedMethod = null;
    $scope.paymentStep = 1; // 1: Select Bill, 2: Select Method, 3: Confirm

    $scope.selectBill = function (billId) {
        $scope.selectedBill = $scope.bills.find(function (b) { return b.id === billId; });
        if ($scope.selectedBill && $scope.selectedBill.status === 'unpaid') {
            $scope.paymentStep = 2;
        }
    };

    $scope.selectPaymentMethod = function (method) {
        $scope.selectedMethod = method;
        $scope.paymentStep = 3;
    };

    $scope.confirmPayment = function () {
        if ($scope.selectedBill && $scope.selectedMethod) {
            // In production, process payment here
            $scope.selectedBill.status = 'paid';
            alert('Payment of ₹' + $scope.selectedBill.amount + ' confirmed for ' + $scope.selectedBill.type + ' via ' + $scope.selectedMethod.name);
            $location.path('/');
        }
    };

    $scope.cancelPayment = function () {
        $location.path('/bills');
    };
}]);

// Complaints Controller
app.controller('ComplaintsController', ['$scope', '$rootScope', 'FontSizeService', function ($scope, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
    $scope.complaints = [
        { id: 1, type: 'Meter Reading', title: 'Meter showing high reading', status: 'resolved', date: '05 Feb 2026' },
        { id: 2, type: 'Billing Issue', title: 'Charged for extra usage', status: 'pending', date: '08 Feb 2026' }
    ];

    $scope.complaintTypes = [
        { id: 'billing', name: 'Billing Issue', icon: '💵' },
        { id: 'service', name: 'Service Problem', icon: '🔧' },
        { id: 'meter', name: 'Meter Reading', icon: '📊' },
        { id: 'other', name: 'Other', icon: '📝' }
    ];

    $scope.newComplaint = {};
    $scope.showForm = false;

    $scope.openComplaintForm = function (type) {
        $scope.newComplaint = { type: type.name, typeId: type.id };
        $scope.showForm = true;
    };

    $scope.submitComplaint = function () {
        if ($scope.newComplaint.title && $scope.newComplaint.description) {
            var complaint = {
                id: $scope.complaints.length + 1,
                type: $scope.newComplaint.type,
                title: $scope.newComplaint.title,
                status: 'pending',
                date: new Date().toLocaleDateString('en-IN')
            };
            $scope.complaints.push(complaint);
            $scope.newComplaint = {};
            $scope.showForm = false;
            alert('Complaint #' + complaint.id + ' submitted successfully!');
        }
    };

    $scope.trackComplaint = function (complaintId) {
        var complaint = $scope.complaints.find(function (c) { return c.id === complaintId; });
        if (complaint) {
            alert('Complaint #' + complaintId + ' Status: ' + complaint.status);
        }
    };
}]);

// Updates Controller
app.controller('UpdatesController', ['$scope', '$rootScope', 'FontSizeService', function ($scope, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
    $scope.updates = [
        { id: 1, title: 'Water Supply Maintenance', date: '10 Feb 2026', type: 'info', description: 'Scheduled maintenance on Main Street' },
        { id: 2, title: 'New Payment Options Available', date: '8 Feb 2026', type: 'success', description: 'You can now pay via Google Pay!' },
        { id: 3, title: 'Power Outage Alert', date: '6 Feb 2026', type: 'warning', description: 'Planned outage on Feb 7, 2-5 PM' }
    ];

    $scope.filterType = 'all';

    $scope.filteredUpdates = function () {
        if ($scope.filterType === 'all') {
            return $scope.updates;
        }
        return $scope.updates.filter(function (u) { return u.type === $scope.filterType; });
    };
}]);

// Settings Controller
app.controller('SettingsController', ['$scope', '$rootScope', 'FontSizeService', function ($scope, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
    $scope.settings = {
        notifications: true,
        language: 'EN',
        fontSize: 16,
        smsAlerts: true,
        emailAlerts: false
    };

    $scope.languages = [
        { code: 'EN', name: 'English' },
        { code: 'HI', name: 'हिन्दी' },
        { code: 'TA', name: 'தமிழ்' },
        { code: 'TE', name: 'తెలుగు' }
    ];

    $scope.saveSettings = function () {
        // In production, save to backend
        alert('Settings saved successfully!');
    };

    $scope.changePassword = function () {
        var newPassword = prompt('Enter new password:');
        if (newPassword) {
            alert('Password changed successfully!');
        }
    };

    $scope.addFamilyMember = function () {
        var phone = prompt('Enter family member phone number:');
        if (phone) {
            alert('Invitation sent to ' + phone);
        }
    };
}]);

// Global Service for User Data
// Live Waste Service Controller
app.controller('LiveWasteServiceController', ['$scope', '$rootScope', 'FontSizeService', function ($scope, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
}]);

// Waste Management Controller
app.controller('WasteManagementController', ['$scope', '$rootScope', 'FontSizeService', function ($scope, $rootScope, FontSizeService) {
    // Font Size Accessibility
    $scope.currentFontSize = FontSizeService.getCurrentSize();
    $scope.increaseFontSize = function () {
        FontSizeService.increase();
        $scope.currentFontSize = 'increased';
    };
    $scope.decreaseFontSize = function () {
        FontSizeService.decrease();
        $scope.currentFontSize = 'normal';
    };
    $scope.$on('fontSizeChanged', function(event, newSize) {
        $scope.currentFontSize = newSize;
    });
}]);

// User Service
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
