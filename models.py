#-*- coding: utf-8 -*-
from django.db import models

class connexion(models.Model):
	wan_ip = models.CharField( "ip WAN", max_length=15)
	conn_type = models.CharField("type connexion", max_length=3)
	country_name = models.CharField("pays", max_length=128)
	country_code = models.CharField("code pays", max_length=2)
	#add_route = models.CharField("regle route", blank=True, max_length=255)
	#add_table = models.CharField("regle IPtables", blank=True, max_length=255)
	last_vpn_conf = models.CharField("config VPN", blank=True, max_length=128)
	cur_wan_ip = models.CharField("current ip WAN", blank=True, max_length=15)
	cur_country_name = models.CharField("current pays", blank=True, max_length=64)
	cur_country_code = models.CharField("current code pays", blank=True, max_length=2)
	cur_city_name = models.CharField("current ville", blank=True, max_length=64)

	#def __unicode__(self):
	#	return self.wan_ip

class mac_table(models.Model):
	client = models.CharField( "client", blank=True, max_length=32)
	ip = models.CharField( "suffixe ip", blank=True, max_length=3)
	mac = models.CharField( "adresse MAC", blank=True, max_length=17)

	#def __unicode__(self):
	#	return self.client

class setting_table(models.Model):
	ap_name = models.CharField("SSID", max_length=32)
	ap_wpa = models.CharField("SSID password", max_length=32)
	ap_ip = models.CharField("SSID ip", max_length=7)
	ap_channel = models.CharField("channel", max_length=2)
	start_dhcp = models.CharField("DHCP start ip", max_length=3)
	end_dhcp = models.CharField("DHCP end ip", max_length=3)
	reboot = models.CharField("reboot", max_length=1)
	reset = models.CharField("reset", max_length=1)
	stop = models.CharField("stop", max_length=1)
	log = models.CharField("logfile", max_length=1)
	error = models.CharField("error code", max_length=3)
	error_text = models.CharField("error text", max_length=255)
	dns1 = models.CharField("dns N°1", max_length=15)
	dns2 = models.CharField("dns N°2", max_length=15)
	dns3 = models.CharField("dns N°3", blank=True, max_length=15)
	adblock = models.CharField("adblock", max_length=1)
	route_reach1 = models.CharField("host N°1", blank=True, max_length=15)
	route_reach2 = models.CharField("host N°2", blank=True, max_length=15)
	mask1 = models.CharField("mask1", blank=True, max_length=2)
	mask2 = models.CharField("mask2", blank=True, max_length=2)
	route_gateway1 = models.CharField("gateway N°1", blank=True, max_length=15)
	route_gateway2 = models.CharField("gateway N°2", blank=True, max_length=15)

	#def __unicode__(self):
	#	return self.ap_name

class vpn_settings_table(models.Model):
	vpn_dns1 = models.CharField("dns for VPN N°1", blank=True, max_length=15)
	vpn_dns2 = models.CharField("dns for VPN N°2", blank=True, max_length=15)

	#def __unicode__(self):
	#	return self.vpn_dns1

class monitoring_table(models.Model):
	eth_ip = models.CharField("eth0 ip", blank=True, max_length=15)
	eth_mac = models.CharField("eth0 mac", blank=True, max_length=17)
	wlan_mac = models.CharField("wlan0 mac", blank=True, max_length=17)
	received_datas = models.CharField("received_datas", blank=True, max_length=14)
	sent_datas = models.CharField("sent_datas", blank=True, max_length=14)
	in_datas = models.CharField("incoming_datas", blank=True, max_length=14)
	out_datas = models.CharField("outcoming_datas", blank=True, max_length=14)
	int_temp = models.CharField("internal temp", blank=True, max_length=5)
	uptime = models.CharField("uptime", blank=True, max_length=128)
	load_1min = models.CharField("1min load", blank=True, max_length=5)
	load_5min = models.CharField("5min load", blank=True, max_length=5)
	load_15min = models.CharField("15min load", blank=True, max_length=5)
	space_total = models.CharField("total space", blank=True, max_length=10)
	space_free = models.CharField("free space", blank=True, max_length=10)
	space_percent = models.CharField("percent free space", blank=True, max_length=5)
	connected_hosts = models.CharField("connected hosts", blank=True, max_length=255)
	openvpn_v = models.CharField("OpenVPN version", blank=True, max_length=64)
	tor_v = models.CharField("Tor version", blank=True, max_length=64)

	#def __unicode__(self):
	#	return self.eth_ip







		
