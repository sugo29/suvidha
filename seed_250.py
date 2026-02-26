"""
Comprehensive Seed Script - 250+ Records
Seeds: Field Agents, Households, Tasks, Meter Submissions, Grievances, Audit Logs
"""

from app import app, db
from models import (
    FieldAgent, TaskAssignment, Household, MeterSubmission, 
    GovOfficial, Grievance, AuditLog, MeterReading, RWAProject
)
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random
import uuid

# Indian names data
FIRST_NAMES = [
    'Vikram', 'Ramesh', 'Suresh', 'Priya', 'Amit', 'Deepak', 'Sanjay', 'Rajesh', 
    'Kavita', 'Mohan', 'Ankit', 'Rahul', 'Neha', 'Pooja', 'Arun', 'Manoj', 
    'Sunita', 'Geeta', 'Rekha', 'Vinod', 'Sandeep', 'Ravi', 'Vijay', 'Kiran',
    'Anjali', 'Meena', 'Suman', 'Rakesh', 'Dinesh', 'Sunil', 'Ashok', 'Mukesh',
    'Jyoti', 'Parveen', 'Harish', 'Naresh', 'Kamla', 'Saroj', 'Asha', 'Usha',
    'Pankaj', 'Ajay', 'Sagar', 'Mahesh', 'Lalit', 'Gopal', 'Shyam', 'Krishna',
    'Radha', 'Lakshmi', 'Sarita', 'Vandana', 'Mamta', 'Nirmala', 'Pushpa', 'Savita',
    'Devendra', 'Surendra', 'Narendra', 'Jagdish', 'Satish', 'Rajendra', 'Yogesh', 'Umesh'
]

LAST_NAMES = [
    'Singh', 'Kumar', 'Yadav', 'Sharma', 'Patel', 'Verma', 'Gupta', 'Mehra',
    'Joshi', 'Das', 'Reddy', 'Nair', 'Iyer', 'Pillai', 'Chauhan', 'Mishra',
    'Pandey', 'Tiwari', 'Dubey', 'Srivastava', 'Agarwal', 'Bansal', 'Jain', 'Saxena',
    'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Arora', 'Sethi', 'Chopra', 'Ahuja'
]

DISTRICTS = ['South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'New Delhi']

WARDS = {
    'South Delhi': ['Ward 45, Saket', 'Ward 46, Malviya Nagar', 'Ward 47, Hauz Khas', 'Ward 48, Green Park', 'Ward 49, Lajpat Nagar'],
    'North Delhi': ['Ward 10, Model Town', 'Ward 11, Mukherjee Nagar', 'Ward 12, Rohini', 'Ward 13, Pitampura', 'Ward 14, Shalimar Bagh'],
    'East Delhi': ['Ward 20, Laxmi Nagar', 'Ward 21, Preet Vihar', 'Ward 22, Mayur Vihar', 'Ward 23, Patparganj', 'Ward 24, Shahdara'],
    'West Delhi': ['Ward 30, Janakpuri', 'Ward 31, Rajouri Garden', 'Ward 32, Dwarka', 'Ward 33, Punjabi Bagh', 'Ward 34, Paschim Vihar'],
    'Central Delhi': ['Ward 1, Connaught Place', 'Ward 2, Karol Bagh', 'Ward 3, Paharganj', 'Ward 4, Rajender Nagar', 'Ward 5, Patel Nagar'],
    'New Delhi': ['Ward 6, Chanakyapuri', 'Ward 7, Lodhi Colony', 'Ward 8, Defence Colony', 'Ward 9, Jor Bagh', 'Ward 10, Golf Links']
}

LOCALITIES = [
    'Block A', 'Block B', 'Block C', 'Block D', 'Block E',
    'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5',
    'Phase 1', 'Phase 2', 'Phase 3', 'Pocket A', 'Pocket B'
]

CATEGORIES = ['electric_meter', 'water_meter', 'gas_cylinder', 'rwa_work']
STATUSES = ['online', 'on_task', 'offline', 'break']
TASK_TYPES = ['electric_meter', 'water_meter', 'gas_cylinder', 'rwa_work', 'inspection', 'grievance']
TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']
PRIORITIES = ['low', 'normal', 'high', 'urgent']
GRIEVANCE_TYPES = ['electricity', 'water', 'gas', 'general']
GRIEVANCE_CATEGORIES = ['billing', 'outage', 'quality', 'safety', 'meter_issue', 'connection', 'complaint']

def generate_phone():
    return f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}"

