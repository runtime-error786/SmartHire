# Generated by Django 5.0.6 on 2024-11-16 09:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('signup', '0021_remove_candidate_is_subscription_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_subscription',
        ),
    ]
