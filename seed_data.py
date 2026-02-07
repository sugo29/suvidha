"""
Seed script to populate database with sample data
Run this to add test data to the database
"""
from app import app
from models import db, User, Bill, ServiceReport, Community
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        print("Seeding database with sample data...")
        
        # Check if data already exists
        existing_user = User.query.first()
        if existing_user:
            print("Database already has data. Skipping seed.")
            user = existing_user
        else:
            # Create a sample user
            user = User(
                full_name='Suhan Kumar',
                email='suhan@example.com',
                phone='+91 9876543210',
                password=generate_password_hash('password123'),
                preferred_language='en',
                state='Maharashtra',
                city='Mumbai',
                ward='Ward-1',
                locality='Andheri West',
                alerts_enabled=True,
                is_verified=True
            )
            db.session.add(user)
            db.session.flush()
            print(f"Created user: {user.full_name}")
            
            # Create community record
            community = Community(
                user_id=user.id,
                state=user.state,
                city=user.city,
                ward=user.ward,
                locality=user.locality,
                points_earned=1250,
                challenges_participated=8,
                reports_submitted=5
            )
            db.session.add(community)
            print(f"Created community record for user")
        
        # Add sample bills if none exist
        existing_bills = Bill.query.filter_by(user_id=user.id).count()
        if existing_bills == 0:
            # Electricity bills (last 3 months)
            for i in range(3):
                bill = Bill(
                    user_id=user.id,
                    utility_type='electricity',
                    bill_id=f'ELEC-2026-{100 + i}',
                    amount=2450 - (i * 100),
                    consumption=245 - (i * 10),
                    consumption_unit='kWh',
                    billing_period_start=datetime.utcnow() - timedelta(days=60 + (i * 30)),
                    billing_period_end=datetime.utcnow() - timedelta(days=30 + (i * 30)),
                    due_date=datetime.utcnow() + timedelta(days=15 - (i * 30)),
                    status='pending' if i == 0 else 'paid',
                    paid_date=datetime.utcnow() - timedelta(days=i * 30) if i > 0 else None
                )
                db.session.add(bill)
            
            # Water bills
            for i in range(3):
                bill = Bill(
                    user_id=user.id,
                    utility_type='water',
                    bill_id=f'WATER-2026-{200 + i}',
                    amount=420 - (i * 20),
                    consumption=22 - i,
                    consumption_unit='kL',
                    billing_period_start=datetime.utcnow() - timedelta(days=60 + (i * 30)),
                    billing_period_end=datetime.utcnow() - timedelta(days=30 + (i * 30)),
                    due_date=datetime.utcnow() + timedelta(days=15 - (i * 30)),
                    status='paid',
                    paid_date=datetime.utcnow() - timedelta(days=i * 30)
                )
                db.session.add(bill)
            
            # Gas bills
            for i in range(3):
                bill = Bill(
                    user_id=user.id,
                    utility_type='gas',
                    bill_id=f'GAS-2026-{300 + i}',
                    amount=850 - (i * 50),
                    consumption=18 - i,
                    consumption_unit='SCM',
                    billing_period_start=datetime.utcnow() - timedelta(days=60 + (i * 30)),
                    billing_period_end=datetime.utcnow() - timedelta(days=30 + (i * 30)),
                    due_date=datetime.utcnow() + timedelta(days=15 - (i * 30)),
                    status='paid',
                    paid_date=datetime.utcnow() - timedelta(days=i * 30)
                )
                db.session.add(bill)
            
            print("Created sample bills")
        
        # Add sample service reports if none exist
        existing_reports = ServiceReport.query.filter_by(user_id=user.id).count()
        if existing_reports == 0:
            reports_data = [
                {
                    'report_type': 'power_outage',
                    'utility_type': 'electricity',
                    'title': 'Frequent power cuts in area',
                    'description': 'Experiencing power cuts 3-4 times daily for past week',
                    'status': 'open',
                    'priority': 'high'
                },
                {
                    'report_type': 'water_supply',
                    'utility_type': 'water',
                    'title': 'Low water pressure',
                    'description': 'Water pressure is very low during morning hours',
                    'status': 'in_progress',
                    'priority': 'medium'
                },
                {
                    'report_type': 'bill_issue',
                    'utility_type': 'electricity',
                    'title': 'Incorrect meter reading',
                    'description': 'Last month bill shows higher consumption than actual',
                    'status': 'resolved',
                    'priority': 'medium',
                    'resolved_at': datetime.utcnow() - timedelta(days=5)
                },
                {
                    'report_type': 'gas_leakage',
                    'utility_type': 'gas',
                    'title': 'Gas smell in pipeline area',
                    'description': 'Detected gas smell near main pipeline',
                    'status': 'resolved',
                    'priority': 'urgent',
                    'resolved_at': datetime.utcnow() - timedelta(days=2)
                },
                {
                    'report_type': 'street_light',
                    'utility_type': 'electricity',
                    'title': 'Street light not working',
                    'description': 'Street light pole #45 is not working',
                    'status': 'resolved',
                    'priority': 'low',
                    'resolved_at': datetime.utcnow() - timedelta(days=10)
                }
            ]
            
            for report_data in reports_data:
                report = ServiceReport(
                    user_id=user.id,
                    **report_data
                )
                db.session.add(report)
            
            print("Created sample service reports")
        
        db.session.commit()
        print("✅ Database seeded successfully!")
        print(f"User: {user.full_name} ({user.email})")
        print(f"Bills: {Bill.query.filter_by(user_id=user.id).count()}")
        print(f"Reports: {ServiceReport.query.filter_by(user_id=user.id).count()}")

if __name__ == '__main__':
    seed_database()