def generate_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def random_date(days_back=30):
    return datetime.utcnow() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )

def seed_all():
    """Main seeding function"""
    
    with app.app_context():
        print("=" * 60)
        print("Comprehensive Seeding Script - 250+ Records")
        print("=" * 60)
        
        # Get or create supervisor
        supervisor = GovOfficial.query.filter_by(department='field_ops').first()
        if not supervisor:
            supervisor = GovOfficial.query.first()
        
        if not supervisor:
            print("Creating default government official...")
            supervisor = GovOfficial(
                employee_id='GOV-2026-00001',
                full_name='Admin Officer',
                email='admin@suvidha.gov.in',
                phone='+91 98765 00000',
                password=generate_password_hash('admin123'),
                department='field_ops',
                designation='senior_officer',
                role='admin',
                assigned_state='Delhi',
                assigned_district='South Delhi',
                is_active=True,
                is_verified=True
            )
            db.session.add(supervisor)
            db.session.commit()
        
        supervisor_id = supervisor.id
        
        # 1. Create 50 Field Agents (more realistic - each handles multiple tasks)
        print("\n1. Creating Field Agents...")
        agents = seed_field_agents(supervisor_id)
        print(f"   Created {len(agents)} field agents")
        
        # 2. Create 150 Households
        print("\n2. Creating Households...")
        households = seed_households()
        print(f"   Created {len(households)} households")
        
        # 3. Create 200 Task Assignments
        print("\n3. Creating Task Assignments...")
        tasks = seed_tasks(agents, supervisor_id)
        print(f"   Created {len(tasks)} task assignments")
        
        # 4. Create 100 Meter Submissions
        print("\n4. Creating Meter Submissions...")
        submissions = seed_meter_submissions(agents, households)
        print(f"   Created {len(submissions)} meter submissions")
        
        # 5. Create 50 Grievances
        print("\n5. Creating Grievances...")
        grievances = seed_grievances(supervisor_id)
        print(f"   Created {len(grievances)} grievances")
        
        # 6. Create 100 Audit Logs
        print("\n6. Creating Audit Logs...")
        logs = seed_audit_logs(supervisor_id)
        print(f"   Created {len(logs)} audit logs")
        
        # 7. Create 30 Meter Readings
        print("\n7. Creating Meter Readings...")
        readings = seed_meter_readings(supervisor_id)
        print(f"   Created {len(readings)} meter readings")
        
        # 8. Create 20 RWA Projects
        print("\n8. Creating RWA Projects...")
        projects = seed_rwa_projects(supervisor_id)
        print(f"   Created {len(projects)} RWA projects")
        
        print("\n" + "=" * 60)
        total = len(agents) + len(households) + len(tasks) + len(submissions) + len(grievances) + len(logs) + len(readings) + len(projects)
        print(f"TOTAL RECORDS CREATED: {total}")
        print("=" * 60)
        
        return {
            'agents': len(agents),
            'households': len(households),
            'tasks': len(tasks),
            'submissions': len(submissions),
            'grievances': len(grievances),
            'audit_logs': len(logs),
            'meter_readings': len(readings),
            'rwa_projects': len(projects),
            'total': total
        }


