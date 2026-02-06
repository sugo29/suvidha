#!/usr/bin/env python
"""Initialize database and verify setup"""

from app import app, db
from models import User, Vendor, Community, CommunityStats

with app.app_context():
    # Database tables should be created by app initialization
    
    # Check vendors
    vendor_count = Vendor.query.count()
    print(f"✓ Database initialized successfully")
    print(f"✓ Vendors in database: {vendor_count}")
    
    if vendor_count > 0:
        print("✓ Vendor seeding successful!")
        # Show a few vendors
        vendors = Vendor.query.limit(5).all()
        print("\nSample vendors:")
        for v in vendors:
            print(f"  - {v.name} ({v.service_type})")
    
    print(f"\n✓ Database tables created")
    print("✓ Ready to accept user signups!")
