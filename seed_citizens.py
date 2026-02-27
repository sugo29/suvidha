"""
Seed script to populate citizen test data
Run this after initializing the database
"""

from main import app
from models import db, User, Vendor, Community, Bill, ServiceReport
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta, date
import random
import uuid

def seed_citizens():
    """Seed citizen accounts with bills and service reports"""
    
    with app.app_context():
        print("Seeding citizen data...")
        
        # Get vendors
        vendors = {
            'electricity': Vendor.query.filter_by(service_type='electricity').first(),
            'water': Vendor.query.filter_by(service_type='water').first(),
            'gas': Vendor.query.filter_by(service_type='gas').first()
        }
        
        # Sample citizen data
        citizens_data = [
            {
                'full_name': 'Raj Kumar',
                'email': 'raj.kumar@example.com',
                'phone': '9876543210',
                'user_type': 'general',
                'date_of_birth': date(1985, 5, 15),
                'state': 'Delhi',
                'city': 'New Delhi',
                'ward': 'Ward 42',
                'locality': 'Connaught Place'
            },
            {
                'full_name': 'Priya Sharma',
                'email': 'priya.sharma@example.com',
                'phone': '9876543211',
                'user_type': 'general',
                'date_of_birth': date(1992, 8, 22),
                'state': 'Delhi',
                'city': 'New Delhi',
                'ward': 'Ward 42',
                'locality': 'Karol Bagh'
            },
            {
                'full_name': 'Ramesh Gupta',
                'email': 'ramesh.gupta@example.com',
                'phone': '9876543212',
                'user_type': 'senior_citizen',
                'date_of_birth': date(1955, 3, 10),
                'state': 'Delhi',
                'city': 'New Delhi',
                'ward': 'Ward 42',
                'locality': 'Dwarka'
            },
            {
                'full_name': 'Sushma Verma',
                'email': 'sushma.verma@example.com',
                'phone': '9876543213',
                'user_type': 'senior_citizen',
                'date_of_birth': date(1960, 11, 25),
                'state': 'Delhi',
                'city': 'New Delhi',
                'ward': 'Ward 43',
                'locality': 'Rohini'
            },
            {
                'full_name': 'Amit Patel',
                'email': 'amit.patel@example.com',
                'phone': '9876543214',
                'user_type': 'general',
                'date_of_birth': date(1988, 1, 30),
                'state': 'Delhi',
                'city': 'New Delhi',
                'ward': 'Ward 43',
                'locality': 'Pitampura'
            }
        ]
        
        created_users = []
        
        for citizen_data in citizens_data:
            # Check if user already exists
            existing_user = User.query.filter_by(email=citizen_data['email']).first()
            if existing_user:
                print(f"User {citizen_data['email']} already exists, skipping...")
                created_users.append(existing_user)
                continue
            
            # Create user
            user = User(
                full_name=citizen_data['full_name'],
                email=citizen_data['email'],
                phone=citizen_data['phone'],
                password=generate_password_hash('password123'),  # Default password
                user_type=citizen_data['user_type'],
                date_of_birth=citizen_data['date_of_birth'],
                preferred_language='en',
                state=citizen_data['state'],
                city=citizen_data['city'],
                ward=citizen_data['ward'],
                locality=citizen_data['locality'],
                electricity_provider_id=vendors['electricity'].id if vendors['electricity'] else None,
                water_provider_id=vendors['water'].id if vendors['water'] else None,
                gas_provider_id=vendors['gas'].id if vendors['gas'] else None,
                is_verified=True,
                account_created=datetime.utcnow() - timedelta(days=random.randint(30, 365))
            )
            
            db.session.add(user)
            db.session.flush()
            
            # Create community membership
            community = Community(
                user_id=user.id,
                state=citizen_data['state'],
                city=citizen_data['city'],
                ward=citizen_data['ward'],
                locality=citizen_data['locality'],
                points_earned=random.randint(0, 500),
                challenges_participated=random.randint(0, 10),
                reports_submitted=random.randint(0, 5)
            )
            db.session.add(community)
            
            created_users.append(user)
            print(f"Created user: {citizen_data['full_name']} ({citizen_data['user_type']})")
        
        db.session.commit()
        print(f"\nCreated {len(created_users)} users")
        
        # Seed bills for each user
        print("\nSeeding bills...")
        bill_count = 0
        
        for user in created_users:
            # Create bills for last 6 months
            for i in range(6):
                billing_month = datetime.utcnow() - timedelta(days=30 * i)
                
                # Electricity bill
                elec_bill = Bill(
                    user_id=user.id,
                    utility_type='electricity',
                    bill_id=f'ELEC-{user.phone}-{billing_month.strftime("%Y%m")}',
                    amount=random.uniform(800, 2500),
                    consumption=random.uniform(100, 400),
                    consumption_unit='kWh',
                    billing_period_start=billing_month.replace(day=1),
                    billing_period_end=billing_month.replace(day=28),
                    due_date=billing_month.replace(day=15) + timedelta(days=30),
                    status=random.choice(['paid', 'paid', 'pending']) if i < 2 else 'paid',
                    paid_date=billing_month + timedelta(days=random.randint(5, 20)) if i >= 2 else None,
                    created_at=billing_month
                )
                db.session.add(elec_bill)
                bill_count += 1
                
                # Water bill
                water_bill = Bill(
                    user_id=user.id,
                    utility_type='water',
                    bill_id=f'WATER-{user.phone}-{billing_month.strftime("%Y%m")}',
                    amount=random.uniform(300, 800),
                    consumption=random.uniform(10, 30),
                    consumption_unit='kL',
                    billing_period_start=billing_month.replace(day=1),
                    billing_period_end=billing_month.replace(day=28),
                    due_date=billing_month.replace(day=15) + timedelta(days=30),
                    status=random.choice(['paid', 'paid', 'pending']) if i < 2 else 'paid',
                    paid_date=billing_month + timedelta(days=random.randint(5, 20)) if i >= 2 else None,
                    created_at=billing_month
                )
                db.session.add(water_bill)
                bill_count += 1
                
                # Gas bill (every 2 months)
                if i % 2 == 0:
                    gas_bill = Bill(
                        user_id=user.id,
                        utility_type='gas',
                        bill_id=f'GAS-{user.phone}-{billing_month.strftime("%Y%m")}',
                        amount=random.uniform(600, 1200),
                        consumption=random.uniform(20, 50),
                        consumption_unit='SCM',
                        billing_period_start=billing_month.replace(day=1),
                        billing_period_end=billing_month.replace(day=28),
                        due_date=billing_month.replace(day=15) + timedelta(days=30),
                        status=random.choice(['paid', 'paid', 'pending']) if i < 2 else 'paid',
                        paid_date=billing_month + timedelta(days=random.randint(5, 20)) if i >= 2 else None,
                        created_at=billing_month
                    )
                    db.session.add(gas_bill)
                    bill_count += 1
        
        db.session.commit()
        print(f"Created {bill_count} bills")
        
        # Seed service reports/complaints
        print("\nSeeding service reports/complaints...")
        report_count = 0
        
        complaint_types = [
            ('power_outage', 'electricity', 'Power Outage in Area', 'Frequent power cuts in the last 2 days'),
            ('water_supply', 'water', 'Low Water Pressure', 'Water pressure is very low during morning hours'),
            ('gas_leakage', 'gas', 'Suspected Gas Leak', 'Smell of gas near the meter'),
            ('billing_issue', 'electricity', 'Incorrect Bill Amount', 'Bill amount seems unusually high this month'),
            ('meter_reading', 'water', 'Meter Reading Issue', 'Meter is not showing correct readings'),
        ]
        
        for user in created_users:
            # Create 2-4 complaints for each user
            num_complaints = random.randint(2, 4)
            
            for _ in range(num_complaints):
                complaint_data = random.choice(complaint_types)
                days_ago = random.randint(1, 90)
                created_date = datetime.utcnow() - timedelta(days=days_ago)
                
                status_choices = ['open', 'in_progress', 'resolved', 'closed']
                status_weights = [0.2, 0.3, 0.3, 0.2] if days_ago < 30 else [0.1, 0.1, 0.4, 0.4]
                status = random.choices(status_choices, weights=status_weights)[0]
                
                report = ServiceReport(
                    user_id=user.id,
                    report_type=complaint_data[0],
                    utility_type=complaint_data[1],
                    title=complaint_data[2],
                    description=complaint_data[3],
                    status=status,
                    priority=random.choice(['low', 'medium', 'medium', 'high']),
                    location=f"{user.locality}, {user.ward}, {user.city}",
                    created_at=created_date,
                    updated_at=created_date + timedelta(days=random.randint(1, 5)) if status != 'open' else created_date,
                    resolved_at=created_date + timedelta(days=random.randint(5, 20)) if status in ['resolved', 'closed'] else None
                )
                db.session.add(report)
                report_count += 1
        
        db.session.commit()
        print(f"Created {report_count} service reports/complaints")
        
        print("\n✅ Citizen data seeding completed successfully!")
        print("\nTest credentials:")
        print("=" * 50)
        for citizen in citizens_data:
            print(f"Email: {citizen['email']}")
            print(f"Password: password123")
            print(f"Type: {citizen['user_type']}")
            print("-" * 50)

if __name__ == '__main__':
    seed_citizens()