def seed_field_agents(supervisor_id, count=50):
    """Create 50 field agents"""
    
    # Check if agents exist
    existing = FieldAgent.query.count()
    if existing >= 10:
        print(f"   Field agents already exist ({existing}). Skipping...")
        return FieldAgent.query.all()
    
    agents = []
    used_emails = set()
    
    for i in range(count):
        name = generate_name()
        email_base = name.lower().replace(' ', '.')
        email = f"{email_base}{i}@suvidha.gov.in"
        
        # Ensure unique email
        while email in used_emails:
            email = f"{email_base}{random.randint(100, 999)}@suvidha.gov.in"
        used_emails.add(email)
        
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        
        agent = FieldAgent(
            employee_id=f"FA-2026-{(i + 1):05d}",
            full_name=name,
            email=email,
            phone=generate_phone(),
            password=generate_password_hash('agent123'),
            category=random.choice(CATEGORIES),
            supervisor_id=supervisor_id,
            assigned_state='Delhi',
            assigned_district=district,
            assigned_ward=ward,
            status=random.choice(STATUSES),
            is_active=True,
            is_verified=True,
            gps_enabled=random.choice([True, True, True, False]),
            current_latitude=28.5355 + random.uniform(-0.1, 0.1),
            current_longitude=77.2410 + random.uniform(-0.1, 0.1),
            location_updated_at=random_date(1),
            performance_score=random.uniform(60, 98),
            tasks_completed_today=random.randint(0, 30),
            total_tasks_completed=random.randint(100, 2000),
            avg_task_time=random.uniform(10, 45),
            last_login=random_date(7),
            account_created=random_date(365)
        )
        agents.append(agent)
        db.session.add(agent)
    
    db.session.commit()
    return agents


def seed_households(count=150):
    """Create 150 households"""
    
    existing = Household.query.count()
    if existing >= 50:
        print(f"   Households already exist ({existing}). Skipping...")
        return Household.query.all()
    
    households = []
    
    for i in range(count):
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        locality = random.choice(LOCALITIES)
        house_num = f"{random.randint(1, 500)}{random.choice(['A', 'B', 'C', ''])}"
        
        household = Household(
            house_number=house_num,
            ward=ward,
            district=district,
            state='Delhi',
            locality=locality,
            full_address=f"House {house_num}, {locality}, {ward}, {district}",
            block=random.choice(['A', 'B', 'C', 'D', 'E']),
            sector=str(random.randint(1, 20)),
            latitude=28.5355 + random.uniform(-0.1, 0.1),
            longitude=77.2410 + random.uniform(-0.1, 0.1),
            resident_name=generate_name(),
            contact_phone=generate_phone(),
            num_residents=random.randint(1, 8),
            resident_category=random.choice(['general', 'general', 'senior_citizen', 'disabled', 'bpl']),
            meter_id=f"MTR-{ward[:6].replace(' ', '')}-{random.randint(10000, 99999)}",
            meter_type=random.choice(['electric', 'water', 'gas']),
            is_active=True,
            connection_status=random.choice(['active', 'active', 'active', 'disconnected', 'pending']),
            created_at=random_date(365)
        )
        households.append(household)
        db.session.add(household)
    
    db.session.commit()
    return households


