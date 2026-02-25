from flask import Flask, render_template, session, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from models import (db, User, Vendor, Community, CommunityStats, Bill, ServiceReport,
                    GovOfficial, Grievance, MeterReading, RWAProject, AuditLog, 
                    FieldOperation, WardStats, ParticipationScheme, Redemption)

# Import admin blueprint
from admin_seed import admin_bp, init_admin_models

# Configure Flask to use different delimiters to avoid conflict with AngularJS
class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        variable_start_string='{$',
        variable_end_string='$}',
        comment_start_string='{#',
        comment_end_string='#}',
    ))

app = CustomFlask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = 'your-secret-key-here-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///suvidha.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)
CORS(app)

# Initialize admin models and register blueprint
init_admin_models(db, {
    'GovOfficial': GovOfficial,
    'Grievance': Grievance,
    'MeterReading': MeterReading,
    'RWAProject': RWAProject,
    'AuditLog': AuditLog,
    'FieldOperation': FieldOperation,
    'WardStats': WardStats,
    'ParticipationScheme': ParticipationScheme,
    'Redemption': Redemption,
    'Bill': Bill
})
app.register_blueprint(admin_bp)

# Create database tables
with app.app_context():
    db.create_all()
    # Initialize default vendors
    def init_vendors():
        """Initialize default vendors if they don't exist"""
        existing_vendors = Vendor.query.first()
        if existing_vendors:
            return
        
        vendors_data = [
            # Electricity Providers
            {'name': 'BSES Yamuna Power Ltd', 'service_type': 'electricity', 'description': 'Electricity distribution in Delhi'},
            {'name': 'Tata Power Delhi', 'service_type': 'electricity', 'description': 'Electricity distribution in Delhi'},
            {'name': 'CESC Limited', 'service_type': 'electricity', 'description': 'Electricity distribution in Kolkata'},
            {'name': 'Torrent Power', 'service_type': 'electricity', 'description': 'Electricity distribution in Gujarat'},
            
            # Water Providers
            {'name': 'Delhi Jal Board', 'service_type': 'water', 'description': 'Water supply in Delhi'},
            {'name': 'Brihanmumbai Municipal Corporation', 'service_type': 'water', 'description': 'Water supply in Mumbai'},
            {'name': 'Bangalore Water Supply & Sewerage Board', 'service_type': 'water', 'description': 'Water supply in Bangalore'},
            {'name': 'Chennai Metropolitan Water Supply & Sewerage Board', 'service_type': 'water', 'description': 'Water supply in Chennai'},
            
            # Gas Providers
            {'name': 'Indane (Cylinder)', 'service_type': 'gas', 'description': 'LPG gas cylinders delivery'},
            {'name': 'HP Gas (Cylinder)', 'service_type': 'gas', 'description': 'LPG gas cylinders delivery'},
            {'name': 'PNG (Pipeline Natural Gas)', 'service_type': 'gas', 'description': 'Pipeline natural gas supply'},
            {'name': 'Bharat Gas', 'service_type': 'gas', 'description': 'LPG gas cylinders delivery'},
        ]
        
        for vendor_data in vendors_data:
            vendor = Vendor(**vendor_data)
            db.session.add(vendor)
        
        db.session.commit()
    
    init_vendors()

# ============================================
# SERVE MAIN APP & ROUTING
# ============================================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>')
def catch_all(path):
    # Serve Government Dashboard files
    if path.startswith('GovOfficials-Admin/'):
        file_path = path[len('GovOfficials-Admin/'):]
        return send_from_directory('GovOfficials-Admin', file_path)
    if path.startswith('static/'):
        return app.send_static_file(path[7:])
    elif path.startswith('api/'):
        return app.send_static_file(path)
    return render_template('index.html')

@app.after_request
def add_header(response):
    """Add headers to prevent caching during development"""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================
