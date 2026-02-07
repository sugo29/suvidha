from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

# ============================================
# USERS TABLE
# ============================================
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    
    # Personal Details
    preferred_language = db.Column(db.String(10), default='en')  # en, hi, ta, te, bn
    aadhaar = db.Column(db.String(14), nullable=True, unique=True)
    aadhaar_consent = db.Column(db.Boolean, default=False)
    
    # Location Details
    state = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    locality = db.Column(db.String(255), nullable=False)
    
    # Service Providers
    electricity_provider_id = db.Column(db.String(36), db.ForeignKey('vendors.id'), nullable=True)
    water_provider_id = db.Column(db.String(36), db.ForeignKey('vendors.id'), nullable=True)
    gas_provider_id = db.Column(db.String(36), db.ForeignKey('vendors.id'), nullable=True)
    
    # Account Settings
    alerts_enabled = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    account_created = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    electricity_provider = db.relationship('Vendor', foreign_keys=[electricity_provider_id], backref='electricity_users')
    water_provider = db.relationship('Vendor', foreign_keys=[water_provider_id], backref='water_users')
    gas_provider = db.relationship('Vendor', foreign_keys=[gas_provider_id], backref='gas_users')
    community_member = db.relationship('Community', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'preferred_language': self.preferred_language,
            'state': self.state,
            'city': self.city,
            'ward': self.ward,
            'locality': self.locality,
            'alerts_enabled': self.alerts_enabled,
            'is_verified': self.is_verified,
            'account_created': self.account_created.isoformat(),
            'electricity_provider_id': self.electricity_provider_id,
            'water_provider_id': self.water_provider_id,
            'gas_provider_id': self.gas_provider_id
        }


# ============================================
# VENDORS TABLE
# ============================================
class Vendor(db.Model):
    __tablename__ = 'vendors'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    service_type = db.Column(db.String(50), nullable=False)  # 'electricity', 'water', 'gas'
    description = db.Column(db.String(500), nullable=True)
    contact = db.Column(db.String(20), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    availability = db.Column(db.String(50), default='active')  # 'active', 'inactive'
    coverage_areas = db.Column(db.Text, nullable=True)  # JSON: list of areas/states served
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'service_type': self.service_type,
            'description': self.description,
            'contact': self.contact,
            'website': self.website,
            'availability': self.availability,
            'coverage_areas': self.coverage_areas
        }


# ============================================
# COMMUNITY TABLE (organized by location)
# ============================================
class Community(db.Model):
    __tablename__ = 'communities'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Location grouping
    state = db.Column(db.String(100), nullable=False, index=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    ward = db.Column(db.String(100), nullable=False, index=True)
    locality = db.Column(db.String(255), nullable=False, index=True)
    
    # Community engagement
    points_earned = db.Column(db.Integer, default=0)
    challenges_participated = db.Column(db.Integer, default=0)
    reports_submitted = db.Column(db.Integer, default=0)
    
    # Community status
    is_active = db.Column(db.Boolean, default=True)
    joined_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Badges/Recognition
    badges = db.Column(db.String(500), nullable=True)  # CSV: 'water_steward,grid_supporter,peak_saver'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'state': self.state,
            'city': self.city,
            'ward': self.ward,
            'locality': self.locality,
            'points_earned': self.points_earned,
            'challenges_participated': self.challenges_participated,
            'reports_submitted': self.reports_submitted,
            'is_active': self.is_active,
            'joined_date': self.joined_date.isoformat(),
            'badges': self.badges.split(',') if self.badges else []
        }


# ============================================
# COMMUNITY STATS (for aggregated data by region)
# ============================================
class CommunityStats(db.Model):
    __tablename__ = 'community_stats'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Location aggregation
    state = db.Column(db.String(100), nullable=False, index=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    ward = db.Column(db.String(100), nullable=False, index=True)
    locality = db.Column(db.String(255), nullable=True, index=True)
    
    # Aggregated metrics
    total_members = db.Column(db.Integer, default=0)
    active_members = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    avg_points_per_member = db.Column(db.Float, default=0.0)
    total_challenges = db.Column(db.Integer, default=0)
    water_stress_level = db.Column(db.String(50), default='low')  # low, medium, high
    electricity_stress_level = db.Column(db.String(50), default='low')
    gas_stress_level = db.Column(db.String(50), default='low')
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'state': self.state,
            'city': self.city,
            'ward': self.ward,
            'locality': self.locality,
            'total_members': self.total_members,
            'active_members': self.active_members,
            'total_points': self.total_points,
            'avg_points_per_member': self.avg_points_per_member,
            'total_challenges': self.total_challenges,
            'water_stress_level': self.water_stress_level,
            'electricity_stress_level': self.electricity_stress_level,
            'gas_stress_level': self.gas_stress_level
        }


# ============================================
# BILLS TABLE (for tracking utility consumption)
# ============================================
class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Bill details
    utility_type = db.Column(db.String(50), nullable=False)  # 'electricity', 'water', 'gas'
    bill_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    consumption = db.Column(db.Float, nullable=False)  # units/kL/SCM
    consumption_unit = db.Column(db.String(20), nullable=False)  # 'kWh', 'kL', 'SCM'
    
    # Dates
    billing_period_start = db.Column(db.DateTime, nullable=False)
    billing_period_end = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    paid_date = db.Column(db.DateTime, nullable=True)
    
    # Status
    status = db.Column(db.String(20), default='pending')  # 'pending', 'paid', 'overdue'
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='bills')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'utility_type': self.utility_type,
            'bill_id': self.bill_id,
            'amount': self.amount,
            'consumption': self.consumption,
            'consumption_unit': self.consumption_unit,
            'billing_period_start': self.billing_period_start.isoformat(),
            'billing_period_end': self.billing_period_end.isoformat(),
            'due_date': self.due_date.isoformat(),
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'status': self.status
        }


# ============================================
# SERVICE REPORTS TABLE (for tracking complaints/requests)
# ============================================
class ServiceReport(db.Model):
    __tablename__ = 'service_reports'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Report details
    report_type = db.Column(db.String(50), nullable=False)  # 'power_outage', 'water_supply', 'gas_leakage', etc.
    utility_type = db.Column(db.String(50), nullable=False)  # 'electricity', 'water', 'gas', 'general'
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Status tracking
    status = db.Column(db.String(20), default='open')  # 'open', 'in_progress', 'resolved', 'closed'
    priority = db.Column(db.String(20), default='medium')  # 'low', 'medium', 'high', 'urgent'
    
    # Location
    location = db.Column(db.String(500), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='service_reports')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_type': self.report_type,
            'utility_type': self.utility_type,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'location': self.location,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
