"""
Seed Data Script for Government Officials Admin Dashboard
Creates 250 government officials and related data for the admin dashboard
Also includes all admin API routes as a Blueprint
"""

from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import random
import uuid
import secrets

# Initialize Blueprint for admin routes
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# These will be set when blueprint is registered
db = None
GovOfficial = None
Grievance = None
MeterReading = None
RWAProject = None
AuditLog = None
FieldOperation = None
WardStats = None
ParticipationScheme = None
Redemption = None
Bill = None

def init_admin_models(database, models):
    """Initialize database and models for the blueprint"""
    global db, GovOfficial, Grievance, MeterReading, RWAProject, AuditLog
    global FieldOperation, WardStats, ParticipationScheme, Redemption, Bill
    
    db = database
    GovOfficial = models['GovOfficial']
    Grievance = models['Grievance']
    MeterReading = models['MeterReading']
    RWAProject = models['RWAProject']
    AuditLog = models['AuditLog']
    FieldOperation = models['FieldOperation']
    WardStats = models['WardStats']
    ParticipationScheme = models['ParticipationScheme']
    Redemption = models['Redemption']
    Bill = models['Bill']


# ============================================
# GOVERNMENT OFFICIAL ADMIN ENDPOINTS
# ============================================

@admin_bp.route('/auth/login', methods=['POST'])
def admin_login():
    """Login for government officials"""
    try:
        data = request.get_json()
        identifier = data.get('identifier', '')  # Email or Employee ID
        password = data.get('password', '')
        
        # Find official by email or employee_id
        official = GovOfficial.query.filter(
            (GovOfficial.email == identifier) | (GovOfficial.employee_id == identifier)
        ).first()
        
        if not official:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        if not check_password_hash(official.password, password):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        if not official.is_active:
            return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
        
        # Update last login
        official.last_login = datetime.utcnow()
        db.session.commit()
        
        # Store in session
        session['admin_id'] = official.id
        session['admin_employee_id'] = official.employee_id
        
        # Generate auth token
        auth_token = secrets.token_hex(32)
        session['admin_token'] = auth_token
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': auth_token,
            'official': official.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/auth/signup', methods=['POST'])
