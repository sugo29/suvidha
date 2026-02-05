from flask import Flask, render_template, session, request, jsonify, send_from_directory
import os

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

# Serve the main Angular app
@app.route('/')
def index():
    return render_template('index.html')

# Catch all routes and serve index.html for Angular routing
@app.route('/<path:path>')
def catch_all(path):
    # If it's a static file, serve it normally
    if path.startswith('static/') or path.startswith('api/'):
        return app.send_static_file(path)
    # Otherwise, serve index.html for Angular to handle routing
    return render_template('index.html')

# --- API Routes ---
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
