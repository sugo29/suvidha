from flask import Flask, render_template, session, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Vendor, Community, CommunityStats

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
    if path.startswith('static/'):
        return app.send_static_file(path[7:])
    elif path.startswith('api/'):
        return app.send_static_file(path)
    return render_template('index.html')

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
    # Mock data - replace with actual database queries
    data = {
        'username': session.get('username', 'Suhan Kumar'),
        'electricity': {
            'current_bill': 2450,
            'due_date': '25 Jan 2025',
            'consumption': 245,
            'status': 'pending'
        },
        'gas': {
            'current_bill': 850,
            'consumption': 18,
            'status': 'paid'
        },
        'water': {
            'current_bill': 420,
            'consumption': 22,
            'status': 'paid'
        }
    }
    return jsonify(data)

@app.route('/api/utilities')
def api_utilities():
    data = {
        'electricity': {
            'monthly_data': [210, 235, 198, 245, 220, 250, 230, 215, 240, 225, 235, 245],
            'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'provider': 'BSES Rajdhani (BRPL)',
            'tariff': {
                'slab1': 3.00,
                'slab2': 4.50,
                'slab3': 6.50
            }
        },
        'gas': {
            'monthly_data': [15, 18, 16, 19, 17, 20, 18, 16, 19, 17, 18, 18],
            'provider': 'Indraprastha Gas Limited (IGL)'
        },
        'water': {
            'monthly_data': [20, 22, 21, 24, 23, 25, 22, 21, 23, 22, 22, 22],
            'provider': 'Delhi Jal Board (DJB)'
        }
    }
    return jsonify(data)

@app.route('/api/insights')
def api_insights():
    data = {
        'efficiency': {
            'electricity': 'efficient',
            'gas': 'average',
            'water': 'efficient'
        },
        'comparisons': {
            'ward_avg': 250,
            'user_avg': 225
        }
    }
    return jsonify(data)

@app.route('/api/records')
def api_records():
    data = {
        'bills': [
            {
                'date': 'Jan 05, 2026',
                'utility': 'electricity',
                'bill_id': 'BRPL-JAN-001',
                'reading': '24500 (245 units)',
                'amount': '₹ 1,240',
                'status': 'pending'
            },
            {
                'date': 'Jan 03, 2026',
                'utility': 'gas',
                'bill_id': 'IGL-JAN-889',
                'reading': '4502 (18 units)',
                'amount': '₹ 850',
                'status': 'paid'
            },
            {
                'date': 'Dec 31, 2025',
                'utility': 'water',
                'bill_id': 'DJB-DEC-667',
                'reading': '998 (20 kl)',
                'amount': '₹ 380',
                'status': 'paid'
            }
        ]
    }
    return jsonify(data)

@app.route('/api/community')
def api_community():
    data = {
        'ward': 'Kalkaji',
        'health_score': 78,
        'stress_map': ['low', 'medium', 'high', 'low']
    }
    return jsonify(data)

@app.route('/api/profile')
def api_profile():
    data = {
        'name': 'Suhan Kumar',
        'phone': '+91 98765 43210',
        'address': 'Flat 402, Kaveri Apartments, Kalkaji, New Delhi - 110019',
        'email': 'suhan.kumar@example.com'
    }
    return jsonify(data)

@app.route('/api/services/submit', methods=['POST'])
def api_submit_service():
    request_data = request.get_json()
    # Process the service request here
    # Save to database, etc.
    return jsonify({
        'success': True,
        'message': 'Service request submitted successfully',
        'request_id': 'SR-2026-001'
    })

if __name__ == '__main__':
    app.run(debug=True)

