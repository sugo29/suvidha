"""
Seed script for Field Agents and Tasks
Run this to populate sample data for testing
"""

from app import app, db
from models import FieldAgent, TaskAssignment, AgentPerformance, GovOfficial
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

def seed_field_agents():
    """Create sample field agents"""
    
    with app.app_context():
        # Check if already seeded
        existing = FieldAgent.query.first()
        if existing:
            print("Field agents already exist. Skipping...")
            return
        
        # Get a supervisor (Government Official)
        supervisor = GovOfficial.query.filter_by(department='field_ops').first()
        if not supervisor:
            supervisor = GovOfficial.query.first()
        
        supervisor_id = supervisor.id if supervisor else None
        
        # Sample agents data
        agents_data = [
            {
                'full_name': 'Vikram Singh',
                'email': 'vikram.singh@suvidha.gov.in',
                'phone': '+91 98765 43210',
                'category': 'electric_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'South Delhi',
                'assigned_ward': 'Ward 45, Saket',
                'status': 'on_task',
                'gps_enabled': True,
                'performance_score': 92,
                'total_tasks_completed': 1247
            },
            {
                'full_name': 'Ramesh Kumar',
                'email': 'ramesh.kumar@suvidha.gov.in',
                'phone': '+91 98765 43211',
                'category': 'electric_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'South Delhi',
                'assigned_ward': 'Ward 46, Malviya Nagar',
                'status': 'online',
                'gps_enabled': True,
                'performance_score': 88,
                'total_tasks_completed': 1102
            },
            {
                'full_name': 'Suresh Yadav',
                'email': 'suresh.yadav@suvidha.gov.in',
                'phone': '+91 98765 43212',
                'category': 'water_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'South Delhi',
                'assigned_ward': 'Ward 45, Saket',
                'status': 'on_task',
                'gps_enabled': True,
                'performance_score': 85,
                'total_tasks_completed': 956
            },
            {
                'full_name': 'Priya Sharma',
                'email': 'priya.sharma@suvidha.gov.in',
                'phone': '+91 98765 43213',
                'category': 'gas_cylinder',
                'assigned_state': 'Delhi',
                'assigned_district': 'South Delhi',
                'assigned_ward': 'Ward 47, Hauz Khas',
                'status': 'online',
                'gps_enabled': True,
                'performance_score': 94,
                'total_tasks_completed': 823
            },
            {
                'full_name': 'Amit Patel',
                'email': 'amit.patel@suvidha.gov.in',
                'phone': '+91 98765 43214',
                'category': 'rwa_work',
                'assigned_state': 'Delhi',
                'assigned_district': 'South Delhi',
                'assigned_ward': 'Ward 45, Saket',
                'status': 'offline',
                'gps_enabled': False,
                'performance_score': 76,
                'total_tasks_completed': 445
            },
            {
                'full_name': 'Deepak Verma',
                'email': 'deepak.verma@suvidha.gov.in',
                'phone': '+91 98765 43215',
                'category': 'electric_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'North Delhi',
                'assigned_ward': 'Ward 12, Model Town',
                'status': 'on_task',
                'gps_enabled': True,
                'performance_score': 89,
                'total_tasks_completed': 1089
            },
            {
                'full_name': 'Sanjay Gupta',
                'email': 'sanjay.gupta@suvidha.gov.in',
                'phone': '+91 98765 43216',
                'category': 'water_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'North Delhi',
                'assigned_ward': 'Ward 13, Rohini',
                'status': 'online',
                'gps_enabled': True,
                'performance_score': 82,
                'total_tasks_completed': 678
            },
            {
                'full_name': 'Rajesh Mehra',
                'email': 'rajesh.mehra@suvidha.gov.in',
                'phone': '+91 98765 43217',
                'category': 'gas_cylinder',
                'assigned_state': 'Delhi',
                'assigned_district': 'East Delhi',
                'assigned_ward': 'Ward 25, Laxmi Nagar',
                'status': 'offline',
                'gps_enabled': False,
                'performance_score': 71,
                'total_tasks_completed': 534
            },
            {
                'full_name': 'Kavita Joshi',
                'email': 'kavita.joshi@suvidha.gov.in',
                'phone': '+91 98765 43218',
                'category': 'electric_meter',
                'assigned_state': 'Delhi',
                'assigned_district': 'West Delhi',
                'assigned_ward': 'Ward 30, Janakpuri',
                'status': 'online',
                'gps_enabled': True,
                'performance_score': 91,
                'total_tasks_completed': 912
            },
            {
                'full_name': 'Mohan Das',
                'email': 'mohan.das@suvidha.gov.in',
                'phone': '+91 98765 43219',
                'category': 'rwa_work',
                'assigned_state': 'Delhi',
                'assigned_district': 'Central Delhi',
                'assigned_ward': 'Ward 5, Karol Bagh',
                'status': 'on_task',
                'gps_enabled': True,
                'performance_score': 78,
                'total_tasks_completed': 389
            }
        ]
        
        created_agents = []
        
        for i, agent_data in enumerate(agents_data):
            agent = FieldAgent(
                employee_id=f"FA-2026-{(i+1):05d}",
                full_name=agent_data['full_name'],
                email=agent_data['email'],
                phone=agent_data['phone'],
                password=generate_password_hash('agent123'),
                category=agent_data['category'],
                supervisor_id=supervisor_id,
                assigned_state=agent_data['assigned_state'],
                assigned_district=agent_data['assigned_district'],
                assigned_ward=agent_data['assigned_ward'],
                status=agent_data['status'],
                gps_enabled=agent_data['gps_enabled'],
                performance_score=agent_data['performance_score'],
                total_tasks_completed=agent_data['total_tasks_completed'],
                tasks_completed_today=random.randint(5, 25),
                current_latitude=28.5355 + random.uniform(-0.05, 0.05),
                current_longitude=77.2410 + random.uniform(-0.05, 0.05),
                location_updated_at=datetime.utcnow() - timedelta(minutes=random.randint(1, 30))
            )
            db.session.add(agent)
            created_agents.append(agent)
        
        db.session.commit()
        print(f"Created {len(created_agents)} field agents")
        
        return created_agents


