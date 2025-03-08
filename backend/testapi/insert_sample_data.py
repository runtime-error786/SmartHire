# insert_sample_data.py
from signup.models import User, Profile, Candidate, Recruiter, Job, Report
from django.utils import timezone
import random

def insert_sample_data():
    # Create 10 sample users
    for i in range(10):
        user = User.objects.create(
            email=f"user{i+100}@example.com",
            password="password123",
            role=random.choice(['user', 'admin'])
        )
        profile = Profile.objects.create(
            user=user,
            first_name=f"First{i}",
            last_name=f"Last{i}",
            city=f"City{i}",
            country=f"Country{i}",
            linkedin_link=f"https://linkedin.com/in/user{i}",
            phone_number=f"123-456-789{i}",
            bio=f"Bio of User {i}"
        )
        Candidate.objects.create(
            profile=profile,
            score=random.uniform(0, 100),
            education=f"Education of User {i}",
            skills="Python, Django",
            github_link=f"https://github.com/user{i}"
        )
        Recruiter.objects.create(
            profile=profile,
            company_name=f"Company {i}",
            company_website=f"https://company{i}.com"
        )
        job = Job.objects.create(
            job_name=f"Job {i}",
            workplace_type="Remote",
            job_location=f"Location {i}",
            employment_type="Full-time",
            description=f"Description of Job {i}",
            skills="Full Stack",
            interview_type="manual",
            recruiter=Recruiter.objects.get(profile=profile),
            created_at=timezone.now(),
            updated_at=timezone.now()
        )
        # Create a report for each job
        Report.objects.create(
            job=job
        )

if __name__ == "__main__":
    insert_sample_data()
    print("Sample data inserted successfully!")
