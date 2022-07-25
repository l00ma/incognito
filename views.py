#-*- coding: utf-8 -*-
import json, re, os
from decouple import config
from stem import Signal
from stem.control import Controller
from .forms import ConnexionForm, UploadFileForm, UpdateProfile
from django.shortcuts import render, redirect
from django.conf import settings
from os import listdir
from os.path import isfile, join
from django.http import HttpResponse
from django.views import View
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from incognito.models import connexion, mac_table, setting_table, vpn_settings_table, monitoring_table


def handler404(request, exception):
    return redirect('/connexion')

def is_matching_default(user, pswd):
    if user == config('DEFAULT_USER') and pswd == config('DEFAULT_PASS'):
        return True
    else:
        return False

def connex(request):
    error = False
    if request.method == "POST":
        form = ConnexionForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            is_first_connexion  = is_matching_default(username, password)
            user = authenticate(username=username, password=password)  # Nous vérifions si les données sont correctes
            if user is not None:  # Si l'objet renvoyé n'est pas None
                login(request, user)  # nous connectons l'utilisateur
                request.session.set_expiry(1200) # fixe le delai d'expiration de session à 20 min
                if is_first_connexion == False:
                    return redirect('/welcome')
                else:
                    return redirect('/profil?param=1')
            else: # sinon une erreur sera affichée
                error = 'Wrong username or password'
    else:
        form = ConnexionForm()
    return render(request, 'connexion.html', locals())