def seed_tasks(agents, supervisor_id, count=200):
    """Create 200 task assignments"""
    
    existing = TaskAssignment.query.count()
    if existing >= 50:
        print(f"   Tasks already exist ({existing}). Skipping...")
        return TaskAssignment.query.all()
    
    if not agents:
        agents = FieldAgent.query.all()
    
    tasks = []
    base_num = random.randint(10000, 50000)  # Random base to avoid duplicates
    
    for i in range(count):
        agent = random.choice(agents)
        status = random.choice(TASK_STATUSES)
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        
        assigned_at = random_date(14)
        started_at = None
        completed_at = None
        completion_time = None
        
        if status in ['in_progress', 'completed']:
            started_at = assigned_at + timedelta(hours=random.randint(1, 24))
        
        if status == 'completed':
            completion_time = random.randint(10, 120)
            completed_at = started_at + timedelta(minutes=completion_time) if started_at else None
        
        task = TaskAssignment(
            task_id=f"TASK-{base_num + i:06d}",
            agent_id=agent.id,
            assigned_by=supervisor_id,
            task_type=random.choice(TASK_TYPES),
            house_number=f"{random.randint(1, 500)}{random.choice(['A', 'B', 'C', ''])}",
            ward=ward,
            city='Delhi',
            full_address=f"House {random.randint(1, 500)}, {random.choice(LOCALITIES)}, {ward}",
            latitude=28.5355 + random.uniform(-0.1, 0.1),
            longitude=77.2410 + random.uniform(-0.1, 0.1),
            description=f"Scheduled {random.choice(TASK_TYPES).replace('_', ' ')} task for {ward}",
            priority=random.choice(PRIORITIES),
            status=status,
            photos_added=status == 'completed' and random.choice([True, False]),
            problem_raised=random.choice([False, False, False, True]),
            problem_type=random.choice(['meter_tampering', 'leakage', 'damaged', 'inaccessible', None]),
            meter_reading=random.uniform(100, 5000) if status == 'completed' else None,
            meter_id=f"MTR-{random.randint(10000, 99999)}",
            assigned_at=assigned_at,
            started_at=started_at,
            completed_at=completed_at,
            completion_time_minutes=completion_time
        )
        tasks.append(task)
        db.session.add(task)
    
    db.session.commit()
    return tasks


def seed_meter_submissions(agents, households, count=100):
    """Create 100 meter submissions"""
    
    existing = MeterSubmission.query.count()
    if existing >= 20:
        print(f"   Meter submissions already exist ({existing}). Skipping...")
        return MeterSubmission.query.all()
    
    if not agents:
        agents = FieldAgent.query.all()
    if not households:
        households = Household.query.all()
    
    submissions = []
    base_num = random.randint(10000, 50000)
    
    for i in range(count):
        agent = random.choice(agents) if agents else None
        household = random.choice(households) if households else None
        
        submission = MeterSubmission(
            submission_id=f"SUB-{base_num + i:06d}",
            agent_id=agent.id if agent else None,
            household_id=household.id if household else None,
            meter_reading=random.uniform(100, 5000),
            meter_type=random.choice(['electric', 'water', 'gas']),
            reading_unit=random.choice(['kWh', 'kL', 'SCM']),
            latitude=28.5355 + random.uniform(-0.1, 0.1),
            longitude=77.2410 + random.uniform(-0.1, 0.1),
            address=f"House {random.randint(1, 500)}, {random.choice(LOCALITIES)}, Delhi",
            status=random.choice(['submitted', 'verified', 'rejected', 'flagged']),
            submission_type='reading',
            ai_confidence=random.uniform(85, 100),
            submitted_at=random_date(30)
        )
        submissions.append(submission)
        db.session.add(submission)
    
    db.session.commit()
    return submissions


