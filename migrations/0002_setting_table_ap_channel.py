# Generated by Django 3.2.7 on 2021-10-17 15:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incognito', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='setting_table',
            name='ap_channel',
            field=models.CharField(default=2, max_length=2, verbose_name='channel'),
            preserve_default=False,
        ),
    ]