def seed_tasks(agents=None):
    """Create sample task assignments"""
    
    with app.app_context():
        if agents is None:
            agents = FieldAgent.query.all()
        
        if not agents:
            print("No agents found. Run seed_field_agents first.")
            return
        
        # Check if already seeded
        existing = TaskAssignment.query.first()
        if existing:
            print("Tasks already exist. Skipping...")
            return
        
        # Get an assigner (Government Official)
        assigner = GovOfficial.query.filter_by(department='field_ops').first()
        if not assigner:
            assigner = GovOfficial.query.first()
        
        if not assigner:
            print("No government official found for task assignment")
            return
        
        # Sample households
        households = [
            {'house_number': '101', 'ward': 'Ward 45, Saket', 'full_address': 'Block A, Flat 101, Saket'},
            {'house_number': '102', 'ward': 'Ward 45, Saket', 'full_address': 'Block A, Flat 102, Saket'},
            {'house_number': '103', 'ward': 'Ward 45, Saket', 'full_address': 'Block A, Flat 103, Saket'},
            {'house_number': '104', 'ward': 'Ward 45, Saket', 'full_address': 'Block A, Flat 104, Saket'},
            {'house_number': '105', 'ward': 'Ward 45, Saket', 'full_address': 'Block A, Flat 105, Saket'},
            {'house_number': '201', 'ward': 'Ward 45, Saket', 'full_address': 'Block B, Flat 201, Saket'},
            {'house_number': '202', 'ward': 'Ward 45, Saket', 'full_address': 'Block B, Flat 202, Saket'},
            {'house_number': '301', 'ward': 'Ward 46, Malviya Nagar', 'full_address': 'Block A, Flat 301, Malviya Nagar'},
            {'house_number': '302', 'ward': 'Ward 46, Malviya Nagar', 'full_address': 'Block A, Flat 302, Malviya Nagar'},
            {'house_number': '401', 'ward': 'Ward 47, Hauz Khas', 'full_address': 'Block C, Flat 401, Hauz Khas'},
        ]
        
        today = datetime.now().strftime('%Y%m%d')
        tasks_created = []
        task_count = 0
        
        # Create tasks for each agent
        for agent in agents:
            # Filter households by agent's ward or assign randomly
            agent_households = [h for h in households if agent.assigned_ward and h['ward'].startswith(agent.assigned_ward.split(',')[0])]
            if not agent_households:
                agent_households = random.sample(households, min(5, len(households)))
            
            for house in agent_households:
                task_count += 1
                
                # Randomize status
                status_choices = ['pending', 'pending', 'completed', 'completed', 'in_progress']
                status = random.choice(status_choices)
                
                task = TaskAssignment(
                    task_id=f"TASK-{today}-{task_count:05d}",
                    agent_id=agent.id,
                    assigned_by=assigner.id,
                    task_type=agent.category,
                    house_number=house['house_number'],
                    ward=house['ward'],
                    city='Delhi',
                    full_address=house['full_address'],
                    latitude=28.5355 + random.uniform(-0.02, 0.02),
                    longitude=77.2410 + random.uniform(-0.02, 0.02),
                    priority=random.choice(['normal', 'normal', 'high', 'urgent']),
                    status=status,
                    photos_added=status == 'completed' and random.random() > 0.2,
                    problem_raised=random.random() < 0.1,
                    meter_reading=random.uniform(100, 500) if status == 'completed' else None,
                    assigned_at=datetime.utcnow() - timedelta(hours=random.randint(1, 8)),
                    started_at=datetime.utcnow() - timedelta(hours=random.randint(0, 4)) if status in ['in_progress', 'completed'] else None,
                    completed_at=datetime.utcnow() - timedelta(minutes=random.randint(10, 120)) if status == 'completed' else None,
                    completion_time_minutes=random.randint(5, 30) if status == 'completed' else None
                )
                
                if task.problem_raised:
                    task.problem_type = random.choice(['meter_tampering', 'damaged', 'inaccessible', 'safety_hazard'])
                    task.problem_description = f"Issue found at {house['house_number']}"
                
                db.session.add(task)
                tasks_created.append(task)
        
        db.session.commit()
        print(f"Created {len(tasks_created)} task assignments")


