"""
Clear all seeded data from the database
This removes all bills and service reports, allowing you to start fresh
"""

from app import app
from models import db, Bill, ServiceReport

with app.app_context():
    # Delete all bills
    bills_deleted = Bill.query.delete()
    
    # Delete all service reports
    reports_deleted = ServiceReport.query.delete()
    
    # Commit the changes
    db.session.commit()
    
    print(f"✅ Database cleared successfully!")
    print(f"   - Deleted {bills_deleted} bills")
    print(f"   - Deleted {reports_deleted} service reports")
    print(f"\nYou can now add your own data using the API endpoints.")
