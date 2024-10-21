
from django.db import models
from django.contrib.auth.hashers import make_password

class User(models.Model):
    ROLE_CHOICES = [
        ('user','User'),
        ('admin', 'Admin'),
    ]
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_subscription = models.BooleanField(default=False)

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hashes the password and stores it."""
        self.password = make_password(raw_password)  # Hash the password

class Candidate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    score = models.FloatField()

    def __str__(self):
        return f"Candidate: {self.user.email}"

class Recruiter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    company_name = models.CharField(max_length=255)
    company_website = models.URLField()

    def __str__(self):
        return f"Recruiter: {self.company_name}"

class Subscription(models.Model):
    SUBSCRIPTION_TYPE_CHOICES = [
        ('ai', 'AI'),
        ('practice', 'Practice'),
        ('both', 'Both'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    type = models.CharField(max_length=10, choices=SUBSCRIPTION_TYPE_CHOICES, null=True, blank=True)  # Allow nulls and blanks

    def __str__(self):
        return f"Subscription for {self.user.email}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    github_link = models.URLField(blank=True, null=True)
    linkedin_link = models.URLField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)  
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