def seed_performance(agents=None):
    """Create sample performance records"""
    
    with app.app_context():
        if agents is None:
            agents = FieldAgent.query.all()
        
        if not agents:
            print("No agents found.")
            return
        
        # Check if already seeded
        existing = AgentPerformance.query.first()
        if existing:
            print("Performance records already exist. Skipping...")
            return
        
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        for agent in agents:
            # Create current month performance
            perf = AgentPerformance(
                agent_id=agent.id,
                month=current_month,
                year=current_year,
                tasks_assigned=random.randint(200, 400),
                tasks_completed=random.randint(180, 380),
                tasks_failed=random.randint(2, 15),
                completion_rate=random.uniform(85, 98),
                avg_completion_time=random.uniform(8, 25),
                on_time_rate=random.uniform(80, 95),
                problems_flagged=random.randint(5, 30),
                photos_uploaded=random.randint(150, 350),
                photo_compliance_rate=random.uniform(85, 99),
                feedback_count=random.randint(10, 50),
                avg_rating=random.uniform(3.5, 5.0),
                score=agent.performance_score,
                rating='excellent' if agent.performance_score >= 90 else 'good' if agent.performance_score >= 70 else 'average',
                score_change=random.uniform(-5, 10)
            )
            db.session.add(perf)
            
            # Create previous month performance
            prev_month = current_month - 1 if current_month > 1 else 12
            prev_year = current_year if current_month > 1 else current_year - 1
            
            prev_perf = AgentPerformance(
                agent_id=agent.id,
                month=prev_month,
                year=prev_year,
                tasks_assigned=random.randint(180, 380),
                tasks_completed=random.randint(160, 360),
                tasks_failed=random.randint(3, 20),
                completion_rate=random.uniform(82, 96),
                avg_completion_time=random.uniform(10, 28),
                on_time_rate=random.uniform(78, 93),
                problems_flagged=random.randint(8, 35),
                photos_uploaded=random.randint(140, 330),
                photo_compliance_rate=random.uniform(82, 97),
                feedback_count=random.randint(8, 45),
                avg_rating=random.uniform(3.3, 4.8),
                score=agent.performance_score - random.uniform(-5, 10),
                rating='good',
                score_change=random.uniform(-8, 8)
            )
            db.session.add(prev_perf)
        
        db.session.commit()
        print(f"Created performance records for {len(agents)} agents")


if __name__ == '__main__':
    print("Seeding Field Agents...")
    agents = seed_field_agents()
    
    print("\nSeeding Tasks...")
    seed_tasks()
    
    print("\nSeeding Performance Records...")
    seed_performance()
    
    print("\nSeeding complete!")
