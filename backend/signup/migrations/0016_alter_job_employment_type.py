# Generated by Django 5.0.6 on 2024-11-13 19:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('signup', '0015_alter_job_skills'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='employment_type',
            field=models.CharField(choices=[('Full-time', 'Full-time'), ('Part-time', 'Part-time'), ('Contract', 'Contract'), ('Temporary', 'Temporary'), ('Internship', 'Internship')], max_length=10),
        ),
    ]
