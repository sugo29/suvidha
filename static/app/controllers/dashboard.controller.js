// Dashboard Controller
(function() {
    'use strict';

    angular.module('suvidhaApp')
        .controller('DashboardController', ['$scope', '$timeout', 'ApiService', DashboardController]);

    function DashboardController($scope, $timeout, ApiService) {
        var vm = this;
        vm.loading = true;
        vm.userData = {};

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
                    vm.userData = response.data;
                    vm.loading = false;
                })
                .catch(function(error) {
                    console.error('Error loading dashboard data:', error);
                    vm.loading = false;
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
            
            // Draw strand
            function drawStrand(color, phaseOffset, depthOffset, isHighlighted) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const horizontalScale = 12;
                const segments = 80;
                const radius = helixRadius * 18;
                const thickness = strandThickness * (isHighlighted ? 14 : 10);
                
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments * Math.PI * 3.5;
                    const x = i * horizontalScale - segments * horizontalScale / 2 + depthOffset;
                    const y = radius * Math.sin(t + rotationAngle + phaseOffset);
                    const z = radius * Math.cos(t + rotationAngle + phaseOffset) + 100;
                    
                    const scale = 300 / (z + 300);
                    const projectedX = centerX + x * scale;
                    const projectedY = centerY + y * scale;
                    
                    if (i === 0) {
                        ctx.moveTo(projectedX, projectedY);
                    } else {
                        ctx.lineTo(projectedX, projectedY);
                    }
                }
                
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
                
                for (let i = 0; i < strandColors.length; i++) {
                    const phaseOffset = (i / strandColors.length) * Math.PI * 2;
                    const depthOffset = (i - 1) * 12;
                    const isHighlighted = hoveredStrand === strandKeys[i];
                    drawStrand(strandColors[i], phaseOffset, depthOffset, isHighlighted);
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
        }

        init();
    }
})();