@app.route('/api/auth/signup', methods=['POST'])
def api_signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'phone', 'password', 'state', 'city', 'ward', 'locality']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        if User.query.filter_by(phone=data['phone']).first():
            return jsonify({'success': False, 'message': 'Phone number already registered'}), 400
        
        # Create new user
        user = User(
            full_name=data['fullName'],
            email=data['email'],
            phone=data['phone'],
            password=generate_password_hash(data['password']),
            preferred_language=data.get('language', 'en'),
            aadhaar=data.get('aadhaar', None),
            aadhaar_consent=data.get('consent', False),
            state=data['state'],
            city=data['city'],
            ward=data['ward'],
            locality=data['locality'],
            electricity_provider_id=data.get('electricityProvider', None),
            water_provider_id=data.get('waterProvider', None),
            gas_provider_id=data.get('gasProvider', None),
            alerts_enabled=data.get('alertsEnabled', True)
        )
        
        db.session.add(user)
        db.session.flush()
        
        # Create community membership
        community = Community(
            user_id=user.id,
            state=data['state'],
            city=data['city'],
            ward=data['ward'],
            locality=data.get('locality', '')
        )
        db.session.add(community)
        
        db.session.commit()
        
        # Store in session
        session['user_id'] = user.id
        session['user_email'] = user.email
        
        # Generate a simple auth token
        auth_token = secrets.token_hex(32)
        session['auth_token'] = auth_token
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully',
            'user_id': user.id,
            'token': auth_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        
        # Find user by email or phone
        user = User.query.filter(
            (User.email == data.get('identifier')) | (User.phone == data.get('identifier'))
        ).first()
        
        if not user or not check_password_hash(user.password, data.get('password')):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        session['user_id'] = user.id
        session['user_email'] = user.email
        
        # Generate a simple auth token
        auth_token = secrets.token_hex(32)
        session['auth_token'] = auth_token
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user_id': user.id,
            'token': auth_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