def seed_grievances(supervisor_id, count=50):
    """Create 50 grievances"""
    
    existing = Grievance.query.count()
    if existing >= 20:
        print(f"   Grievances already exist ({existing}). Skipping...")
        return Grievance.query.all()
    
    grievances = []
    
    titles = [
        'Electricity billing discrepancy',
        'Water supply interruption',
        'Gas cylinder delivery delay',
        'Street light not working',
        'Water leakage in main line',
        'Meter reading incorrect',
        'Power outage for extended period',
        'Low water pressure issue',
        'Damaged meter needs replacement',
        'New connection request pending',
        'Billing system error',
        'Transformer overload issue',
        'Sewage line blockage',
        'Road repair needed',
        'Garbage collection irregular'
    ]
    
    for i in range(count):
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        utility_type = random.choice(GRIEVANCE_TYPES)
        status = random.choice(['pending', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed'])
        
        created_at = random_date(60)
        resolved_at = None
        resolution_time = None
        
        if status in ['resolved', 'closed']:
            resolution_time = random.uniform(2, 72)
            resolved_at = created_at + timedelta(hours=resolution_time)
        
        grievance = Grievance(
            grievance_id=f"GRV-2026-{(i + 1):05d}",
            complainant_name=generate_name(),
            complainant_phone=generate_phone(),
            state='Delhi',
            district=district,
            ward=ward,
            locality=random.choice(LOCALITIES),
            utility_type=utility_type,
            category=random.choice(GRIEVANCE_CATEGORIES),
            title=random.choice(titles),
            description=f"Detailed description of the grievance related to {utility_type} service in {ward}. This requires immediate attention.",
            status=status,
            severity=random.choice(['low', 'medium', 'high', 'critical']),
            priority=random.randint(1, 5),
            sla_hours=random.choice([24, 48, 72]),
            sla_deadline=created_at + timedelta(hours=48),
            sla_breached=random.choice([False, False, False, True]),
            assigned_official_id=supervisor_id if status != 'pending' else None,
            assigned_at=created_at + timedelta(hours=2) if status != 'pending' else None,
            created_at=created_at,
            resolved_at=resolved_at,
            resolution_notes=f"Resolved by field team after inspection." if resolved_at else None,
            resolution_time_hours=resolution_time
        )
        grievances.append(grievance)
        db.session.add(grievance)
    
    db.session.commit()
    return grievances


def seed_audit_logs(supervisor_id, count=100):
    """Create 100 audit logs"""
    
    existing = AuditLog.query.count()
    if existing >= 30:
        print(f"   Audit logs already exist ({existing}). Skipping...")
        return AuditLog.query.all()
    
    actions = [
        ('Grievance Resolved', 'success'),
        ('Policy Updated', 'info'),
        ('Budget Allocation Changed', 'warning'),
        ('Field Agent Assigned', 'success'),
        ('SLA Breach Alert', 'danger'),
        ('Meter Reading Verified', 'success'),
        ('System Access Granted', 'info'),
        ('Security Alert Triggered', 'danger'),
        ('Report Generated', 'success'),
        ('Task Completed', 'success'),
        ('User Login', 'info'),
        ('Data Export', 'warning'),
        ('Configuration Changed', 'warning'),
        ('Escalation Triggered', 'danger'),
        ('Inspection Scheduled', 'info')
    ]
    
    logs = []
    base_num = random.randint(10000, 50000)
    
    for i in range(count):
        action, action_type = random.choice(actions)
        
        log = AuditLog(
            log_id=f"LOG-{base_num + i:06d}",
            action=action,
            action_type=action_type,
            official_id=supervisor_id,
            official_name=generate_name(),
            department=random.choice(['field_ops', 'grievance', 'utilities', 'policy', 'audit', 'waste']),
            reason=f"Action performed as part of routine operations",
            related_id=f"GRV-2026-{random.randint(1, 100):05d}" if 'Grievance' in action else None,
            impact=random.choice(['Low', 'Medium', 'High']),
            severity=random.choice(['Normal', 'Medium', 'High']),
            source=random.choice(['Manual', 'System (AUTO)']),
            timestamp=random_date(30)
        )
        logs.append(log)
        db.session.add(log)
    
    db.session.commit()
    return logs


def seed_meter_readings(supervisor_id, count=30):
    """Create 30 meter readings"""
    
    existing = MeterReading.query.count()
    if existing >= 10:
        print(f"   Meter readings already exist ({existing}). Skipping...")
        return MeterReading.query.all()
    
    readings = []
    
    for i in range(count):
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        
        reading = MeterReading(
            meter_id=f"MTR-{random.randint(10000, 99999)}",
            ward=ward,
            locality=random.choice(LOCALITIES),
            block=random.choice(['A', 'B', 'C', 'D']),
            sector=str(random.randint(1, 10)),
            reading_value=random.uniform(100, 5000),
            reading_unit=random.choice(['kWh', 'kL', 'SCM']),
            utility_type=random.choice(['electricity', 'water', 'gas']),
            ai_confidence=random.uniform(85, 100),
            status=random.choice(['verified', 'review', 'suspicious', 're-verifying']),
            reading_time=random_date(30),
            verified_at=random_date(15) if random.choice([True, False]) else None,
            verified_by=supervisor_id if random.choice([True, False]) else None
        )
        readings.append(reading)
        db.session.add(reading)
    
    db.session.commit()
    return readings


def seed_rwa_projects(supervisor_id, count=20):
    """Create 20 RWA projects"""
    
    existing = RWAProject.query.count()
    if existing >= 5:
        print(f"   RWA projects already exist ({existing}). Skipping...")
        return RWAProject.query.all()
    
    project_names = [
        'Park Renovation', 'Street Light Installation', 'Community Hall Repair',
        'Road Resurfacing', 'Garbage Collection System', 'Water Tank Cleaning',
        'Security Camera Installation', 'Children Playground Setup', 'Senior Citizen Center',
        'Rainwater Harvesting', 'Solar Panel Installation', 'Tree Plantation Drive',
        'CCTV Upgrade', 'Boundary Wall Repair', 'Drainage System Improvement',
        'Community Garden', 'Sports Complex', 'Library Renovation', 'Health Camp Setup',
        'Public Toilet Construction'
    ]
    
    rwa_names = [
        'Saket RWA', 'Malviya Nagar RWA', 'Hauz Khas RWA', 'Model Town RWA',
        'Rohini RWA', 'Dwarka RWA', 'Janakpuri RWA', 'Laxmi Nagar RWA',
        'Mayur Vihar RWA', 'Pitampura RWA'
    ]
    
    purposes = ['Green Spaces', 'Infrastructure', 'Maintenance', 'Community', 'Security', 'Health']
    
    projects = []
    
    for i in range(count):
        district = random.choice(DISTRICTS)
        ward = random.choice(WARDS[district])
        start_date = random_date(90)
        deadline = start_date + timedelta(days=random.randint(30, 180))
        status = random.choice(['not_started', 'in_progress', 'delayed', 'near_complete', 'completed'])
        progress = {
            'not_started': random.randint(0, 5),
            'in_progress': random.randint(20, 70),
            'delayed': random.randint(10, 50),
            'near_complete': random.randint(80, 95),
            'completed': 100
        }[status]
        
        budget = random.randint(50000, 5000000)
        
        project = RWAProject(
            project_name=project_names[i % len(project_names)],
            rwa_name=random.choice(rwa_names),
            ward=ward,
            sector=str(random.randint(1, 20)),
            allocated_budget=budget,
            utilized_budget=budget * (progress / 100) * random.uniform(0.8, 1.1),
            purpose=random.choice(purposes),
            start_date=start_date if status != 'not_started' else None,
            deadline=deadline,
            completed_date=deadline - timedelta(days=random.randint(1, 30)) if status == 'completed' else None,
            progress=progress,
            status=status,
            supervised_by=supervisor_id,
            created_at=random_date(120)
        )
        projects.append(project)
        db.session.add(project)
    
    db.session.commit()
    return projects


def clear_and_reseed():
    """Clear all seeded data and reseed"""
    
    with app.app_context():
        print("Clearing existing data...")
        
        # Clear in reverse order due to foreign keys
        MeterSubmission.query.delete()
        TaskAssignment.query.delete()
        Household.query.delete()
        AuditLog.query.delete()
        MeterReading.query.delete()
        RWAProject.query.delete()
        Grievance.query.delete()
        FieldAgent.query.delete()
        
        db.session.commit()
        print("Data cleared. Re-seeding...")
        
        return seed_all()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--clear':
        result = clear_and_reseed()
    else:
        result = seed_all()
    
    print("\nSeeding complete!")
    print(f"Run 'python seed_250.py --clear' to clear and reseed all data.")
