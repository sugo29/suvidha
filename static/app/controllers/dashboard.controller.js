// Dashboard Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('DashboardController', ['$scope', '$timeout', 'ApiService', DashboardController]);

    function DashboardController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.userData = {};
        
        // Helper functions for cost calculations
        vm.getTotalCost = function() {
            if (!vm.userData.consumption) return 0;
            var elec = vm.userData.consumption.electricity?.current_bill || 0;
            var water = vm.userData.consumption.water?.current_bill || 0;
            var gas = vm.userData.consumption.gas?.current_bill || 0;
            return elec + water + gas;
        };
        
        vm.getPercentage = function(utility) {
            var total = vm.getTotalCost();
            if (total === 0) return 0;
            var amount = vm.userData.consumption?.[utility]?.current_bill || 0;
            return Math.round((amount / total) * 100);
        };

        // Initialize
        function init() {
            loadDashboardData();
            $timeout(function() {
                initializeHelixVisualization();
            }, 100);
        }

        function loadDashboardData() {
            ApiService.getDashboardData()
                .then(function(response) {
                    // Handle response from main.py API
                    if (response.data.success && response.data.dashboard) {
                        vm.userData = response.data.dashboard;
                        vm.user = response.data.dashboard.user;
                        vm.billsSummary = response.data.dashboard.bills_summary;
                        vm.complaintsSummary = response.data.dashboard.complaints_summary;
                        vm.community = response.data.dashboard.community;
                        vm.recentBills = response.data.dashboard.recent_bills;
                        vm.recentComplaints = response.data.dashboard.recent_complaints;
                    } else {
                        vm.userData = response.data;
                    }
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading dashboard data:', error);
                    vm.loading = false;
                    // Set some default data to prevent errors
                    vm.userData = {
                        consumption: {
                            electricity: { current_bill: 0 },
                            water: { current_bill: 0 },
                            gas: { current_bill: 0 }
                        }
                    };
                });
        }

        function initializeHelixVisualization() {
            const canvas = document.getElementById('dna-canvas');
            if (!canvas) {
                console.warn('Canvas element not found');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.warn('Canvas context not available');
                return;
            }
            
            const container = document.getElementById('dna-container');
            const tooltip = document.getElementById('dna-tooltip');
            
            if (!container || !tooltip) {
                console.warn('Container or tooltip not found');
                return;
            }
            
            // Utility data
            const utilityData = {
                electricity: {
                    color: {r: 34, g: 197, b: 94},
                    name: 'Electricity',
                    currentBill: '₹1,850',
                    lastMonth: '₹1,720',
                    units: '285 kWh',
                    status: 'Active',
                    dueDate: '15th Feb 2026',
                    trend: '+7.5%'
                },
                gas: {
                    color: {r: 239, g: 68, b: 68},
                    name: 'Gas',
                    currentBill: '₹800',
                    lastMonth: '₹750',
                    units: '12 SCM',
                    status: 'Active',
                    dueDate: '20th Feb 2026',
                    trend: '+6.7%'
                },
                water: {
                    color: {r: 59, g: 130, b: 246},
                    name: 'Water',
                    currentBill: '₹420',
                    lastMonth: '₹400',
                    units: '15,000 L',
                    status: 'Active',
                    dueDate: '10th Feb 2026',
                    trend: '+5%'
                }
            };
            
            const strandColors = [
                utilityData.electricity.color,
                utilityData.gas.color,
                utilityData.water.color
            ];
            
            const strandKeys = ['electricity', 'gas', 'water'];
            
            // Canvas setup
            function resizeCanvas() {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
            }
            
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Animation parameters
            const rotationSpeed = 0.6;
            const helixRadius = 4;
            const strandThickness = 1.2;
            let rotationAngle = 0;
            let animationId = null;
            let hoveredStrand = null;
            
            // Store strand paths for click detection
            let strandPaths = [];
            
            // Draw strand
            function drawStrand(color, phaseOffset, depthOffset, isHighlighted, strandIndex) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const horizontalScale = 12;
                const segments = 80;
                const radius = helixRadius * 18;
                const thickness = strandThickness * (isHighlighted ? 14 : 10);
                
                // Store points for this strand
                const points = [];
                
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments * Math.PI * 3.5;
                    const x = i * horizontalScale - segments * horizontalScale / 2 + depthOffset;
                    const y = radius * Math.sin(t + rotationAngle + phaseOffset);
                    const z = radius * Math.cos(t + rotationAngle + phaseOffset) + 100;
                    
                    const scale = 300 / (z + 300);
                    const projectedX = centerX + x * scale;
                    const projectedY = centerY + y * scale;
                    
                    // Store point for hit detection
                    points.push({ x: projectedX, y: projectedY, thickness: thickness });
                    
                    if (i === 0) {
                        ctx.moveTo(projectedX, projectedY);
                    } else {
                        ctx.lineTo(projectedX, projectedY);
                    }
                }
                
                // Store strand path for click detection
                strandPaths[strandIndex] = { points: points, utility: strandKeys[strandIndex] };
                
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                const alpha = isHighlighted ? 1 : 0.7;
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
                gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = thickness;
                ctx.lineCap = 'round';
                
                if (isHighlighted) {
                    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
                    ctx.shadowBlur = 20;
                }
                
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw connections
                const connections = 12;
                for (let i = 0; i <= connections; i++) {
                    const t = i / connections * Math.PI * 3.5;
                    const x = i * (segments * horizontalScale / connections) - segments * horizontalScale / 2 + depthOffset;
                    const y = radius * Math.sin(t + rotationAngle + phaseOffset);
                    const z = radius * Math.cos(t + rotationAngle + phaseOffset) + 100;
                    
                    const scale = 300 / (z + 300);
                    const startX = centerX + x * scale;
                    const startY = centerY + y * scale;
                    
                    const otherPhaseOffset = phaseOffset + Math.PI * 0.66;
                    const otherY = radius * Math.sin(t + rotationAngle + otherPhaseOffset);
                    const otherZ = radius * Math.cos(t + rotationAngle + otherPhaseOffset) + 100;
                    
                    const otherScale = 300 / (otherZ + 300);
                    const endX = centerX + x * otherScale;
                    const endY = centerY + otherY * otherScale;
                    
                    const connectionGradient = ctx.createLinearGradient(startX, startY, endX, endY);
                    connectionGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
                    
                    const connectedColorIndex = (strandColors.findIndex(c => 
                        c.r === color.r && c.g === color.g && c.b === color.b) + 1) % strandColors.length;
                    const connectedColor = strandColors[connectedColorIndex];
                    connectionGradient.addColorStop(1, `rgba(${connectedColor.r}, ${connectedColor.g}, ${connectedColor.b}, 0.3)`);
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = connectionGradient;
                    ctx.lineWidth = thickness * 0.3;
                    ctx.stroke();
                }
            }
            
            // Draw DNA
            function drawDNA() {
                ctx.fillStyle = 'rgba(249, 250, 251, 0.95)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Reset strand paths for new frame
                strandPaths = [];
                
                for (let i = 0; i < strandColors.length; i++) {
                    const phaseOffset = (i / strandColors.length) * Math.PI * 2;
                    const depthOffset = (i - 1) * 12;
                    const isHighlighted = hoveredStrand === strandKeys[i];
                    drawStrand(strandColors[i], phaseOffset, depthOffset, isHighlighted, i);
                }
            }
            
            // Animation loop
            function animate() {
                rotationAngle += 0.008 * rotationSpeed;
                drawDNA();
                animationId = requestAnimationFrame(animate);
            }
            
            animate();
            
            // Show tooltip
            function showTooltip(utility, x, y) {
                const data = utilityData[utility];
                tooltip.querySelector('.tooltip-title').textContent = data.name;
                tooltip.querySelector('.tooltip-content').innerHTML = `
                    <div class="tooltip-row"><span>Current Bill:</span><strong>${data.currentBill}</strong></div>
                    <div class="tooltip-row"><span>Last Month:</span><span>${data.lastMonth}</span></div>
                    <div class="tooltip-row"><span>Usage:</span><span>${data.units}</span></div>
                    <div class="tooltip-row"><span>Status:</span><span class="status-active">${data.status}</span></div>
                    <div class="tooltip-row"><span>Due Date:</span><span>${data.dueDate}</span></div>
                    <div class="tooltip-row"><span>Trend:</span><span class="trend-up">${data.trend}</span></div>
                `;
                
                tooltip.className = `dna-tooltip ${utility} active`;
                
                const tooltipRect = tooltip.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                let left = x - tooltipRect.width / 2;
                let top = y - tooltipRect.height - 15;
                
                if (left < 10) left = 10;
                if (left + tooltipRect.width > containerRect.width - 10) {
                    left = containerRect.width - tooltipRect.width - 10;
                }
                if (top < 10) top = y + 20;
                
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            }
            
            function hideTooltip() {
                tooltip.classList.remove('active');
            }
            
            // Show utility modal
            function showUtilityModal(utility, data) {
                const modal = document.getElementById('utilityModal');
                const modalTitle = document.getElementById('modalTitle');
                const modalIcon = document.getElementById('modalIcon');
                const utilityAction = document.getElementById('utilityAction');
                
                // Set modal title and icon
                modalTitle.textContent = data.name;
                
                // Create icon element with color
                const iconClass = utility === 'electricity' ? 'zap' : (utility === 'gas' ? 'flame' : 'droplet');
                const iconColor = utility === 'electricity' ? '#22c55e' : (utility === 'gas' ? '#ef4444' : '#3b82f6');
                modalIcon.innerHTML = `<i data-lucide="${iconClass}" style="width: 48px; height: 48px; color: ${iconColor};"></i>`;
                
                // Update details
                document.getElementById('detailBill').textContent = data.currentBill;
                document.getElementById('detailLastMonth').textContent = data.lastMonth;
                document.getElementById('detailUsage').textContent = data.units;
                document.getElementById('detailStatus').textContent = data.status;
                document.getElementById('detailDueDate').textContent = data.dueDate;
                document.getElementById('detailTrend').textContent = data.trend;
                
                // Set button action
                const targetUrl = utility === 'electricity' || utility === 'gas' || utility === 'water' ? '#!/utilities' : '#!/services';
                utilityAction.onclick = function() {
                    window.location.href = targetUrl;
                };
                
                // Show modal
                modal.classList.add('active');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            // Legend hover/click events
            document.querySelectorAll('.dna-legend-item').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    hoveredStrand = this.dataset.utility;
                    const rect = this.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    showTooltip(hoveredStrand, rect.left - containerRect.left + rect.width / 2, containerRect.height / 2);
                });
                
                item.addEventListener('mouseleave', function() {
                    hoveredStrand = null;
                    hideTooltip();
                });
                
                item.addEventListener('click', function() {
                    const utility = this.dataset.utility;
                    showUtilityModal(utility, utilityData[utility]);
                });
            });
            
            // Canvas click detection - detect which strand was clicked
            function getClickedStrand(mouseX, mouseY) {
                let closestStrand = null;
                let minDistance = Infinity;
                const hitThreshold = 25; // pixels within strand to register click
                
                for (let s = 0; s < strandPaths.length; s++) {
                    const strand = strandPaths[s];
                    if (!strand || !strand.points) continue;
                    
                    for (let p = 0; p < strand.points.length; p++) {
                        const point = strand.points[p];
                        const dx = mouseX - point.x;
                        const dy = mouseY - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < hitThreshold && distance < minDistance) {
                            minDistance = distance;
                            closestStrand = strand.utility;
                        }
                    }
                }
                
                return closestStrand;
            }
            
            // Canvas click handler
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const clickedUtility = getClickedStrand(mouseX, mouseY);
                if (clickedUtility && utilityData[clickedUtility]) {
                    showUtilityModal(clickedUtility, utilityData[clickedUtility]);
                }
            });
            
            // Canvas hover handler for cursor feedback
            canvas.addEventListener('mousemove', function(e) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const nearStrand = getClickedStrand(mouseX, mouseY);
                if (nearStrand) {
                    canvas.style.cursor = 'pointer';
                    hoveredStrand = nearStrand;
                    showTooltip(nearStrand, mouseX, mouseY - 10);
                } else {
                    canvas.style.cursor = 'default';
                    if (hoveredStrand && !document.querySelector('.dna-legend-item:hover')) {
                        hoveredStrand = null;
                        hideTooltip();
                    }
                }
            });
            
            canvas.addEventListener('mouseleave', function() {
                canvas.style.cursor = 'default';
                if (!document.querySelector('.dna-legend-item:hover')) {
                    hoveredStrand = null;
                    hideTooltip();
                }
            });
            
            // Modal close handlers
            const modal = document.getElementById('utilityModal');
            const modalClose = document.getElementById('modalClose');
            const modalCloseBtn = document.getElementById('modalCloseBtn');
            const modalOverlay = document.querySelector('.modal-overlay');
            
            function closeModal() {
                modal.classList.remove('active');
            }
            
            modalClose.addEventListener('click', closeModal);
            modalCloseBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', closeModal);
            
            // Pause on hidden
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    cancelAnimationFrame(animationId);
                } else {
                    animate();
                }
            });
            
            // Initialize trend chart
            $timeout(function() {
                initializeTrendChart();
                initializeBillingCycleChart();
            }, 200);
        }
        
        function initializeBillingCycleChart() {
            const canvas = document.getElementById('billingCycleChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('Billing cycle chart canvas not found or Chart.js not loaded');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            const currentDay = 18;
            const totalDays = 30;
            const percentage = (currentDay / totalDays) * 100;
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Remaining'],
                    datasets: [{
                        data: [percentage, 100 - percentage],
                        backgroundColor: [
                            '#F59E0B', // Yellow/Orange for completed days
                            'rgba(229, 231, 235, 0.3)' // Light gray for remaining
                        ],
                        borderWidth: 0,
                        cutout: '75%',
                        rotation: -90
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    }
                }
            });
        }
        
        function initializeTrendChart() {
            const canvas = document.getElementById('trendChart');
            if (!canvas || typeof Chart === 'undefined') {
                console.warn('Trend chart canvas not found or Chart.js not loaded');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
                    datasets: [{
                        label: 'Electricity',
                        data: [320, 310, 295, 285, 305, 342],
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#F59E0B',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }, {
                        label: 'Water',
                        data: [18, 17, 16, 14, 15, 15.2],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            cornerRadius: 8,
                            titleFont: {
                                size: 13,
                                weight: '600'
                            },
                            bodyFont: {
                                size: 12
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#6B7280',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                color: '#6B7280',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }

        init();
    }
})();
