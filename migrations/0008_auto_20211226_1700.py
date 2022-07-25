# Generated by Django 3.2.7 on 2021-12-26 16:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incognito', '0007_auto_20211225_2245'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monitoring_table',
            name='in_datas',
            field=models.CharField(blank=True, max_length=14, verbose_name='incoming_datas'),
        ),
        migrations.AlterField(
            model_name='monitoring_table',
            name='out_datas',
            field=models.CharField(blank=True, max_length=14, verbose_name='outcoming_datas'),
        ),
        migrations.AlterField(
            model_name='monitoring_table',
            name='received_datas',
            field=models.CharField(blank=True, max_length=14, verbose_name='received_datas'),
        ),
        migrations.AlterField(
            model_name='monitoring_table',
            name='sent_datas',
            field=models.CharField(blank=True, max_length=14, verbose_name='sent_datas'),
        ),
    ]
