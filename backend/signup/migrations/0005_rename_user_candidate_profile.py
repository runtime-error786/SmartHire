# Generated by Django 5.1.1 on 2024-10-22 07:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('signup', '0004_remove_profile_education_remove_profile_github_link_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='candidate',
            old_name='user',
            new_name='profile',
        ),
    ]