# ============================================
# VENDORS ENDPOINTS
# ============================================
@app.route('/api/vendors', methods=['GET'])
def api_get_vendors():
    try:
        service_type = request.args.get('service_type', None)
        
        if service_type:
            vendors = Vendor.query.filter_by(service_type=service_type).all()
        else:
            vendors = Vendor.query.all()
        
        return jsonify({
            'success': True,
            'vendors': [vendor.to_dict() for vendor in vendors]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/vendors/<vendor_id>', methods=['GET'])
def api_get_vendor(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        
        if not vendor:
            return jsonify({'success': False, 'message': 'Vendor not found'}), 404
        
        return jsonify({
            'success': True,
            'vendor': vendor.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ============================================
# COMMUNITY ENDPOINTS
# ============================================
@app.route('/api/community/members', methods=['GET'])
def api_get_community_members():
    try:
        state = request.args.get('state')
        city = request.args.get('city')
        ward = request.args.get('ward')
        locality = request.args.get('locality')
        
        query = Community.query
        if state:
            query = query.filter_by(state=state)
        if city:
            query = query.filter_by(city=city)
        if ward:
            query = query.filter_by(ward=ward)
        if locality:
            query = query.filter_by(locality=locality)
        
        members = query.all()
        
        return jsonify({
            'success': True,
            'members': [member.to_dict() for member in members],
            'total': len(members)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/community/stats', methods=['GET'])
def api_get_community_stats():
    try:
        state = request.args.get('state')
        city = request.args.get('city')
        ward = request.args.get('ward')
        
        query = CommunityStats.query
        if state:
            query = query.filter_by(state=state)
        if city:
            query = query.filter_by(city=city)
        if ward:
            query = query.filter_by(ward=ward)
        
        stats = query.all()
        
        return jsonify({
            'success': True,
            'stats': [stat.to_dict() for stat in stats]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/community/user/<user_id>', methods=['GET'])
def api_get_user_community(user_id):
    try:
        community = Community.query.filter_by(user_id=user_id).first()
        
        if not community:
            return jsonify({'success': False, 'message': 'Community member not found'}), 404
        
        return jsonify({
            'success': True,
            'community': community.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/community/update-points', methods=['POST'])
def api_update_community_points():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        points = data.get('points', 0)
        
        community = Community.query.filter_by(user_id=user_id).first()
        if not community:
            return jsonify({'success': False, 'message': 'Community member not found'}), 404
        
        community.points_earned += points
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Points updated',
            'points': community.points_earned
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ============================================
# USER ENDPOINTS
# ============================================
@app.route('/api/users/<user_id>', methods=['GET'])
def api_get_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PUT'])
def api_update_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'preferred_language' in data:
            user.preferred_language = data['preferred_language']
        if 'alerts_enabled' in data:
            user.alerts_enabled = data['alerts_enabled']
        if 'electricity_provider_id' in data:
            user.electricity_provider_id = data['electricity_provider_id']
        if 'water_provider_id' in data:
            user.water_provider_id = data['water_provider_id']
        if 'gas_provider_id' in data:
            user.gas_provider_id = data['gas_provider_id']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ============================================
# EXISTING MOCK API ROUTES (for compatibility)
# ============================================
@app.route('/api/dashboard')
def api_dashboard():
    """Get comprehensive dashboard data for logged-in user"""
    user_id = session.get('user_id')
    
    # For demo purposes, use a default user if not logged in
    if not user_id:
        # Try to get first user from database for demo
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
        else:
            # Return empty data structure
            return jsonify({
                'username': 'Guest User',
                'user': {
                    'full_name': 'Guest User',
                    'email': 'guest@example.com',
                    'phone': 'N/A',
                    'state': 'N/A',
                    'city': 'N/A',
                    'ward': 'N/A',
                    'locality': 'N/A'
                },
                'consumption': {
                    'electricity': {'current': 0, 'unit': 'kWh', 'current_bill': 0, 'due_date': 'N/A', 'status': 'none'},
                    'gas': {'current': 0, 'unit': 'SCM', 'current_bill': 0, 'status': 'none'},
                    'water': {'current': 0, 'unit': 'kL', 'current_bill': 0, 'status': 'none'}
                },
                'reports': {'total': 0, 'open': 0, 'resolved': 0, 'in_progress': 0},
                'community': {'points': 0, 'challenges': 0, 'reports_submitted': 0, 'badges': []}
            })
    
    try:
        # Get user details
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Get recent bills for each utility type
        electricity_bill = Bill.query.filter_by(
            user_id=user_id, 
            utility_type='electricity'
        ).order_by(Bill.created_at.desc()).first()
        
        water_bill = Bill.query.filter_by(
            user_id=user_id,
            utility_type='water'
        ).order_by(Bill.created_at.desc()).first()
        
        gas_bill = Bill.query.filter_by(
            user_id=user_id,
            utility_type='gas'
        ).order_by(Bill.created_at.desc()).first()
        
        # Get service reports stats
        total_reports = ServiceReport.query.filter_by(user_id=user_id).count()
        open_reports = ServiceReport.query.filter_by(user_id=user_id, status='open').count()
        resolved_reports = ServiceReport.query.filter_by(user_id=user_id, status='resolved').count()
        in_progress_reports = ServiceReport.query.filter_by(user_id=user_id, status='in_progress').count()
        
        # Get community data
        community = Community.query.filter_by(user_id=user_id).first()
        
        # Prepare response with actual DB values (0 if no data)
        data = {
            'username': user.full_name,
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'phone': user.phone,
                'state': user.state,
                'city': user.city,
                'ward': user.ward,
                'locality': user.locality,
                'account_created': user.account_created.isoformat() if user.account_created else None
            },
            'consumption': {
                'electricity': {
                    'current': electricity_bill.consumption if electricity_bill else 0,
                    'unit': 'kWh',
                    'current_bill': electricity_bill.amount if electricity_bill else 0,
                    'due_date': electricity_bill.due_date.strftime('%d %b %Y') if electricity_bill else 'N/A',
                    'status': electricity_bill.status if electricity_bill else 'none'
                },
                'gas': {
                    'current': gas_bill.consumption if gas_bill else 0,
                    'unit': 'SCM',
                    'current_bill': gas_bill.amount if gas_bill else 0,
                    'status': gas_bill.status if gas_bill else 'none'
                },
                'water': {
                    'current': water_bill.consumption if water_bill else 0,
                    'unit': 'kL',
                    'current_bill': water_bill.amount if water_bill else 0,
                    'status': water_bill.status if water_bill else 'none'
                }
            },
            'reports': {
                'total': total_reports,
                'open': open_reports,
                'resolved': resolved_reports,
                'in_progress': in_progress_reports
            },
            'community': {
                'points': community.points_earned if community else 0,
                'challenges': community.challenges_participated if community else 0,
                'reports_submitted': community.reports_submitted if community else 0,
                'badges': community.badges.split(',') if (community and community.badges) else []
            }
        }
        
        return jsonify(data)
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/utilities')
def api_utilities():
    """Get utility consumption data from database"""
    user_id = session.get('user_id')
    
    # For demo, get first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if user_id:
        try:
            # Get last 12 months of electricity bills
            electricity_bills = Bill.query.filter_by(
                user_id=user_id,
                utility_type='electricity'
            ).order_by(Bill.billing_period_end.desc()).limit(12).all()
            
            # Get last 12 months of gas bills
            gas_bills = Bill.query.filter_by(
                user_id=user_id,
                utility_type='gas'
            ).order_by(Bill.billing_period_end.desc()).limit(12).all()
            
            # Get last 12 months of water bills
            water_bills = Bill.query.filter_by(
                user_id=user_id,
                utility_type='water'
            ).order_by(Bill.billing_period_end.desc()).limit(12).all()
            
            # Prepare monthly data (reverse to show oldest first)
            electricity_data = [b.consumption for b in reversed(electricity_bills)] if electricity_bills else [0]
            gas_data = [b.consumption for b in reversed(gas_bills)] if gas_bills else [0]
            water_data = [b.consumption for b in reversed(water_bills)] if water_bills else [0]
            
            # Get user details for provider info
            user = User.query.get(user_id)
            
            # Get provider names
            elec_provider = Vendor.query.get(user.electricity_provider_id) if user.electricity_provider_id else None
            gas_provider = Vendor.query.get(user.gas_provider_id) if user.gas_provider_id else None
            water_provider = Vendor.query.get(user.water_provider_id) if user.water_provider_id else None
            
            data = {
                'electricity': {
                    'monthly_data': electricity_data,
                    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][-len(electricity_data):],
                    'provider': elec_provider.name if elec_provider else 'Not Set',
                    'tariff': {
                        'slab1': 3.00,
                        'slab2': 4.50,
                        'slab3': 6.50
                    }
                },
                'gas': {
                    'monthly_data': gas_data,
                    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][-len(gas_data):],
                    'provider': gas_provider.name if gas_provider else 'Not Set'
                },
                'water': {
                    'monthly_data': water_data,
                    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][-len(water_data):],
                    'provider': water_provider.name if water_provider else 'Not Set'
                }
            }
            return jsonify(data)
            
        except Exception as e:
            print(f"Utilities API error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Fallback to empty data
    data = {
        'electricity': {
            'monthly_data': [0],
            'months': ['No Data'],
            'provider': 'Not Set',
            'tariff': {
                'slab1': 3.00,
                'slab2': 4.50,
                'slab3': 6.50
            }
        },
        'gas': {
            'monthly_data': [0],
            'months': ['No Data'],
            'provider': 'Not Set'
        },
        'water': {
            'monthly_data': [0],
            'months': ['No Data'],
            'provider': 'Not Set'
        }
    }
    return jsonify(data)

@app.route('/api/insights')
def api_insights():
    """Get insights data calculated from user's consumption"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if not user_id:
        return jsonify({
            'efficiency': {'electricity': 'unknown', 'gas': 'unknown', 'water': 'unknown'},
            'comparisons': {'ward_avg': 0, 'user_avg': 0},
            'profile': {
                'electricity': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'},
                'water': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'},
                'gas': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'}
            },
            'recommendations': {'electricity': {'savings': 0}}
        })
    
    try:
        user = User.query.get(user_id)
        
        # Calculate electricity insights
        elec_bills = Bill.query.filter_by(user_id=user_id, utility_type='electricity').order_by(Bill.created_at.desc()).limit(6).all()
        elec_avg = sum(b.consumption for b in elec_bills) / len(elec_bills) if elec_bills else 0
        if not elec_bills or elec_avg == 0:
            elec_efficiency = 'unknown'
            elec_score = 0
        else:
            elec_efficiency = 'efficient' if elec_avg < 200 else 'average' if elec_avg < 300 else 'high'
            elec_score = max(0, min(10, 10 - (elec_avg / 30)))  # Score out of 10
        
        # Determine trend (comparing first 3 vs last 3 bills)
        if len(elec_bills) >= 3:
            recent_avg = sum(b.consumption for b in elec_bills[:3]) / 3
            older_avg = sum(b.consumption for b in elec_bills[3:6]) / len(elec_bills[3:6]) if len(elec_bills) > 3 else recent_avg
            elec_trend = 'improving' if recent_avg < older_avg else 'warning' if recent_avg > older_avg else 'stable'
        else:
            elec_trend = 'stable'
        
        # Calculate water insights
        water_bills = Bill.query.filter_by(user_id=user_id, utility_type='water').order_by(Bill.created_at.desc()).limit(6).all()
        water_avg = sum(b.consumption for b in water_bills) / len(water_bills) if water_bills else 0
        if not water_bills or water_avg == 0:
            water_efficiency = 'unknown'
            water_score = 0
        else:
            water_efficiency = 'efficient' if water_avg < 15 else 'average' if water_avg < 25 else 'high'
            water_score = max(0, min(10, 10 - (water_avg / 3)))  # Score out of 10
        
        if len(water_bills) >= 3:
            recent_avg = sum(b.consumption for b in water_bills[:3]) / 3
            older_avg = sum(b.consumption for b in water_bills[3:6]) / len(water_bills[3:6]) if len(water_bills) > 3 else recent_avg
            water_trend = 'improving' if recent_avg < older_avg else 'warning' if recent_avg > older_avg else 'stable'
        else:
            water_trend = 'stable'
        
        # Calculate gas insights
        gas_bills = Bill.query.filter_by(user_id=user_id, utility_type='gas').order_by(Bill.created_at.desc()).limit(6).all()
        gas_avg = sum(b.consumption for b in gas_bills) / len(gas_bills) if gas_bills else 0
        if not gas_bills or gas_avg == 0:
            gas_efficiency = 'unknown'
            gas_score = 0
        else:
            gas_efficiency = 'efficient' if gas_avg < 20 else 'average' if gas_avg < 30 else 'high'
            gas_score = max(0, min(10, 10 - (gas_avg / 4)))  # Score out of 10
        
        if len(gas_bills) >= 3:
            recent_avg = sum(b.consumption for b in gas_bills[:3]) / 3
            older_avg = sum(b.consumption for b in gas_bills[3:6]) / len(gas_bills[3:6]) if len(gas_bills) > 3 else recent_avg
            gas_trend = 'improving' if recent_avg < older_avg else 'warning' if recent_avg > older_avg else 'stable'
        else:
            gas_trend = 'stable'
        
        # Calculate ward average (from all users in same ward)
        ward_bills = db.session.query(Bill).join(User).filter(
            User.ward == user.ward,
            Bill.utility_type == 'electricity'
        ).all()
        ward_avg = sum(b.consumption for b in ward_bills) / len(ward_bills) if ward_bills else 0
        
        # Calculate potential savings
        if elec_avg > 200:
            potential_savings = (elec_avg - 200) * 5 * 12  # Assuming ₹5 per unit saved over a year
        else:
            potential_savings = 0
        
        data = {
            'efficiency': {
                'electricity': elec_efficiency,
                'gas': gas_efficiency,
                'water': water_efficiency
            },
            'comparisons': {
                'ward_avg': round(ward_avg, 1),
                'user_avg': round(elec_avg, 1)
            },
            'profile': {
                'electricity': {
                    'score': round(elec_score, 1),
                    'avgMonthly': round(elec_avg, 1),
                    'trend': elec_trend
                },
                'water': {
                    'score': round(water_score, 1),
                    'avgMonthly': round(water_avg, 1),
                    'trend': water_trend
                },
                'gas': {
                    'score': round(gas_score, 1),
                    'avgMonthly': round(gas_avg, 1),
                    'trend': gas_trend
                }
            },
            'recommendations': {
                'electricity': {
                    'savings': round(potential_savings, 0)
                }
            }
        }
        return jsonify(data)
        
    except Exception as e:
        print(f"Insights API error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'efficiency': {'electricity': 'unknown', 'gas': 'unknown', 'water': 'unknown'},
            'comparisons': {'ward_avg': 0, 'user_avg': 0},
            'profile': {
                'electricity': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'},
                'water': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'},
                'gas': {'score': 0, 'avgMonthly': 0, 'trend': 'stable'}
            },
            'recommendations': {'electricity': {'savings': 0}}
        })

@app.route('/api/records')
def api_records():
    """Get billing records from database"""
    user_id = session.get('user_id')
    
    # For demo, get first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if user_id:
        try:
            # Get all bills for the user
            bills = Bill.query.filter_by(user_id=user_id).order_by(Bill.created_at.desc()).limit(50).all()
            
            bills_data = []
            for bill in bills:
                bills_data.append({
                    'date': bill.created_at.strftime('%b %d, %Y'),
                    'utility': bill.utility_type,
                    'bill_id': bill.bill_id,
                    'reading': f'{bill.consumption} {bill.consumption_unit}',
                    'amount': f'₹ {bill.amount:,.0f}',
                    'status': bill.status
                })
            
            return jsonify({'bills': bills_data})
            
        except Exception as e:
            print(f"Records API error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Fallback to empty data
    return jsonify({'bills': []})

@app.route('/api/community')
def api_community():
    """Get community data from database"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if not user_id:
        return jsonify({
            'ward': 'Unknown',
            'health_score': 0,
            'stress_map': [0, 0, 0, 0],
            'active_participants': 0,
            'recent_reports': 0
        })
    
    try:
        user = User.query.get(user_id)
        
        # Get community stats for this ward
        ward_stats = CommunityStats.query.filter_by(
            ward=user.ward,
            city=user.city
        ).first()
        
        # Calculate health score based on available data
        if ward_stats:
            # Health score calculation (0-100)
            # Based on: active participation, low stress levels, member engagement
            stress_weights = {
                'low': 100,
                'medium': 60,
                'high': 20
            }
            elec_score = stress_weights.get(ward_stats.electricity_stress_level, 60)
            water_score = stress_weights.get(ward_stats.water_stress_level, 60)
            gas_score = stress_weights.get(ward_stats.gas_stress_level, 60)
            
            # Average the scores
            health_score = round((elec_score + water_score + gas_score) / 3)
            
            # Stress map (numeric representation for charts)
            stress_map = [
                stress_weights.get(ward_stats.electricity_stress_level, 60),
                stress_weights.get(ward_stats.water_stress_level, 60),
                stress_weights.get(ward_stats.gas_stress_level, 60),
                health_score
            ]
            
            active_participants = ward_stats.active_members
        else:
            health_score = 0
            stress_map = [0, 0, 0, 0]
            active_participants = 0
        
        # Get recent reports count for this ward (last 7 days)
        from datetime import timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_reports = db.session.query(ServiceReport).join(User).filter(
            User.ward == user.ward,
            ServiceReport.created_at >= seven_days_ago
        ).count()
        
        data = {
            'ward': user.ward,
            'health_score': health_score,
            'stress_map': stress_map,
            'active_participants': active_participants,
            'recent_reports': recent_reports
        }
        return jsonify(data)
        
    except Exception as e:
        print(f"Community API error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'ward': 'Unknown',
            'health_score': 0,
            'stress_map': [0, 0, 0, 0],
            'active_participants': 0,
            'recent_reports': 0
        })

@app.route('/api/profile')
def api_profile():
    """Get user profile from database"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if not user_id:
        return jsonify({
            'name': 'Guest User',
            'phone': 'N/A',
            'address': 'N/A',
            'email': 'N/A'
        })
    
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Construct full address
        address = f"{user.locality}, {user.ward}, {user.city}, {user.state}"
        
        data = {
            'name': user.full_name,
            'phone': user.phone,
            'address': address,
            'email': user.email,
            'state': user.state,
            'city': user.city,
            'ward': user.ward,
            'locality': user.locality,
            'alerts_enabled': user.alerts_enabled,
            'preferred_language': user.preferred_language
        }
        return jsonify(data)
        
    except Exception as e:
        print(f"Profile API error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/services/submit', methods=['POST'])
def api_submit_service():
    """Submit a new service request"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
        else:
            return jsonify({'success': False, 'message': 'No user found'}), 400
    
    try:
        data = request.get_json()
        
        # Create service report
        report = ServiceReport(
            user_id=user_id,
            report_type=data.get('report_type', 'general'),
            utility_type=data.get('utility_type', 'general'),
            title=data.get('title', 'Service Request'),
            description=data.get('description', ''),
            status='open',
            priority=data.get('priority', 'medium'),
            location=data.get('location', '')
        )
        db.session.add(report)
        
        # Update community report count
        community = Community.query.filter_by(user_id=user_id).first()
        if community:
            community.reports_submitted += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Service request submitted successfully',
            'request_id': report.id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Service submit error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================
# BILL MANAGEMENT ENDPOINTS
# ============================================
@app.route('/api/bills/add', methods=['POST'])
def api_add_bill():
    """Add a new bill (for testing/demo purposes)"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
        else:
            return jsonify({'success': False, 'message': 'No user found'}), 400
    
    try:
        data = request.get_json()
        
        bill = Bill(
            user_id=user_id,
            utility_type=data['utility_type'],
            bill_id=data.get('bill_id', f'{data["utility_type"].upper()}-{datetime.now().strftime("%Y%m%d")}'),
            amount=float(data['amount']),
            consumption=float(data['consumption']),
            consumption_unit=data['consumption_unit'],
            billing_period_start=datetime.strptime(data['billing_period_start'], '%Y-%m-%d') if 'billing_period_start' in data else datetime.now() - timedelta(days=30),
            billing_period_end=datetime.strptime(data['billing_period_end'], '%Y-%m-%d') if 'billing_period_end' in data else datetime.now(),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if 'due_date' in data else datetime.now() + timedelta(days=15),
            status=data.get('status', 'pending')
        )
        
        db.session.add(bill)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Bill added successfully',
            'bill': bill.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Add bill error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/bills', methods=['GET'])
def api_get_bills():
    """Get all bills for current user"""
    user_id = session.get('user_id')
    
    # For demo, use first user if not logged in
    if not user_id:
        demo_user = User.query.first()
        if demo_user:
            user_id = demo_user.id
    
    if user_id:
        try:
            utility_type = request.args.get('utility_type')
            
            query = Bill.query.filter_by(user_id=user_id)
            if utility_type:
                query = query.filter_by(utility_type=utility_type)
            
            bills = query.order_by(Bill.created_at.desc()).all()
            
            return jsonify({
                'success': True,
                'bills': [bill.to_dict() for bill in bills]
            })
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    return jsonify({'success': False, 'message': 'No user found'}), 400


if __name__ == '__main__':
    app.run(debug=True)