def admin_signup():
    """Signup for government officials"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'employeeId', 'password', 'department', 'designation']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Check if official exists
        if GovOfficial.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        if GovOfficial.query.filter_by(employee_id=data['employeeId']).first():
            return jsonify({'success': False, 'message': 'Employee ID already registered'}), 400
        
        # Create new official
        official = GovOfficial(
            employee_id=data['employeeId'],
            full_name=data['fullName'],
            email=data['email'],
            phone=data.get('phone', ''),
            password=generate_password_hash(data['password']),
            department=data['department'],
            designation=data['designation'],
            role='official',
            assigned_state=data.get('state', 'Delhi'),
            assigned_district=data.get('district', 'South Delhi'),
            assigned_ward=data.get('ward', 'Ward 15')
        )
        
        db.session.add(official)
        db.session.commit()
        
        # Store in session
        session['admin_id'] = official.id
        session['admin_employee_id'] = official.employee_id
        
        # Generate auth token
        auth_token = secrets.token_hex(32)
        session['admin_token'] = auth_token
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully',
            'token': auth_token,
            'official': official.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/auth/logout', methods=['POST'])
def admin_logout():
    """Logout for government officials"""
    session.pop('admin_id', None)
    session.pop('admin_employee_id', None)
    session.pop('admin_token', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@admin_bp.route('/auth/me', methods=['GET'])
def admin_get_current():
    """Get current logged in official"""
    admin_id = session.get('admin_id')
    if not admin_id:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    official = GovOfficial.query.get(admin_id)
    if not official:
        return jsonify({'success': False, 'message': 'Official not found'}), 404
    
    return jsonify({'success': True, 'official': official.to_dict()}), 200


@admin_bp.route('/dashboard', methods=['GET'])
def admin_dashboard():
    """Get dashboard statistics for admin"""
    try:
        # Get filter parameters
        state = request.args.get('state', 'all')
        district = request.args.get('district', 'all')
        ward = request.args.get('ward', 'all')
        
        # Build base query filters
        grievance_query = Grievance.query
        if state != 'all':
            grievance_query = grievance_query.filter_by(state=state)
        if district != 'all':
            grievance_query = grievance_query.filter_by(district=district)
        if ward != 'all':
            grievance_query = grievance_query.filter_by(ward=ward)
        
        # Calculate statistics
        active_complaints = grievance_query.filter(Grievance.status.in_(['pending', 'assigned', 'in_progress', 'escalated'])).count()
        sla_breaches = grievance_query.filter_by(sla_breached=True).count()
        
        # Get areas under stress (wards with high complaints)
        ward_stats = WardStats.query.all()
        stress_areas = sum(1 for ws in ward_stats if ws.electricity_stress == 'high' or ws.water_stress == 'high' or ws.gas_stress == 'high')
        
        # Get active outages
        active_outages = sum(ws.active_outages for ws in ward_stats)
        
        # Revenue statistics (mock for now, can be calculated from bills)
        today = datetime.utcnow().date()
        month_start = today.replace(day=1)
        
        today_collections = Bill.query.filter(
            Bill.paid_date >= datetime.combine(today, datetime.min.time()),
            Bill.status == 'paid'
        ).with_entities(db.func.sum(Bill.amount)).scalar() or 0
        
        month_collections = Bill.query.filter(
            Bill.paid_date >= datetime.combine(month_start, datetime.min.time()),
            Bill.status == 'paid'
        ).with_entities(db.func.sum(Bill.amount)).scalar() or 0
        
        pending_amount = Bill.query.filter_by(status='pending').with_entities(db.func.sum(Bill.amount)).scalar() or 0
        
        # Format revenue (in Lakhs/Crores)
        def format_revenue(amount):
            if amount >= 10000000:
                return f'{amount/10000000:.2f}Cr'
            elif amount >= 100000:
                return f'{amount/100000:.2f}L'
            else:
                return f'₹{amount:,.0f}'
        
        return jsonify({
            'success': True,
            'stats': {
                'activeComplaints': active_complaints,
                'slaBreaches': sla_breaches,
                'areasStress': stress_areas,
                'activeOutages': active_outages
            },
            'revenue': {
                'todayCollections': format_revenue(today_collections),
                'monthToDate': format_revenue(month_collections),
                'pending': format_revenue(pending_amount),
                'syncAlerts': 2
            }
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/grievances', methods=['GET'])
def admin_get_grievances():
    """Get all grievances with filters"""
    try:
        # Get filter parameters
        status = request.args.get('status', 'all')
        severity = request.args.get('severity', 'all')
        utility_type = request.args.get('utility_type', 'all')
        ward = request.args.get('ward', 'all')
        limit = request.args.get('limit', 50, type=int)
        
        query = Grievance.query
        
        if status != 'all':
            query = query.filter_by(status=status)
        if severity != 'all':
            query = query.filter_by(severity=severity)
        if utility_type != 'all':
            query = query.filter_by(utility_type=utility_type)
        if ward != 'all':
            query = query.filter_by(ward=ward)
        
        grievances = query.order_by(Grievance.created_at.desc()).limit(limit).all()
        
        # Calculate SLA time remaining
        result = []
        for g in grievances:
            g_dict = g.to_dict()
            if g.sla_deadline:
                time_remaining = g.sla_deadline - datetime.utcnow()
                hours = int(time_remaining.total_seconds() // 3600)
                minutes = int((time_remaining.total_seconds() % 3600) // 60)
                if hours < 0:
                    g_dict['slaTime'] = 'Breached'
                    g_dict['slaClass'] = 'critical'
                elif hours < 2:
                    g_dict['slaTime'] = f'{hours}h {minutes}m'
                    g_dict['slaClass'] = 'critical'
                elif hours < 6:
                    g_dict['slaTime'] = f'{hours}h {minutes}m'
                    g_dict['slaClass'] = 'warning'
                else:
                    g_dict['slaTime'] = f'{hours}h {minutes}m'
                    g_dict['slaClass'] = 'safe'
            result.append(g_dict)
        
        # Get statistics
        stats = {
            'pending': Grievance.query.filter_by(status='pending').count(),
            'slaRisk': Grievance.query.filter(
                Grievance.sla_deadline <= datetime.utcnow() + timedelta(hours=4),
                Grievance.status.in_(['pending', 'assigned', 'in_progress'])
            ).count(),
            'escalated': Grievance.query.filter_by(status='escalated').count(),
            'resolved': Grievance.query.filter_by(status='resolved').count()
        }
        
        return jsonify({
            'success': True,
            'grievances': result,
            'stats': stats
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/meter-readings', methods=['GET'])
def admin_get_meter_readings():
    """Get meter readings with filters"""
    try:
        status = request.args.get('status', 'all')
        limit = request.args.get('limit', 50, type=int)
        
        query = MeterReading.query
        if status != 'all':
            query = query.filter_by(status=status)
        
        readings = query.order_by(MeterReading.reading_time.desc()).limit(limit).all()
        
        # Get statistics
        stats = {
            'verified': MeterReading.query.filter_by(status='verified').count(),
            'review': MeterReading.query.filter_by(status='review').count(),
            'suspicious': MeterReading.query.filter_by(status='suspicious').count(),
            'aiConfidence': db.session.query(db.func.avg(MeterReading.ai_confidence)).scalar() or 0
        }
        
        return jsonify({
            'success': True,
            'readings': [r.to_dict() for r in readings],
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/meter-readings/<reading_id>/approve', methods=['POST'])
def admin_approve_meter(reading_id):
    """Approve a meter reading"""
    try:
        reading = MeterReading.query.get(reading_id)
        if not reading:
            return jsonify({'success': False, 'message': 'Reading not found'}), 404
        
        reading.status = 'verified'
        reading.ai_confidence = 100
        reading.verified_at = datetime.utcnow()
        reading.verified_by = session.get('admin_id')
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Reading approved', 'reading': reading.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/rwa-projects', methods=['GET'])
def admin_get_rwa_projects():
    """Get RWA projects"""
    try:
        status = request.args.get('status', 'all')
        
        query = RWAProject.query
        if status != 'all':
            query = query.filter_by(status=status)
        
        projects = query.order_by(RWAProject.deadline).all()
        
        # Get statistics
        stats = {
            'total': RWAProject.query.count(),
            'completed': RWAProject.query.filter_by(status='completed').count(),
            'inProgress': RWAProject.query.filter(RWAProject.status.in_(['in_progress', 'near_complete'])).count(),
            'delayed': RWAProject.query.filter_by(status='delayed').count()
        }
        
        return jsonify({
            'success': True,
            'projects': [p.to_dict() for p in projects],
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/audit-logs', methods=['GET'])
def admin_get_audit_logs():
    """Get audit logs"""
    try:
        action_type = request.args.get('type', 'all')
        source = request.args.get('source', 'all')
        limit = request.args.get('limit', 50, type=int)
        
        query = AuditLog.query
        
        if action_type != 'all':
            query = query.filter_by(action_type=action_type)
        if source != 'all':
            query = query.filter_by(source=source)
        
        logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/field-operations', methods=['GET'])
def admin_get_field_operations():
    """Get field operations"""
    try:
        status = request.args.get('status', 'all')
        
        query = FieldOperation.query
        if status != 'all':
            query = query.filter_by(status=status)
        
        operations = query.order_by(FieldOperation.scheduled_date.desc()).all()
        
        return jsonify({
            'success': True,
            'operations': [op.to_dict() for op in operations]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/ward-stats', methods=['GET'])
def admin_get_ward_stats():
    """Get ward statistics"""
    try:
        ward_stats = WardStats.query.all()
        
        return jsonify({
            'success': True,
            'wardStats': [ws.to_dict() for ws in ward_stats]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/participation', methods=['GET'])
def admin_get_participation():
    """Get participation and incentive data"""
    try:
        schemes = ParticipationScheme.query.filter_by(is_active=True).all()
        redemptions = Redemption.query.order_by(Redemption.created_at.desc()).limit(20).all()
        
        # Get ward participation data
        ward_stats = WardStats.query.all()
        wards = []
        for ws in ward_stats:
            wards.append({
                'id': ws.ward,
                'name': ws.ward_name,
                'participation': ws.participation_rate,
                'level': 'very-high' if ws.participation_rate >= 80 else 'high' if ws.participation_rate >= 60 else 'medium' if ws.participation_rate >= 40 else 'low'
            })
        
        # Statistics
        stats = {
            'totalParticipants': sum(s.total_participants for s in schemes),
            'activeSchemes': len(schemes),
            'pendingRedemptions': Redemption.query.filter_by(is_verified=False).count(),
            'abuseAlerts': sum(1 for s in schemes if s.abuse_rate == 'high')
        }
        
        return jsonify({
            'success': True,
            'schemes': [s.to_dict() for s in schemes],
            'redemptions': [r.to_dict() for r in redemptions],
            'wards': wards,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/policy/ward-rankings', methods=['GET'])
def admin_get_ward_rankings():
    """Get ward rankings for policy insights"""
    try:
        ward_stats = WardStats.query.order_by(WardStats.satisfaction_score.desc()).all()
        
        rankings = []
        grades = ['A+', 'A', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
        for i, ws in enumerate(ward_stats):
            grade_index = min(i // 3, len(grades) - 1)
            rankings.append({
                'name': ws.ward_name or ws.ward,
                'resolved': ws.resolved_complaints,
                'avgTime': f'{ws.avg_resolution_time:.1f} hrs',
                'satisfaction': ws.satisfaction_score,
                'score': grades[grade_index],
                'scoreClass': 'success' if grade_index < 2 else 'info' if grade_index < 4 else 'warning' if grade_index < 6 else 'danger',
                'participationScore': ws.participation_rate,
                'waterComplaints': ws.water_complaints,
                'electricityComplaints': ws.electricity_complaints,
                'gasComplaints': ws.gas_complaints,
                'trend': ws.trend
            })
        
        return jsonify({
            'success': True,
            'rankings': rankings
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/officials', methods=['GET'])
def admin_get_officials():
    """Get all government officials"""
    try:
        department = request.args.get('department', 'all')
        
        query = GovOfficial.query
        if department != 'all':
            query = query.filter_by(department=department)
        
        officials = query.order_by(GovOfficial.full_name).all()
        
        return jsonify({
            'success': True,
            'officials': [o.to_dict() for o in officials]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/utility-trends', methods=['GET'])
def admin_get_utility_trends():
    """Get utility consumption trends for charts"""
    try:
        # Get the last 30 days of data
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Aggregate daily consumption
        daily_data = db.session.query(
            db.func.date(Bill.billing_period_end).label('date'),
            Bill.utility_type,
            db.func.sum(Bill.consumption).label('total_consumption')
        ).filter(
            Bill.billing_period_end >= thirty_days_ago
        ).group_by(
            db.func.date(Bill.billing_period_end),
            Bill.utility_type
        ).all()
        
        # Process data for chart
        electricity_data = []
        water_data = []
        gas_data = []
        labels = []
        
        # Generate last 7 days as labels
        for i in range(6, -1, -1):
            date = datetime.utcnow() - timedelta(days=i)
            labels.append(date.strftime('%a'))
        
        # Mock data for charts (would be calculated from actual bills in production)
        electricity_data = [850, 920, 880, 950, 830, 890, 910]
        water_data = [420, 380, 450, 410, 390, 430, 400]
        gas_data = [120, 150, 130, 140, 125, 135, 145]
        
        return jsonify({
            'success': True,
            'labels': labels,
            'electricity': electricity_data,
            'water': water_data,
            'gas': gas_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================
# SEED DATA SECTION
# ============================================

# Indian names dataset
FIRST_NAMES = [
    'Rajesh', 'Amit', 'Sunil', 'Vijay', 'Anil', 'Sanjay', 'Manoj', 'Rakesh', 'Ashok', 'Ramesh',
    'Priya', 'Sunita', 'Kavita', 'Neha', 'Pooja', 'Anjali', 'Deepa', 'Rekha', 'Meena', 'Seema',
    'Rahul', 'Nikhil', 'Abhishek', 'Rohit', 'Vivek', 'Sachin', 'Gaurav', 'Mohit', 'Ankit', 'Varun',
    'Swati', 'Ritu', 'Nisha', 'Megha', 'Pallavi', 'Shweta', 'Divya', 'Aarti', 'Jyoti', 'Komal',
    'Sandeep', 'Praveen', 'Ajay', 'Deepak', 'Suresh', 'Mukesh', 'Dinesh', 'Naresh', 'Harish', 'Girish',
    'Preeti', 'Geeta', 'Savita', 'Anita', 'Suman', 'Poonam', 'Kiran', 'Archana', 'Vandana', 'Sapna',
    'Vikram', 'Arjun', 'Karan', 'Siddharth', 'Akash', 'Kunal', 'Tarun', 'Kapil', 'Nitin', 'Pankaj',
    'Shruti', 'Kritika', 'Aditi', 'Tanvi', 'Sneha', 'Bhavna', 'Manju', 'Usha', 'Lata', 'Sarla'
]

LAST_NAMES = [
    'Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Yadav', 'Patel', 'Jain', 'Agarwal', 'Mishra',
    'Tiwari', 'Pandey', 'Saxena', 'Rastogi', 'Mehta', 'Shah', 'Reddy', 'Nair', 'Pillai', 'Menon',
    'Iyer', 'Rao', 'Chopra', 'Malhotra', 'Kapoor', 'Bhatia', 'Khanna', 'Arora', 'Sethi', 'Bansal',
    'Mittal', 'Aggarwal', 'Goel', 'Goyal', 'Singhal', 'Joshi', 'Dubey', 'Srivastava', 'Tripathi', 'Chauhan'
]

DEPARTMENTS = ['grievance', 'utilities', 'field_ops', 'policy', 'audit', 'waste', 'rwa', 'meter']
DEPARTMENT_NAMES = {
    'grievance': 'Grievance Management',
    'utilities': 'Utilities Department',
    'field_ops': 'Field Operations',
    'policy': 'Policy Administration',
    'audit': 'Audit & Compliance',
    'waste': 'Waste Management',
    'rwa': 'RWA Oversight',
    'meter': 'Meter Integrity'
}

DESIGNATIONS = ['junior_officer', 'senior_officer', 'assistant_commissioner', 'deputy_commissioner', 'commissioner', 'director']
DESIGNATION_NAMES = {
    'junior_officer': 'Junior Officer',
    'senior_officer': 'Senior Officer',
    'assistant_commissioner': 'Assistant Commissioner',
    'deputy_commissioner': 'Deputy Commissioner',
    'commissioner': 'Commissioner',
    'director': 'Director'
}

STATES = ['Delhi', 'Uttar Pradesh', 'Haryana', 'Rajasthan']
DISTRICTS = {
    'Delhi': ['South Delhi', 'North Delhi', 'Central Delhi', 'East Delhi', 'West Delhi'],
    'Uttar Pradesh': ['Noida', 'Ghaziabad', 'Lucknow', 'Agra'],
    'Haryana': ['Gurugram', 'Faridabad', 'Sonipat', 'Panipat'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota']
}

WARDS = [f'Ward {i}' for i in range(1, 33)]
LOCALITIES = ['Rohini', 'Dwarka', 'Saket', 'Lajpat Nagar', 'Civil Lines', 'Karol Bagh', 'Connaught Place', 
              'Vasant Kunj', 'Greater Kailash', 'Hauz Khas', 'Defence Colony', 'Mayur Vihar']

UTILITY_TYPES = ['electricity', 'water', 'gas']
GRIEVANCE_CATEGORIES = ['billing', 'outage', 'quality', 'safety', 'meter', 'connection', 'leak', 'pressure']
GRIEVANCE_STATUSES = ['pending', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed']
SEVERITIES = ['low', 'medium', 'high', 'critical']

RWA_PURPOSES = ['Green Spaces', 'Infrastructure', 'Maintenance', 'Water Supply', 'Sanitation', 'Recreation', 
                'Street Lighting', 'Security', 'Community Hall', 'Drainage']

PROJECT_STATUSES = ['not_started', 'in_progress', 'delayed', 'near_complete', 'completed']

AUDIT_ACTIONS = ['Grievance Resolved', 'Complaint Escalated', 'Policy Updated', 'Access Revoked', 
                 'Payment Verified', 'Report Generated', 'Data Sync Completed', 'System Configuration Changed',
                 'User Account Created', 'SLA Breach Logged', 'Meter Reading Approved', 'Project Status Updated']

FIELD_OPERATION_TYPES = ['inspection', 'repair', 'installation', 'maintenance', 'emergency', 'survey']

REWARD_TYPES = ['Movie Ticket', 'Shopping Voucher', 'Bus Pass', 'Electricity Credit', 'Water Credit', 
                'Gas Subsidy', 'Grocery Voucher', 'Medical Discount', 'Fuel Voucher', 'Restaurant Coupon']


def generate_employee_id(index):
    """Generate unique employee ID"""
    return f"GOV-{str(index).zfill(4)}"


def generate_grievance_id(index):
    """Generate unique grievance ID"""
    return f"GRV-2026-{str(index).zfill(5)}"


def generate_meter_id():
    """Generate unique meter ID"""
    return f"MTR-{random.randint(1000, 9999)}"


def generate_operation_id(index):
    """Generate unique operation ID"""
    return f"FOP-2026-{str(index).zfill(5)}"


def generate_log_id(index):
    """Generate unique log ID"""
    date_str = datetime.utcnow().strftime('%Y%m%d')
    return f"LOG-{date_str}-{str(index).zfill(5)}"


def seed_gov_officials():
    """Create 250 government officials"""
    print("Creating 250 government officials...")
    
    officials = []
    used_names = set()
    
    for i in range(1, 251):
        # First official has fixed name for predictable login
        if i == 1:
            first_name = "Rajesh"
            last_name = "Kumar"
            full_name = f"{first_name} {last_name}"
            used_names.add(full_name)
        else:
            # Generate unique name
            while True:
                first_name = random.choice(FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                full_name = f"{first_name} {last_name}"
                if full_name not in used_names:
                    used_names.add(full_name)
                    break
        
        # Generate email
        email = f"{first_name.lower()}.{last_name.lower()}{i}@gov.in"
        
        # Assign department and designation
        department = random.choice(DEPARTMENTS)
        
        # Higher designations are less common
        designation_weights = [40, 30, 15, 10, 3, 2]  # Probabilities for each designation
        designation = random.choices(DESIGNATIONS, weights=designation_weights)[0]
        
        # Assign location
        state = random.choice(STATES)
        district = random.choice(DISTRICTS[state])
        ward = random.choice(WARDS)
        
        # Generate performance metrics
        grievances_handled = random.randint(50, 500) if designation not in ['junior_officer'] else random.randint(10, 100)
        resolution_rate = random.uniform(0.7, 0.98)
        grievances_resolved = int(grievances_handled * resolution_rate)
        avg_resolution_time = random.uniform(2.0, 12.0)
        satisfaction_score = random.uniform(65.0, 98.0)
        
        official = GovOfficial(
            employee_id=generate_employee_id(i),
            full_name=full_name,
            email=email,
            phone=f"+91-{random.randint(7000000000, 9999999999)}",
            password=generate_password_hash("admin123"),  # Default password for all
            department=department,
            designation=designation,
            role='admin' if i <= 5 else 'supervisor' if i <= 20 else 'official',
            assigned_state=state,
            assigned_district=district,
            assigned_ward=ward,
            is_active=random.random() > 0.05,  # 95% active
            is_verified=True,
            last_login=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            grievances_handled=grievances_handled,
            grievances_resolved=grievances_resolved,
            avg_resolution_time=avg_resolution_time,
            satisfaction_score=satisfaction_score
        )
        officials.append(official)
    
    db.session.add_all(officials)
    db.session.commit()
    print(f"Created {len(officials)} government officials")
    return officials


def seed_ward_stats():
    """Create ward statistics for all 32 wards"""
    print("Creating ward statistics...")
    
    ward_stats = []
    ward_full_names = {
        'Ward 1': 'Ward 1 - Narela',
        'Ward 2': 'Ward 2 - Burari',
        'Ward 3': 'Ward 3 - Civil Lines',
        'Ward 4': 'Ward 4 - Karol Bagh',
        'Ward 5': 'Ward 5 - Model Town',
        'Ward 6': 'Ward 6 - Sadar Bazar',
        'Ward 7': 'Ward 7 - Chandni Chowk',
        'Ward 8': 'Ward 8 - Dwarka',
        'Ward 9': 'Ward 9 - Vasant Kunj',
        'Ward 10': 'Ward 10 - Malviya Nagar',
        'Ward 11': 'Ward 11 - Lajpat Nagar',
        'Ward 12': 'Ward 12 - Jangpura',
        'Ward 13': 'Ward 13 - Kasturba Nagar',
        'Ward 14': 'Ward 14 - Rajouri Garden',
        'Ward 15': 'Ward 15 - Rohini',
        'Ward 16': 'Ward 16 - Shalimar Bagh',
        'Ward 17': 'Ward 17 - Keshav Puram',
        'Ward 18': 'Ward 18 - Ashok Vihar',
        'Ward 19': 'Ward 19 - Patel Nagar',
        'Ward 20': 'Ward 20 - Rajinder Nagar',
        'Ward 21': 'Ward 21 - Tilak Nagar',
        'Ward 22': 'Ward 22 - Saket',
        'Ward 23': 'Ward 23 - Greater Kailash',
        'Ward 24': 'Ward 24 - Hauz Khas',
        'Ward 25': 'Ward 25 - Defence Colony',
        'Ward 26': 'Ward 26 - Mayur Vihar Phase 1',
        'Ward 27': 'Ward 27 - Mayur Vihar Phase 2',
        'Ward 28': 'Ward 28 - Patparganj',
        'Ward 29': 'Ward 29 - Preet Vihar',
        'Ward 30': 'Ward 30 - Vishwas Nagar',
        'Ward 31': 'Ward 31 - Krishna Nagar',
        'Ward 32': 'Ward 32 - Gandhi Nagar'
    }
    
    for ward in WARDS:
        total = random.randint(100, 500)
        resolved = int(total * random.uniform(0.5, 0.9))
        pending = total - resolved
        
        ws = WardStats(
            ward=ward,
            ward_name=ward_full_names.get(ward, ward),
            total_complaints=total,
            pending_complaints=pending,
            resolved_complaints=resolved,
            sla_breaches=random.randint(0, 30),
            avg_resolution_time=random.uniform(3.0, 12.0),
            satisfaction_score=random.uniform(60.0, 95.0),
            participation_rate=random.uniform(30.0, 90.0),
            electricity_complaints=random.randint(20, 150),
            water_complaints=random.randint(30, 200),
            gas_complaints=random.randint(10, 80),
            electricity_stress=random.choice(['low', 'medium', 'high']),
            water_stress=random.choice(['low', 'medium', 'high']),
            gas_stress=random.choice(['low', 'medium', 'high']),
            active_outages=random.randint(0, 5),
            trend=f"{'+' if random.random() > 0.3 else '-'}{random.uniform(0.5, 5.0):.1f}%"
        )
        ward_stats.append(ws)
    
    db.session.add_all(ward_stats)
    db.session.commit()
    print(f"Created {len(ward_stats)} ward statistics")
    return ward_stats


def seed_grievances(officials):
    """Create grievances"""
    print("Creating grievances...")
    
    grievances = []
    
    for i in range(1, 501):
        state = random.choice(STATES)
        district = random.choice(DISTRICTS[state])
        ward = random.choice(WARDS)
        utility = random.choice(UTILITY_TYPES)
        status = random.choice(GRIEVANCE_STATUSES)
        severity = random.choice(SEVERITIES)
        
        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
        
        # Calculate SLA based on severity
        sla_hours = {'low': 48, 'medium': 24, 'high': 12, 'critical': 6}[severity]
        sla_deadline = created_at + timedelta(hours=sla_hours)
        sla_breached = sla_deadline < datetime.utcnow() and status not in ['resolved', 'closed']
        
        # Assign to an official if not pending
        assigned_official = random.choice(officials) if status not in ['pending'] else None
        
        grievance = Grievance(
            grievance_id=generate_grievance_id(i),
            complainant_name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)[0]}.",
            complainant_phone=f"+91-{random.randint(7000000000, 9999999999)}",
            state=state,
            district=district,
            ward=ward,
            locality=random.choice(LOCALITIES),
            utility_type=utility,
            category=random.choice(GRIEVANCE_CATEGORIES),
            title=f"{utility.capitalize()} {random.choice(GRIEVANCE_CATEGORIES)} issue in {ward}",
            description=f"Complaint regarding {utility} service. {random.choice(['Urgent attention required.', 'Please resolve soon.', 'Issue persisting for days.', 'Multiple follow-ups made.'])}",
            status=status,
            severity=severity,
            priority={'critical': 1, 'high': 2, 'medium': 3, 'low': 4}[severity],
            sla_hours=sla_hours,
            sla_deadline=sla_deadline,
            sla_breached=sla_breached,
            assigned_official_id=assigned_official.id if assigned_official else None,
            assigned_at=created_at + timedelta(hours=random.randint(1, 4)) if assigned_official else None,
            created_at=created_at,
            resolved_at=created_at + timedelta(hours=random.randint(2, 48)) if status in ['resolved', 'closed'] else None,
            resolution_time_hours=random.uniform(2.0, 24.0) if status in ['resolved', 'closed'] else None
        )
        grievances.append(grievance)
    
    db.session.add_all(grievances)
    db.session.commit()
    print(f"Created {len(grievances)} grievances")
    return grievances


def seed_meter_readings():
    """Create meter readings"""
    print("Creating meter readings...")
    
    readings = []
    statuses = ['verified', 'verified', 'verified', 'review', 'suspicious']  # More verified readings
    
    for i in range(200):
        ward = random.choice(WARDS)
        status = random.choice(statuses)
        confidence = random.uniform(85, 100) if status == 'verified' else random.uniform(40, 84) if status == 'review' else random.uniform(20, 50)
        
        reading = MeterReading(
            meter_id=generate_meter_id(),
            ward=ward,
            locality=random.choice(LOCALITIES),
            block=f"Block {random.choice(['A', 'B', 'C', 'D', 'E'])}",
            sector=f"Sector {random.randint(1, 30)}",
            reading_value=random.randint(500, 15000),
            reading_unit=random.choice(['kWh', 'kL', 'SCM']),
            utility_type=random.choice(UTILITY_TYPES),
            ai_confidence=confidence,
            status=status,
            reading_time=datetime.utcnow() - timedelta(hours=random.randint(0, 72))
        )
        readings.append(reading)
    
    db.session.add_all(readings)
    db.session.commit()
    print(f"Created {len(readings)} meter readings")
    return readings


def seed_rwa_projects(officials):
    """Create RWA projects"""
    print("Creating RWA projects...")
    
    projects = []
    rwa_names = [f"{random.choice(LOCALITIES)} RWA" for _ in range(30)]
    
    for i in range(60):
        purpose = random.choice(RWA_PURPOSES)
        allocated = random.randint(200000, 2500000)
        status = random.choice(PROJECT_STATUSES)
        progress = {'not_started': random.randint(0, 5), 'in_progress': random.randint(20, 60), 
                    'delayed': random.randint(10, 40), 'near_complete': random.randint(80, 95), 
                    'completed': 100}[status]
        
        start_date = datetime.utcnow() - timedelta(days=random.randint(30, 180))
        deadline = start_date + timedelta(days=random.randint(60, 180))
        
        project = RWAProject(
            project_name=f"{purpose} - {random.choice(WARDS)}",
            rwa_name=random.choice(rwa_names),
            ward=random.choice(WARDS),
            sector=f"Sector {random.randint(1, 30)}",
            allocated_budget=allocated,
            utilized_budget=allocated * (progress / 100) * random.uniform(0.8, 1.1),
            purpose=purpose,
            start_date=start_date,
            deadline=deadline,
            completed_date=deadline - timedelta(days=random.randint(0, 10)) if status == 'completed' else None,
            progress=progress,
            status=status,
            supervised_by=random.choice(officials).id
        )
        projects.append(project)
    
    db.session.add_all(projects)
    db.session.commit()
    print(f"Created {len(projects)} RWA projects")
    return projects


def seed_audit_logs(officials):
    """Create audit logs"""
    print("Creating audit logs...")
    
    logs = []
    types = ['success', 'warning', 'info', 'danger']
    
    for i in range(200):
        official = random.choice(officials)
        action = random.choice(AUDIT_ACTIONS)
        action_type = random.choice(types)
        
        log = AuditLog(
            log_id=generate_log_id(i),
            action=action,
            action_type=action_type,
            official_id=official.id,
            official_name=f"{official.full_name} (ID: {official.employee_id})",
            department=DEPARTMENT_NAMES.get(official.department, official.department),
            reason=f"Action performed: {action}",
            related_id=f"REF-2026-{str(random.randint(10000, 99999))}",
            impact=random.choice(['Action Completed', 'Status Changed', 'Record Updated', 'Alert Raised', 'Report Generated']),
            severity=random.choice(['Normal', 'Medium', 'High']),
            source=random.choice(['Manual', 'System (AUTO)']),
            timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        )
        logs.append(log)
    
    db.session.add_all(logs)
    db.session.commit()
    print(f"Created {len(logs)} audit logs")
    return logs


def seed_field_operations(officials):
    """Create field operations"""
    print("Creating field operations...")
    
    operations = []
    
    for i in range(100):
        op_type = random.choice(FIELD_OPERATION_TYPES)
        utility = random.choice(UTILITY_TYPES)
        status = random.choice(['scheduled', 'in_progress', 'completed', 'cancelled'])
        
        scheduled = datetime.utcnow() + timedelta(days=random.randint(-7, 14))
        
        operation = FieldOperation(
            operation_id=generate_operation_id(i),
            operation_type=op_type,
            utility_type=utility,
            description=f"{op_type.capitalize()} operation for {utility} in {random.choice(LOCALITIES)}",
            ward=random.choice(WARDS),
            locality=random.choice(LOCALITIES),
            address=f"{random.randint(1, 500)}, {random.choice(LOCALITIES)}, {random.choice(WARDS)}",
            assigned_team=f"Team {random.choice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'])}",
            assigned_official_id=random.choice(officials).id,
            status=status,
            priority=random.choice(['low', 'medium', 'high', 'urgent']),
            scheduled_date=scheduled,
            start_time=scheduled if status in ['in_progress', 'completed'] else None,
            end_time=scheduled + timedelta(hours=random.randint(2, 8)) if status == 'completed' else None
        )
        operations.append(operation)
    
    db.session.add_all(operations)
    db.session.commit()
    print(f"Created {len(operations)} field operations")
    return operations


def seed_participation_schemes():
    """Create participation schemes"""
    print("Creating participation schemes...")
    
    scheme_names = [
        'Water Saving Bonus',
        'Waste Segregation Initiative',
        'Electricity Efficiency Program',
        'Community Health Reporting',
        'Green Energy Rewards',
        'Rainwater Harvesting Incentive',
        'Solar Panel Adoption',
        'E-Waste Collection Drive',
        'Tree Plantation Campaign',
        'Clean Streets Initiative',
        'Pollution Reporting',
        'Public Transport Usage'
    ]
    
    schemes = []
    
    for name in scheme_names:
        participants = random.randint(1000, 15000)
        scheme = ParticipationScheme(
            scheme_name=name,
            active_wards=random.randint(15, 32),
            total_participants=participants,
            participation_rate=random.uniform(40.0, 90.0),
            cost_per_engagement=random.uniform(10.0, 50.0),
            total_budget=random.randint(500000, 5000000),
            utilized_budget=random.randint(100000, 4000000),
            impact_status=random.choice(['low', 'medium', 'high']),
            abuse_rate=random.choice(['low', 'medium', 'high']),
            is_active=random.random() > 0.1
        )
        schemes.append(scheme)
    
    db.session.add_all(schemes)
    db.session.commit()
    print(f"Created {len(schemes)} participation schemes")
    return schemes


def seed_redemptions(officials):
    """Create redemptions"""
    print("Creating redemptions...")
    
    redemptions = []
    
    for i in range(100):
        redemption = Redemption(
            user_name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)[0]}.",
            reward_type=random.choice(REWARD_TYPES),
            points_used=random.choice([250, 500, 750, 1000, 1500, 2000]),
            ward=random.choice(WARDS),
            is_verified=random.random() > 0.2,
            verified_by=random.choice(officials).id if random.random() > 0.2 else None,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        redemptions.append(redemption)
    
    db.session.add_all(redemptions)
    db.session.commit()
    print(f"Created {len(redemptions)} redemptions")
    return redemptions


def clear_admin_data():
    """Clear all admin-related data"""
    print("Clearing existing admin data...")
    
    Redemption.query.delete()
    ParticipationScheme.query.delete()
    FieldOperation.query.delete()
    AuditLog.query.delete()
    RWAProject.query.delete()
    MeterReading.query.delete()
    Grievance.query.delete()
    WardStats.query.delete()
    GovOfficial.query.delete()
    
    db.session.commit()
    print("Cleared all existing admin data")


def seed_all():
    """Seed all admin data"""
    # Import here to avoid circular imports when running standalone
    from app import app as flask_app
    from models import db as database
    from models import (GovOfficial as GO, Grievance as GR, MeterReading as MR, 
                        RWAProject as RWA, AuditLog as AL, FieldOperation as FO, 
                        WardStats as WS, ParticipationScheme as PS, Redemption as RD)
    
    # Set global references for seed functions
    global db, GovOfficial, Grievance, MeterReading, RWAProject, AuditLog
    global FieldOperation, WardStats, ParticipationScheme, Redemption
    
    db = database
    GovOfficial = GO
    Grievance = GR
    MeterReading = MR
    RWAProject = RWA
    AuditLog = AL
    FieldOperation = FO
    WardStats = WS
    ParticipationScheme = PS
    Redemption = RD
    
    with flask_app.app_context():
        # Clear existing data
        clear_admin_data()
        
        # Seed in order (respecting foreign key dependencies)
        officials = seed_gov_officials()
        seed_ward_stats()
        seed_grievances(officials)
        seed_meter_readings()
        seed_rwa_projects(officials)
        seed_audit_logs(officials)
        seed_field_operations(officials)
        seed_participation_schemes()
        seed_redemptions(officials)
        
        print("\n" + "="*50)
        print("ADMIN DATA SEEDING COMPLETE!")
        print("="*50)
        print(f"Created:")
        print(f"  - 250 Government Officials")
        print(f"  - 32 Ward Statistics")
        print(f"  - 500 Grievances")
        print(f"  - 200 Meter Readings")
        print(f"  - 60 RWA Projects")
        print(f"  - 200 Audit Logs")
        print(f"  - 100 Field Operations")
        print(f"  - 12 Participation Schemes")
        print(f"  - 100 Redemptions")
        print("="*50)
        print("\nDefault login credentials:")
        print("  Email: rajesh.kumar1@gov.in")
        print("  Employee ID: GOV-0001")
        print("  Password: admin123")
        print("="*50)


if __name__ == '__main__':
    seed_all()