def manage_vpn_conf(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            form = UploadFileForm(request.POST, request.FILES)
            if form.is_valid():
                nbfile = 0
                textefile = ''
                for f in request.FILES.getlist('file'):
                    extensions = ('.conf', '.ovpn')
                    if f.name.endswith(extensions):
                        if f.size<100000:
                            upload_path = os.path.join(settings.VPN_CONFIG_FILE, f.name )
                            with open(upload_path, 'w') as destination:
                                for chunk in f.chunks():
                                    destination.write(str(chunk.decode('utf-8')))
                                    nbfile = nbfile + 1
                                    if nbfile > 1:
                                        textefile = 's'
                        else:
                            return render(request, 'vpn_config.html', {'form': form, 'error': f.name + ': size is bigger than 100 ko'})
                    else:
                        return render(request, 'vpn_config.html', {'form': form, 'error': f.name + ': bad extension'})
                return render(request, 'vpn_config.html', {'form': form, 'success': str(nbfile) + ' file' + textefile + ' added'})
        else:
            form = UploadFileForm()
        return render(request, 'vpn_config.html', {'form': form})
    else:
        return redirect('/connexion')

def load_vpn_conf(request):
    if request.user.is_authenticated:
        extensions = ('.conf', '.ovpn')
        vpn_conf_files=list()
        for filename in listdir(os.path.abspath(settings.VPN_CONFIG_FILE)):
            if isfile and filename.endswith(extensions):
                vpn_conf_files.append(filename)
        vpn_conf_files.sort()
        datas = json.dumps(vpn_conf_files)
        return HttpResponse( datas, content_type='application/json')
    else:
        return redirect('/connexion')


def delete_vpn_conf(request):
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                jobject = json.loads(request.body.decode())
                for f in jobject:
                    delete_path = os.path.join(settings.VPN_CONFIG_FILE, f )
                    os.remove(delete_path)
        return HttpResponse('OK')
    else:
        return redirect('/connexion')

def welcome(request):
    if request.user.is_authenticated:
        extensions = ('.conf', '.ovpn')
        vpn_conf_files=list()
        for filename in listdir(os.path.abspath(settings.VPN_CONFIG_FILE)):
            if isfile and filename.endswith(extensions):
                vpn_conf_files.append(filename)
        vpn_conf_files.sort()
        return render(request, 'welcome.html', {'logged_user_name': request.user, 'vpn_conf_path': vpn_conf_files})
    else:
        return redirect('/connexion')

def deconnexion(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('/connexion')
    else:
        return redirect('/connexion')


def update_profile(request):
    if request.user.is_authenticated:
        first_login = request.GET['param']
        args = {}
        if request.method == 'POST':
            form = UpdateProfile(request.POST, instance=request.user)
            if form.is_valid():
                form.save()
                update_session_auth_hash(request, request.user)  # Important!
                args['form'] = form
                args['success'] = 'your profil is updated'
                return render(request, 'register.html', args )
        else:
            form = UpdateProfile(instance=request.user)
        args['form'] = form
        if first_login == '1':
            args['first_login'] = 'SECURITY WARNING: Please change default username and password !!'
        return render(request, 'register.html', args)
    else:
        return redirect('/connexion')


def auto_refresh_data(request):
    if request.user.is_authenticated:
        connexion_data = json.dumps([dict(item) for item in connexion.objects.all().values('conn_type', 'wan_ip', 'country_code', 'last_vpn_conf', 'country_name', 'cur_wan_ip', 'cur_country_name', 'cur_country_code', 'cur_city_name')])
        settings_data = json.dumps([dict(item) for item in setting_table.objects.all().values('log', 'error_text')])
        datas = cat_json(connexion_data, settings_data)
        return HttpResponse( datas, content_type='application/json')
    else:
        return redirect('/connexion')


def vpn_dns_saved_data(request):
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                jobject = json.loads(request.body.decode())
                vpn_dns_update = vpn_settings_table.objects.get(pk = 1)
                for val in jobject['SendInfo']:
                    vpn_dns_update.vpn_dns1 = val['vpn_dns1']
                    vpn_dns_update.vpn_dns2 = val['vpn_dns2']
                vpn_dns_update.save()
                return HttpResponse('OK')
    else:
        return redirect('/connexion')

def manual_refresh_data(request):
    if request.user.is_authenticated:
        #connexion_data = json.dumps([dict(item) for item in connexion.objects.all().values('add_route', 'add_table')])
        settings_data = json.dumps([dict(item) for item in setting_table.objects.all().values('ap_name', 'ap_wpa', 'ap_ip', 'ap_channel', 'start_dhcp', 'end_dhcp', 'reboot', 'reset', 'stop', 'dns1', 'dns2', 'dns3', 'adblock', 'mask1', 'mask2', 'route_gateway1', 'route_gateway2', 'route_reach1', 'route_reach2')])
        vpn_dns_data = json.dumps([dict(item) for item in vpn_settings_table.objects.all().values('vpn_dns1', 'vpn_dns2')])
        i=0
        mac_table_data = ''
        while i<5:
            job = mac_table.objects.get(pk=i+1)
            concat = "\"client" + str(i) + "\":\"" + job.client + "\",\"ip" + str(i) + "\":\"" + job.ip + "\",\"mac" + str(i) + "\":\"" + job.mac + "\","
            mac_table_data = mac_table_data + concat
            i = i+1
        mac_table_data = "[{" + mac_table_data[:-1] + "}]"
        datas = cat_json(settings_data, vpn_dns_data, mac_table_data)
        return HttpResponse( datas, content_type='application/json')
    else:
        return redirect('/connexion')

def auto_saved_data(request):
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                jobject = json.loads(request.body.decode())
                connexion_update = connexion.objects.get(pk = 1)
                setting_table_update = setting_table.objects.get(pk = 1)
                for val in jobject['SendInfo']:
                    connexion_update.conn_type = val['conn_type']
                    connexion_update.last_vpn_conf = val['last_vpn_conf']
                    setting_table_update.log = val['log']
                    setting_table_update.error_text = val['error_text']
                connexion_update.save()
                setting_table_update.save()
                return HttpResponse('OK')
    else:
        return redirect('/connexion')        

def manual_saved_data(request):
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                jobject = json.loads(request.body.decode())
                #connexion_update = connexion.objects.get(pk = 1)
                setting_table_update = setting_table.objects.get(pk = 1)
                mac_table1_update = mac_table.objects.get(pk = 1)
                mac_table2_update = mac_table.objects.get(pk = 2)
                mac_table3_update = mac_table.objects.get(pk = 3)
                mac_table4_update = mac_table.objects.get(pk = 4)
                mac_table5_update = mac_table.objects.get(pk = 5)
                for val in jobject['SendInfo']:
                    #connexion_update.add_route = val['add_route']
                    #connexion_update.add_table = val['add_table']
                    setting_table_update.ap_name = val['ap_name']
                    setting_table_update.ap_wpa = val['ap_wpa']
                    setting_table_update.ap_ip = val['ap_ip']
                    setting_table_update.ap_channel = val['ap_channel']
                    setting_table_update.start_dhcp = val['start_dhcp']
                    setting_table_update.end_dhcp = val['end_dhcp']
                    setting_table_update.reboot = val['reboot']
                    setting_table_update.reset = val['reset']
                    setting_table_update.stop = val['stop']
                    setting_table_update.dns1 = val['dns1']
                    setting_table_update.dns2 = val['dns2']
                    setting_table_update.dns3 = val['dns3']
                    setting_table_update.adblock = val['adblock']
                    setting_table_update.mask1 = val['mask1']
                    setting_table_update.mask2 = val['mask2']
                    setting_table_update.route_gateway1 = val['route_gateway1']
                    setting_table_update.route_gateway2 = val['route_gateway2']
                    setting_table_update.route_reach1 = val['route_reach1']
                    setting_table_update.route_reach2 = val['route_reach2']
                    mac_table_list = list(val['mac_table'])
                    mac_table1_update.client = mac_table_list[0]
                    mac_table1_update.ip = mac_table_list[1]
                    mac_table1_update.mac = mac_table_list[2]
                    mac_table2_update.client = mac_table_list[3]
                    mac_table2_update.ip = mac_table_list[4]
                    mac_table2_update.mac = mac_table_list[5]
                    mac_table3_update.client = mac_table_list[6]
                    mac_table3_update.ip = mac_table_list[7]
                    mac_table3_update.mac = mac_table_list[8]
                    mac_table4_update.client = mac_table_list[9]
                    mac_table4_update.ip = mac_table_list[10]
                    mac_table4_update.mac = mac_table_list[11]
                    mac_table5_update.client = mac_table_list[12]
                    mac_table5_update.ip = mac_table_list[13]
                    mac_table5_update.mac = mac_table_list[14]
                #connexion_update.save()
                setting_table_update.save()
                mac_table1_update.save()
                mac_table2_update.save()
                mac_table3_update.save()
                mac_table4_update.save()
                mac_table5_update.save()
                return HttpResponse('OK')
    else:
        return redirect('/connexion')


def torchangeip(request):
    if request.user.is_authenticated:
        tor_pass = 'fJbFld45Pj'
        with Controller.from_port(port = 9051) as controller:
            controller.authenticate(password=tor_pass)
            controller.signal(Signal.NEWNYM)
            return HttpResponse('OK')
    else:
        return redirect('/connexion')


def adblockupdate(request):
    if request.user.is_authenticated:
        os.system("touch adb.ano")
        return HttpResponse('OK')
    else:
        return redirect('/connexion')


def dellog(request):
    if request.user.is_authenticated:
        logfile_path = os.path.join(settings.LOG_FILE, 'anonymized.log')
        file_delete = open(logfile_path,"w")
        file_delete.close()
        return HttpResponse('OK')
    else:
        return redirect('/connexion')

def readlog(request):
    if request.user.is_authenticated:
        logfile_path = os.path.join(settings.LOG_FILE, 'anonymized.log')
        file_load = open(logfile_path,"r")
        file_content = file_load.readlines()
        file_load.close()
        file_content = file_content[::-1]
        file_content = json.dumps(file_content)
        return HttpResponse( file_content, content_type='application/json')
    else:
        return redirect('/connexion')

def readmonitor(request):
    if request.user.is_authenticated:
        monitor_data = json.dumps([dict(item) for item in monitoring_table.objects.all().values('eth_ip', 'eth_mac', 'wlan_mac', 'received_datas', 'sent_datas', 'in_datas', 'out_datas', 'int_temp', 'uptime', 'load_1min', 'load_5min', 'load_15min', 'space_total', 'space_free', 'space_percent', 'connected_hosts', 'openvpn_v', 'tor_v')])
        datas = cat_json(monitor_data)
        return HttpResponse( datas, content_type='application/json')
    else:
        return redirect('/connexion')

def cat_json(*input):
    input_values = list(input)
    first = True
    jsonString = ''
    for value in input_values:
        value = value[2:-2]
        if first:
            jsonString = '{' + value + ','
            first = False
        else:
            value = value + ','
            jsonString = jsonString + value
    jsonString = jsonString[:-1]
    jsonString = jsonString + '}'
    return jsonString
