(function($){

var vpn_dns1, vpn_dns_2, mac_table, wan_ip, conn_type, actual_ip, actual_country_name, actual_country_code, cur_wan_ip, cur_country_name, cur_country_code, cur_city_name, country_code, country_name, last_vpn_conf, ap_name, ap_wpa, ap_ip, ap_channel, ip1, ip2, start_dhcp, end_dhcp, reboot, reset, stop, log, state_text, dns1, dns2, dns3, adblock, prev_state_text, update_log, eth_ip, eth_mac, wlan_mac, received_datas, sent_datas, in_datas, out_datas, int_temp, uptime, load_1min, load_5min, load_15min, space_total, space_free, space_percent, connected_hosts, openvpn_ver, tor_ver, route_reach1, route_reach2, route_mask1, route_mask2, route_gateway1, route_gateway2;
var time = 0;

//DEBUT DE GESTION DU CSRF 
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});
//FIN DE GESTION DU CSRF 

function load_settable_Values() {
	$.ajax({ 
		type:'get', 
		async: false,
		url: 'welcome_data_set/',
		dataType: 'json',
		success: (function(data){
			if (typeof data == 'undefined') {
                return false;
            }else {
				ap_name = data.ap_name;
				ap_wpa = data.ap_wpa;
				ap_ip = data.ap_ip;
				var res = ap_ip.split('.');
					ip1 = res[0];
					ip2 = res[1];
				ap_channel = data.ap_channel;
				route_reach1 = data.route_reach1;
				route_reach2 = data.route_reach2;
				route_mask1 = data.route_mask1;
				route_mask2 = data.route_mask2;
				route_gateway1 = data.route_gateway1;
				route_gateway2 = data.route_gateway2;
				start_dhcp = data.start_dhcp;
				end_dhcp = data.end_dhcp;
				dns1 = data.dns1;
				dns2 = data.dns2;
				dns3 = data.dns3;
				adblock = data.adblock;
				vpn_dns1 = data.vpn_dns1;
				vpn_dns2 = data.vpn_dns2;
				mac_table = [data.client0, data.ip0, data.mac0, data.client1, data.ip1, data.mac1, data.client2, data.ip2, data.mac2, data.client3, data.ip3, data.mac3, data.client4, data.ip4, data.mac4];
				//variables initialisées à zero
				reboot = 0;
				reset = 0;
				stop = 0;
            }
		}),
		error: (function() {
			addNotice("<p>Unable to load datas.</p>");
		}),
	});

}	

function load_auto_Values() {
	prev_state_text = state_text;
	$.ajax({ 
		type:'get', 
		async: false,
		url: 'welcome_data/',
		dataType: 'json',
		success: (function(data){
			if (typeof data === 'undefined') {
                return false;
            }else {
                wan_ip = data.wan_ip;
				conn_type = data.conn_type;
				country_name = data.country_name;
				country_code = data.country_code;
				last_vpn_conf = data.last_vpn_conf;
				log = data.log;
				state_text = data.error_text;
				cur_wan_ip = data.cur_wan_ip;
				cur_country_name = data.cur_country_name;
				cur_country_code = data.cur_country_code;
				cur_city_name = data.cur_city_name;

				Actualise();
            }
		}),
		error: (function() {
			window.location = "../connexion";
			setTimeout(load_auto_Values, 5000);
		}),
	});
}	

function traiteEtAffiche() { 
	$("#ap_ssid_value").val(ap_name);
	$("#ap_pwd_value").val(ap_wpa);
	$('.hide').css("visibility", "hidden");
	$("#ap_ip1_value").val(ip1);
	$("#ap_ip2_value").val(ip2);
	$("#ap_channel_value").val(ap_channel);
	$("#ap_dhcpstart_value").val(start_dhcp);
	$("#ap_dhcpend_value").val(end_dhcp);
	$("#select_log").val(log);
	$("#pays").val(last_vpn_conf);

	if (mac_table.length > 0 ) {
		$("#host1").val(mac_table[0]);
		$("#reserved_ip1").val(mac_table[1]);
		$("#mac1").val(mac_table[2]);

		$("#host2").val(mac_table[3]);
		$("#reserved_ip2").val(mac_table[4]);
		$("#mac2").val(mac_table[5]);

		$("#host3").val(mac_table[6]);
		$("#reserved_ip3").val(mac_table[7]);
		$("#mac3").val(mac_table[8]);

		$("#host4").val(mac_table[9]);
		$("#reserved_ip4").val(mac_table[10]);
		$("#mac4").val(mac_table[11]);

		$("#host5").val(mac_table[12]);
		$("#reserved_ip5").val(mac_table[13]);
		$("#mac5").val(mac_table[14]);
	}
	
	$("#dns1").val(dns1);
	$("#dns2").val(dns2);
	$("#dns3").val(dns3);


	$("#route_reach1").val(route_reach1);
	$("#route_reach2").val(route_reach2);
	if (route_mask1) {$("#route_mask1").val(route_mask1);}
	else { $("#route_mask1").val('24');}
	if (route_mask2) {$("#route_mask2").val(route_mask2);}
	else { $("#route_mask2").val('24');}
	$("#route_gateway1").val(route_gateway1);
	$("#route_gateway2").val(route_gateway2);

	if (adblock == 0){
		$("#ap_adblock").attr('checked', false);
	}
	else  {$("#ap_adblock").attr('checked', true);}

	$('#vpn_dns1').val(vpn_dns1);
	$('#vpn_dns2').val(vpn_dns2);
	
	$("#ap_reboot, #ap_reset, #ap_stop").attr('checked', false);
	$( '#connexion' + conn_type ).prop('checked', true);
	$("#wan_ip").html('Real WAN IP:<br><span class=\'donnees_de_bord\'>' + wan_ip + '</span><br><img src="../static/css/images/country/' + country_code + '.png" alt="Flag" height="11" width="16">&nbsp;&nbsp;' + country_name );
}

function Actualise() {

	if (time == 0) {
		if (cur_wan_ip != 'not available') {actual_ip = cur_wan_ip} else {actual_ip = 'wait'}
		if (cur_country_code !='not available') { actual_country_code = cur_country_code.toLowerCase() } else { actual_country_code = 'null' }
        if (cur_country_name !='not available' || cur_city_name !='not available' ) { actual_country_name = cur_country_name + ' ' + cur_city_name } else { actual_country_name = 'unknown' }
	}
	time++;

	$("#actual_ip").html('Current WAN IP:<br><span class=\'donnees_de_bord\'>' + actual_ip + '</span><br><img src="../static/css/images/country/' + actual_country_code + '.png" alt="Flag" height="11" width="16">&nbsp;&nbsp;' + actual_country_name );
	if (conn_type == 1) { 
		mode = 'Forward'; 
		$("#vpn_conf").html(''); 
		$('#pays').prop('disabled', false).css('background-color', '#c9f7b8'); 
		$('[id^=route]').prop('disabled', false).css('background-color', '#f7f7f7'); 
		$('[id^= but_del_route]').prop("disabled",false);
		$("#but_changeip1,#but_changeip2").prop("disabled",true);
	}
	else if (conn_type == 2) {
		mode = 'OpenVPN'; 
		$("#vpn_conf").html('OVPN config file:<br>' + last_vpn_conf ); 
		$('#pays').prop('disabled', false).css('background-color', '#c9f7b8'); 
		$('[id^=route]').prop('disabled', false).css('background-color', '#f7f7f7'); 
		$('[id^= but_del_route]').prop("disabled",false);
		$("#but_changeip1,#but_changeip2").prop("disabled",true);
	}
	else if (conn_type == 3) {
		mode = 'TOR Proxy'; 
		$("#vpn_conf").html(''); 
		$('#pays').prop('disabled', false).css('background-color', '#c9f7b8'); 
		$('[id^=route]').prop('disabled', true).css('background-color', '#f29999'); 
		$('[id^= but_del_route]').prop("disabled",true);
		$("#but_changeip1").prop("disabled",false);
		$("#but_changeip2").prop("disabled",true);
	}
	else if (conn_type == 4) {
		mode = 'OpenVPN to TOR'; 
		$("#vpn_conf").html('OVPN config file:<br>' + last_vpn_conf ); 
		$('#pays').prop('disabled', true).css('background-color', '#f29999'); 
		$('[id^=route]').prop('disabled', true).css('background-color', '#f29999'); 
		$('[id^= but_del_route]').prop("disabled",true);
		$("#but_changeip1").prop("disabled",true);
		$("#but_changeip2").prop("disabled",false);
	}
	$("#mode").html('Connexion Type:<br><span class=\'donnees_de_bord\'>' + mode + '</span>');
	if (prev_state_text != state_text) {
		addNotice('<p>' + state_text +'</p>');
	}
	if (time >= 2) {time = 0;}
	setTimeout(load_auto_Values, 5000)
}

function Save_manual_Values() {
	var SendInfo = {"SendInfo": [{"ap_name": ap_name, "ap_wpa": ap_wpa, "ap_ip": ap_ip, "ap_channel": ap_channel, "start_dhcp": start_dhcp, "end_dhcp": end_dhcp, "reboot": reboot, "reset": reset, "stop": stop, "dns1": dns1, "dns2": dns2, "dns3": dns3, "mac_table": mac_table, "adblock": adblock, "mask1": route_mask1, "mask2": route_mask2, "route_gateway1": route_gateway1, "route_gateway2": route_gateway2, "route_reach1": route_reach1, "route_reach2": route_reach2}] };
		
	$.ajax({
		type:'post',
		url: 'save_manual/',
		data: JSON.stringify(SendInfo),
		contentType: 'application/json; charset=utf-8',
		dataType: 'text',
		success: function(result){
			//if(result === 'redirectUser') {
			//	 window.location.href = '../connexion'
			//}
		}
	});
}

function Save_vpn_dns() {
	var SendInfo = {"SendInfo": [{"vpn_dns1": vpn_dns1, "vpn_dns2": vpn_dns2}] };
	$.ajax({
		type:'post',
		url: 'save_vpn_dns/',
		data: JSON.stringify(SendInfo),
		contentType: 'application/json; charset=utf-8',
		dataType: 'text',
		success: function(result){
			//if(result === 'redirectUser') {
			//	 window.location.href = '../connexion'
			//}
		}
	});
}

function Save_auto_Values() {
	var SendInfo = {"SendInfo": [{"conn_type": conn_type, "last_vpn_conf": last_vpn_conf, "log": log, "error_text": state_text}] };
	$.ajax({
		type:'post',
		url: 'save_auto/',
		data: JSON.stringify(SendInfo),
		contentType: 'application/json; charset=utf-8',
		dataType: 'text',
		success: function(result){
			//if(result === 'redirectUser') {
			//	 window.location.href = '../connexion'
			//}
		}
	});
}

//fonction affiche l'heure
function AfficheHeure() {
	dows  = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	mois  = ["january", "februay", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
	sep = ":";
	now          = new Date;
	heure        = now.getHours();
	min          = now.getMinutes();
	sec          = now.getSeconds();
	jour_semaine = dows[now.getDay()];
	jour         = now.getDate();
	mois         = mois[now.getMonth()];
	annee        = now.getFullYear();
	
	if (sec < 10){sec0 = "0";}else{sec0 = "";}
	if (min < 10){min0 = "0";}else{min0 = "";}
	if (heure < 10){heure0 = "0";} else {heure0 = "";}

	if (jour == 1) {jour = jour + "<sup>st</sup> ";}
	else if (jour == 2) {jour = jour + "<sup>nd</sup> ";}
	else {jour = jour + "<sup>th</sup> ";}

	horloge_heure   = heure0 + heure + sep + min0 + min + sep + sec0 + sec;
	horloge_date    = jour_semaine + " " + mois + " " + jour + " " + annee;
	horloge_content = "<div class='horloge_date'>" + horloge_date + "</div><div class='horloge_heure'>" + horloge_heure + "</div>";
	document.getElementById('heure').innerHTML = horloge_content;
    setTimeout(AfficheHeure, 1000)
}

function addNotice(notice) {
	$('<div class="notice"></div>')
	.append('<div class="skin"></div>')
	.append('<a href="#" class="close">close</a>')
	.append($('<div class="content"></div>').html($(notice)))
	.hide()
	.appendTo('#notification')
	.fadeIn(500);

	setTimeout (function() {
		$('#notification')
		.find('.close')
		.closest('.notice')
		.animate({
			border: 'none',
			height: 0,
			marginBottom: 0,
			marginTop: '-6px',
			opacity: 0,
			paddingBottom: 0,
			paddingTop: 0,
			queue: false
		}, 500, function() {
			$(this).remove();
		});
	}, 6000);
}

function connecting() {
	actual_ip = 'wait...';
    actual_country_name = 'wait...';
    actual_country_code = 'null';
}

function loadLog() {
	$.ajax({ 
		type:'get', 
		async: false,
		url: 'read_log/',
		dataType: 'json',
		success: (function(log){
			if (typeof log == 'undefined') {
                return false;
            }else {
            	var concat_log = '';
				for (var i = 0; i < log.length; i++) {
					concat_log = concat_log + log[i];
				}
            	$('#logfile').val(concat_log);
            }
		}),
	});
	//addition
	loadMonitor();
	//
}

//addition monitoring func
function loadMonitor() {
	$.ajax({ 
		type:'get', 
		async: false,
		url: 'read_monitor/',
		dataType: 'json',
		success: (function(data){
			if (typeof data == 'undefined') {
                return false;
            }else {
				eth_ip = data.eth_ip;
				eth_mac = data.eth_mac;
				wlan_mac = data.wlan_mac;
				received_datas = data.received_datas;
				sent_datas = data.sent_datas;
				in_datas = data.in_datas;
				out_datas = data.out_datas;
				int_temp = data.int_temp;
				uptime = data.uptime;
				load_1min = data.load_1min;
				load_5min = data.load_5min;
				load_15min = data.load_15min;
				space_total = data.space_total;
				space_free = data.space_free;
				space_percent = data.space_percent;
				connected_hosts = data.connected_hosts;
				openvpn_ver = data.openvpn_v;
				tor_ver = data.tor_v;
				
				var clients = connected_hosts.split(',');
				var concat_clients = '';
				for (var i = 0; i < clients.length; i = i+3) {
					concat_clients = concat_clients + clients[i+2] + ' - IP ' + clients[i+1] + ' - MAC ' + clients[i] + '<br>';
				}

				$('#eth_ip').html(eth_ip);
				$('#eth_mac').html(eth_mac);
				$('#wlan_ip').html('192.168.' + ap_ip);
				$('#wlan_mac').html(wlan_mac);
				$('#rec_dat').html(received_datas);
				$('#sen_dat').html(sent_datas);
				$('#in_dat').html(in_datas);
				$('#out_dat').html(out_datas);				
				$('#up_tim').html(uptime);
				$('#int_temp').html(int_temp + '°c');
				if (parseFloat(int_temp).toFixed(2) > 60) {$('#int_temp').css('color', 'red');}
				else if (parseFloat(int_temp).toFixed(2) < 50) {$('#int_temp').css('color', 'green');}
				$('#load1').html('1 min: ' + load_1min);
				if (parseFloat(load_1min).toFixed(2) > 1) {$('#load1').css('color', 'red');}
				else if (parseFloat(load_1min).toFixed(2) < 0.5) {$('#load1').css('color', 'green');}
				$('#load5').html('5 min: ' + load_5min);
				if (parseFloat(load_5min).toFixed(2) > 1) {$('#load5').css('color', 'red');}
				else if (parseFloat(load_5min).toFixed(2) < 0.5) {$('#load5').css('color', 'green');}
				$('#load15').html('15 min: ' + load_15min);
				if (parseFloat(load_15min).toFixed(2) > 1) {$('#load15').css('color', 'red');}
				else if (parseFloat(load_15min).toFixed(2) < 0.5) {$('#load15').css('color', 'green');}
				$('#tot_space').html('Total: ' + space_total);
				$('#free_space').html('Free: ' + space_free);
				$('#free_percent').html(space_percent + '% free');
				if (parseFloat(space_percent).toFixed(2) > 90) {$('#free_percent').css('color', 'red');}
				else if (parseFloat(space_percent).toFixed(2) < 50) {$('#free_percent').css('color', 'green');}
				$('#conn_client').html(concat_clients);
				$('#openvpn_ver').html(openvpn_ver);
				$('#tor_ver').html(tor_ver);
            }
		}),
		error: (function() {
			addNotice("<p>Unable to load monitoring datas.</p>");
		}),
	});
}
//end of monitoring func

function initializeConst() {

	$('#show_password').attr('checked', false);

	$('#vpn_dns1, #vpn_dns2, #pays, #ap_ssid_value, #ap_pwd_value, #ap_ip1_value, #ap_ip2_value, #ap_channel_value, #ap_dhcpstart_value, #ap_dhcpend_value, [id^=dns], [id^=host], [id^=mac], [id^=reserved_ip], [id^=route_]').prop('class', 'glowing-border');

	$('#ap_ssid_value').prop({ maxlength: 24, size: 20, title: 'Enter a name (also called SSID) for this access point. Name have to be composed with letters and/or numbers and/or "-" character. The name lenght must have between 5 and 24 characters.' });

	$('#ap_pwd_value').prop({maxlength: 32, size: 27, title: 'Enter a password for this access point (for security reasons, please do not use the default password). The password have to be composed with letters and/or numbers. The password lenght must have between 10 and 32 characters.'});

	$('#ap_ip1_value, #ap_ip2_value, #ap_dhcpstart_value, #ap_dhcpend_value, [id^=reserved_ip]').prop({maxlength: 3, size: 2});

	$('#ap_ip1_value').prop('title', 'Enter a number between 0 and 254 for the third IP address part. The IP will be a part of the access point local ip address. Be carefull to be in a different range from your LAN router or gateway.  Default value: 82');

	$('#ap_ip2_value').prop('title', 'Enter a number between 1 and 254 for the fourth IP address part. The IP will be a part of the access point local ip address. Default value: 254');

	$('#ap_dhcpstart_value').prop('title', 'Enter a number between 1 and 254 for the first DHCP address. This number have to be different from last number of the access point IP. This number have to be lower than DHCP end range number. Default value: 100');

	$('#ap_dhcpend_value').prop('title', 'Enter a number between 1 and 254 for the last DHCP address. This number have to be different from last number of the access point IP. This number have to be higher than DHCP start range number. Default value: 150');

	$('[id^=host]').prop({ maxlength: 24, size: 13, title: 'Enter your host name for a MAC address reservation. It can be your computer name or a generic name such as "Client_1" or "Iphone_phil". Host name have to be composed with letters and/or numbers and/or "-" and/or "_" characters. The host name\'s lenght must have between 5 and 24 characters. Host names form 1 to 5 have to be different each other.' });

	$('[id^=mac]').prop({ maxlength: 17, size: 13, title: 'Enter the MAC address of your hostname. MAC address must be composed with hexadecimal characters formated like : a0:b1:c2:3d:4e:f5. On Windows type "ipconfig" as cmd, "ifconfig" on Linux terminal, to display your MAC address. The MAC address must be composed with 17 characters. MAC address form 1 to 5 have to be different each other.' });

	$('[id^=reserved_ip]').prop('title', 'Enter the fourth IP address part for the MAC reservation. Enter a number between 1 and 254. This number must be different from last number of the Access Point IP.  Number form 1 to 5 have to be different each other.' );
	
	$('[id^=dns]').prop({ maxlength: 15, size: 10, title: 'Enter at least two DNS (IPv4 format). If you don\'t know what it is, leave this field as it is. DNS ip from 1 to 3 have to be different each other.' });

	$('#vpn_dns1, #vpn_dns2').prop({ maxlength: 15, size: 13, title: 'Enter optional DNS (IPv4 format). If you don\'t know what this field means, leave it empty. Note that DNS n°1 and n°2 have to be different each other.' });

	$('[id^=route_reach], [id^=route_gateway]').prop({ maxlength: 15, size: 10, title: 'Enter an IP network you want to reach. If you don\'t know what it is, leave this field as it is.' });
}

// actions
$(document).ready (function(){
	connecting();
	load_settable_Values();
	load_auto_Values();
	$("#myTabs").tabs({active: (conn_type-1)});
	traiteEtAffiche();
	initializeConst();
	AfficheHeure();
});

//bouton 'save'
$('#but_modifier').click(function() {
	ap_ip = ip1.concat('.',ip2);
	//ap_channel = $("#ap_channel_value").val();
	mac_table = [];
	//MAC Hostnames filtering and stocking
	if ( ($("#host1").val() == '' || ( /^[a-zA-Z0-9-_]{5,24}$/.test($("#host1").val()) &&
			$("#host1").val() !== $("#host2").val() &&
			$("#host1").val() !== $("#host3").val() &&
			$("#host1").val() !== $("#host4").val() &&
			$("#host1").val() !== $("#host5").val()
			)) &&
		 ($("#host2").val() == '' || ( /^[a-zA-Z0-9-_]{5,24}$/.test($("#host2").val()) &&
			$("#host2").val() !== $("#host3").val() &&
			$("#host2").val() !== $("#host4").val() &&
			$("#host2").val() !== $("#host5").val()
			)) &&
		 ($("#host3").val() == '' || ( /^[a-zA-Z0-9-_]{5,24}$/.test($("#host3").val()) &&
			$("#host3").val() !== $("#host4").val() &&
			$("#host3").val() !== $("#host5").val()
			)) &&
		 ($("#host4").val() == '' || ( /^[a-zA-Z0-9-_]{5,24}$/.test($("#host4").val()) &&
			$("#host4").val() !== $("#host5").val()
			)) &&		 
		 ($("#host5").val() == '' || /^[a-zA-Z0-9-_]{5,24}$/.test($("#host5").val())) ) {
			mac_table[0] = $("#host1").val();
			mac_table[3] = $("#host2").val();
			mac_table[6] = $("#host3").val();
			mac_table[9] = $("#host4").val();
			mac_table[12] = $("#host5").val();
	}
	else { alert ( 'Please Check MAC Reservation hostnames that must be composed only with letters, numbers and \'-\' or \'_\'. Minimum is 5 characters, maximum is 32 characters. Also, hostnames from 1 to 5 must be different each other.'); return false; }
	//MAC IPs filtering and stocking
	if ( ($("#reserved_ip1").val() == '' || ( /^\d{1,3}$/.test($("#reserved_ip1").val()) && 
			$("#reserved_ip1").val() >= 0 && $("#reserved_ip1").val() <= 254 &&
			$("#reserved_ip1").val() !== $("#reserved_ip2").val() &&
			$("#reserved_ip1").val() !== $("#reserved_ip3").val() &&
			$("#reserved_ip1").val() !== $("#reserved_ip4").val() &&
			$("#reserved_ip1").val() !== $("#reserved_ip5").val()	
			)) &&
		 ($("#reserved_ip2").val() == '' || ( /^\d{1,3}$/.test($("#reserved_ip2").val()) && 
			$("#reserved_ip2").val() >= 0 && $("#reserved_ip2").val() <= 254 &&
			$("#reserved_ip2").val() !== $("#reserved_ip3").val() &&
			$("#reserved_ip2").val() !== $("#reserved_ip4").val() &&
			$("#reserved_ip2").val() !== $("#reserved_ip5").val()
			)) &&
		 ($("#reserved_ip3").val() == '' || ( /^\d{1,3}$/.test($("#reserved_ip3").val()) &&
			$("#reserved_ip3").val() >= 0 && $("#reserved_ip3").val() <= 254 &&
			$("#reserved_ip3").val() !== $("#reserved_ip4").val() &&
			$("#reserved_ip3").val() !== $("#reserved_ip5").val()
			)) &&
		 ($("#reserved_ip4").val() == '' || ( /^\d{1,3}$/.test($("#reserved_ip4").val()) &&
			$("#reserved_ip4").val() >= 0 && $("#reserved_ip4").val() <= 254 &&
			$("#reserved_ip4").val() !== $("#reserved_ip5").val()
			)) &&
		 ($("#reserved_ip5").val() == '' || /^\d{1,3}$/.test($("#reserved_ip5").val())) && 
			$("#reserved_ip5").val() >= 0 && $("#reserved_ip5").val() <= 254 &&
		 ip2 !== $("#reserved_ip1").val() && 
		 ip2 !== $("#reserved_ip2").val() && 
		 ip2 !== $("#reserved_ip3").val() && 
		 ip2 !== $("#reserved_ip4").val() && 
		 ip2 !== $("#reserved_ip5").val() ) {
			mac_table[1] = $("#reserved_ip1").val();
			mac_table[4] = $("#reserved_ip2").val();
			mac_table[7] = $("#reserved_ip3").val();
			mac_table[10] = $("#reserved_ip4").val();
			mac_table[13] = $("#reserved_ip5").val();
	}
	else { alert ( 'Please Check MAC Reservation IP that must be a number between 0 and 254, different from Access Point IP and different each other.'); return false; }
	//MAC macs filtering and stocking
	if ( ($("#mac1").val() == '' || ( /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($("#mac1").val()) &&
			$("#mac1").val() !== $("#mac2").val() &&
			$("#mac1").val() !== $("#mac3").val() &&
			$("#mac1").val() !== $("#mac4").val() &&
			$("#mac1").val() !== $("#mac5").val()
			)) &&
		 ($("#mac2").val() == '' || ( /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($("#mac2").val()) &&
			$("#mac2").val() !== $("#mac3").val() &&
			$("#mac2").val() !== $("#mac4").val() &&
			$("#mac2").val() !== $("#mac5").val()
			)) &&
		 ($("#mac3").val() == '' || ( /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($("#mac3").val()) &&
			$("#mac3").val() !== $("#mac4").val() &&
			$("#mac3").val() !== $("#mac5").val()
			)) &&
		 ($("#mac4").val() == '' || ( /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($("#mac4").val()) &&
			$("#mac4").val() !== $("#mac5").val()
			)) &&		 
		 ($("#mac5").val() == '' || /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($("#mac5").val())) ) {
			mac_table[2] = $("#mac1").val().toLowerCase();
			mac_table[5] = $("#mac2").val().toLowerCase();
			mac_table[8] = $("#mac3").val().toLowerCase();
			mac_table[11] = $("#mac4").val().toLowerCase();
			mac_table[14] = $("#mac5").val().toLowerCase();
	}
	else { alert ( 'Please Check MAC Reservation mac addresses that must be entered in a right format and different each other.'); return false
	}
	
	//DNS ip filtering and stocking
	if ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#dns1").val()) && 
		 ( ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#dns2").val()) && $("#dns2").val() !== $("#dns1").val() && $("#dns2").val() !== $("#dns3").val() ) ) &&
		 ( ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#dns3").val()) && ( $("#dns3").val() !== $("#dns2").val() && $("#dns3").val() !== $("#dns1").val() ) ) || $("#dns3").val() == '' )
		)
	{  	
		dns1 = $("#dns1").val();
		dns2 = $("#dns2").val();
		dns3 = $("#dns3").val();
	}
	else {
		alert ( 'Please Check DNS ip that must be entered in a right format and different each other. You have to enter at least DNS1 and DNS2.'); return false
	}

	//route ip filtering and stocking
	if ( ($("#route_reach1").val() == '')  || (/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#route_reach1").val()) && 
		 ( ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#route_reach2").val()) && $("#route_reach2").val() !== $("#route_reach1").val()) || ($("#route_reach2").val() == '' ))
		))
	{  	
		route_reach1 = $("#route_reach1").val();
		route_reach2 = $("#route_reach2").val();
	}
	else {
		alert ( 'Please Check network to reach ip that must be entered in a right format and different each other.'); return false
	}


	//route gateway filtering and stocking
	if ( ($("#route_gateway1").val() == '')  || (/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#route_gateway1").val()) && 
		 ( ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#route_gateway2").val())) || ($("#route_gateway2").val() == '' ))
		))
	{  	
		route_gateway1 = $("#route_gateway1").val();
		route_gateway2 = $("#route_gateway2").val();
	}
	else {
		alert ( 'Please Check gateway ip that must be entered in a right format.'); return false
	}

	//route mask filtering and stocking
	route_mask1 = $("#route_mask1").val();
	route_mask2 = $("#route_mask2").val();

	$('table').find('#ap_ssid_value, #ap_pwd_value, #ap_ip1_value, #ap_ip2_value, #ap_channel_value, #ap_dhcpstart_value, #ap_dhcpend_value, [id^=host], [id^=mac], [id^=reserved_ip], [id^=dns], [id^=route]').css('background-color', '#f7f7f7');
	$('td').find('#prefix_ip').html('');
	addNotice("<p>Your values have been saved and applied.</p>");
	Save_manual_Values();
});

//bouton Manage VPN config files
$('#but_confVPN').click(function() {
	location.href='../vpn_config';
});

//select_channel_number
$( "#ap_channel_value" ).on('change', function() {
	ap_channel = $("#ap_channel_value").val();
	addNotice("<p>Click Save to change channel.</p>");
});

//select_route mask number
$( "#route_mask1" ).on('change', function() {
	route_mask1 = $("#route_mask1").val();
	addNotice("<p>Click Save to create route.</p>");
});
$( "#route_mask2" ).on('change', function() {
	route_mask2 = $("#route_mask2").val();
	addNotice("<p>Click Save to create route.</p>");
});

//bouton 'apply vpn dns'
$('#but_vpn_dns').click(function() {
	//VPN DNS ip filtering and stocking
		if ( ($("#vpn_dns1").val() == '') && ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#vpn_dns2").val()) )
		)
	{  	
		alert ( 'Enter your VPN DNS in left side field or you can leave both fields blank.'); return false
	}

	if ( (/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#vpn_dns1").val()) || $("#vpn_dns1").val() == '')  && 
		 ( ( /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#vpn_dns2").val()) && $("#vpn_dns2").val() !== $("#vpn_dns1").val()) || $("#vpn_dns2").val() == '' )
		)
	{  	
		vpn_dns1 = $("#vpn_dns1").val();
		vpn_dns2 = $("#vpn_dns2").val();
	}
	else {
		alert ( 'Please Check VPN DNS ip that must be entered in a right format and different each other. You can leave it blank.'); return false
	}
	addNotice("<p>Your values have been saved and applied.</p>");
	Save_vpn_dns();
});	

//bouton supprimer ligne route
$('[id^= but_del_route]').click(function() {
	var valeur = $(this).parents().eq(1).find('[id^=route_reach]').val();
	//var valeur = $(this).parents().eq(1).prop("tagName");
	if ( valeur !== '') {
		$(this).parents().eq(1).find('[id^=route_reach], [id^=route_gateway]').val('');
		$(this).parents().eq(1).find('[id^=route_mask]').val('24');
		$(this).parents().eq(1).find('[id^=route_reach], [id^=route_mask], [id^=route_gateway]').css('background-color', '#f7f7f7');
		//$(this).parents().eq(1).find('[id^=route_reach]').closest(':has(#prefix_ip)').find('#prefix_ip').html('');
		addNotice('<p>Route deleted for host ' + valeur + '. Click Save to apply.</p>');
		
	}
});

//bouton supprimer ligne mac
$('[id^=but_supprimer]').click(function() {
	var valeur = $(this).parents().eq(1).find('[id^=host]').val();
	//var valeur = $(this).parents().eq(1).prop("tagName");
	if ( valeur !== '') {
		$(this).parents().eq(1).find('[id^=host], [id^=reserved_ip], [id^=mac]').val('');
		$(this).parents().eq(1).find('[id^=host], [id^=reserved_ip], [id^=mac]').css('background-color', '#f7f7f7');
		$(this).parents().eq(1).find('[id^=host]').closest(':has(#prefix_ip)').find('#prefix_ip').html('');
		addNotice('<p>MAC Reservation deleted for host ' + valeur + '. Click Save to apply.</p>');
	}
});

//bouton supprimer ligne dns
$('[id^=but_del_dns]').click(function() {
	var valeur = $(this).parents().eq(1).find('[id^=dns]').val();
	//var valeur = $(this).parents().eq(1).prop("tagName");
	if ( valeur !== '') {
		$(this).parents().eq(1).find('[id^=dns]').val('');
		$(this).parents().eq(1).find('[id^=dns]').css('background-color', '#f7f7f7');
		addNotice('<p>DNS ip ' + valeur + ' will be deleted. Click Save to apply.</p>');
		$('#but_del_dns').click();
	}
});

//bouton show ap_password
$('#show_password').on('change', function() {
	if ($(this).is(":checked")) {
		$('.hide').css("visibility", "visible");
	}
	else {
		$('.hide').css("visibility", "hidden");
	}
});

//bouton adblock
$('#ap_adblock').on('change', function() {
	if ($(this).is(":checked")) {
		adblock = 1 ;
		addNotice("<p>Click Save to allow adblock.</p>");
	}
	else {
		adblock = 0;
		addNotice("<p>Click Save to disallow adblock.</p>");
	}
});

//bouton reboot
$('#ap_reboot').on('change', function() {
	if ($(this).is(":checked")) {
		reboot = 1 ;
		addNotice("<p>Click Save to reboot.</p>");
	}
	else {
		reboot = 0;
	}
});

//bouton reset
$('#ap_reset').on('change', function() {
	if ($(this).is(":checked")) {
		reset = 1 ;
		addNotice("<p>Click Save to reboot with factory parameters.</p>");
	}
	else {
		reset = 0;
	}
});

//bouton stop
$('#ap_stop').on('change', function() {
	if ($(this).is(":checked")) {
		stop = 1 ;
		addNotice("<p>Click Save to shutdown.</p>");
	}
	else {
		stop = 0;
	}
});

//select_log_level
$( "#select_log" ).on('change', function() {
	log = $( "#select_log" ).val();
	addNotice("<p>Log have been changed to level " + log + ".</p>");
	Save_auto_Values();
});

//bouton delete_log
$('#but_log').click(function() {
	$.ajax({
        url:"del_log/",
        success: (function(){
            addNotice("<p>Log file have been deleted.</p>");
        }),
        error: (function() {
			addNotice("<p>Unable to delete log file.</p>");
		})
    });
});


//bouton tor-change ip
$('#but_changeip1,#but_changeip2').click(function() {
	$.ajax({
		url:"changeip/",
		success: (function(){
			addNotice("<p>Your exit node will change for a new one.</p>");
		}),
		error: (function(){
			addNotice("<p>Unable to change IP.</p>");
		}),
	});
});

//bouton update adblock list
$('#but_adupdate').click(function() {
	$.ajax({
		url:"adblocklistupdate/",
		success: (function(){
			addNotice("<p>Adblock list updating...</p>");
		}),
		error: (function(){
			addNotice("<p>Unable to update adblock list.</p>");
		}),
	});
});

//bouton direct connect
$('#connexion1').on('change', function() {
	if ($(this).is(":checked")) {
		conn_type = 1 ;
		addNotice("<p>The device will now use the Forward connexion.</p>");
		$('#pays').prop('disabled', false);
		connecting();
		Save_auto_Values();
	}
});

//bouton vpn connect
$('#connexion2').on('change', function() {
	if ($(this).is(":checked")) {
		conn_type = 2 ;
		addNotice("<p>The device will now use the OpenVPN Tunnel.</p>");
		$('#pays').prop('disabled', false);
		connecting();
		Save_auto_Values();
	}
});

//liste des configs vpn
$('#pays').change(function(){ 
    last_vpn_conf = $(this).val();
	addNotice('<p>The OpenVPN configuration file is ' + last_vpn_conf +'</p>');
	connecting();
	Save_auto_Values();	
});

//bouton tor transparent proxy
$('#connexion3').on('change', function() {
	if ($(this).is(":checked")) {
		conn_type = 3 ;
		addNotice("<p>The device will now use the TOR Proxy.</p>");
		$('#pays').prop('disabled', false);
		connecting();
		Save_auto_Values();
	}
});


//bouton tor over openvpn
$('#connexion4').on('change', function() {
	if ($(this).is(":checked")) {
		conn_type = 4 ;
		addNotice("<p>The device will now use OpenVPN to TOR.</p>");
		$('#pays').prop('disabled', true);
		connecting();
		Save_auto_Values();
	}
});

//Events

//mytabs #g(5eme onglet) click event
$('#myTabs').tabs({
	activate: function (event, ui) {
		var $activeTab = $('#myTabs').tabs('option', 'active');
		if ($activeTab == 5) {
			loadLog();
			update_log = setInterval(loadLog, 2000);
		} 
		else {
			clearInterval(update_log)
		}
	}
});

$("#ap_ssid_value")
	.bind("load keyup focus focusout", function() {
		if ( /^[a-zA-Z0-9-]{5,24}$/.test($(this).val())) { 
			$(this).css("background-color","#c9f7b8");
			ap_name = $(this).val();  }
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply new SSID.</p>");
});


$("#ap_pwd_value")
	.bind("load keyup focus focusout", function() {
		if ( /^[a-zA-Z0-9]{10,32}$/.test($(this).val())) { 
			$(this).css("background-color","#c9f7b8");
			ap_wpa = $(this).val();  }
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply new password.</p>");
});

$("#ap_ip1_value")
	.bind("load keyup focus focusout", function() {
		if ( /^[0-9]{1,3}$/.test($(this).val()) && $(this).val() >= 0 && $(this).val() <= 254 ) { 
			$(this).css("background-color","#c9f7b8");
			ip1 = $(this).val();
		}
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$("#ap_ip2_value, #ap_dhcpstart_value, #ap_dhcpend_value")
	.bind("load keyup focus focusout", function() {
		if ( /^[0-9]{1,3}$/.test($(this).val()) && $(this).val() >= 1 && $(this).val() <= 254 ) { 
			if ( parseInt($("#ap_dhcpstart_value").val()) < parseInt($("#ap_dhcpend_value").val()) && 
				 parseInt($('#ap_dhcpstart_value').val()) !=  parseInt($('#ap_ip2_value').val()) && 
				 parseInt($('#ap_dhcpend_value').val()) !=  parseInt($('#ap_ip2_value').val()) ) {

					$(this).css("background-color","#c9f7b8");
					ip2 = $("#ap_ip2_value").val();
					start_dhcp = $("#ap_dhcpstart_value").val();
					end_dhcp = $("#ap_dhcpend_value").val();
			}
			else {
				$(this).css("background-color","#f29999")
			}
		}
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$('[id^=host]')
	.bind("load keyup focus", function() {
		if ( /^[a-zA-Z0-9-_]{5,24}$/.test($(this).val()) ) {
					$(this).css("background-color","#c9f7b8");
					
					//cousin selection
					$(this).closest(':has(#prefix_ip)').find('#prefix_ip').html('192.168.' + ip1 + '.');
		}
		else {
			if ( ($(this).val()) == '') {
				$(this).css('background-color', '#f7f7f7');
			} else {
				$(this).css("background-color","#f29999");
				$(this).closest(':has(#prefix_ip)').find('#prefix_ip').html('');
			}
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$('[id^=mac]')
	.bind("load keyup focus", function() {
		if ( /^[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}:[a-fA-F0-9]{2}$/.test($(this).val()) ) {
					$(this).css("background-color","#c9f7b8");

					//cousin selection
					$(this).closest(':has(#prefix_ip)').find('#prefix_ip').html('192.168.' + ip1 + '.');
		}
		else {
			if ( ($(this).val()) == '') {
				$(this).css('background-color', '#f7f7f7');
			} else {
				$(this).css("background-color","#f29999");
				$(this).closest(':has(#prefix_ip)').find('#prefix_ip').html('');
			}
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$('[id^=reserved_ip]')
	.bind("load keyup focus", function() {
		if ( /^[0-9]{1,3}$/.test($(this).val()) && $(this).val() >= 1 && $(this).val() <= 254  ) {
					$(this).css("background-color","#c9f7b8");

		}
		else {
			if ( ($(this).val()) == '') {
				$(this).css('background-color', '#f7f7f7');
			} else {
				$(this).css("background-color","#f29999");
				//$(this).closest(':has(#prefix_ip)').find('#prefix_ip').html('');
			}
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$('[id^=dns], [id^=route_reach], [id^=route_gateway]')
	.bind("load keyup focus focusout", function() {
		if ( (/^((25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($(this).val())) || $(this).val() == ''  ) { 
			$(this).css("background-color","#c9f7b8");
		}
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click Save to apply change.</p>");
});

$('[id^=vpn_dns]')
	.bind("load keyup focus focusout", function() {
		if ( (/^((25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($(this).val())) || $(this).val() == ''  ) { 
			$(this).css("background-color","#c9f7b8");
		}
		else {
			$(this).css("background-color","#f29999")
		}
	})
	.on('change', function() {
		addNotice("<p>Click \"Apply DNS for VPN\"  to apply change.</p>");
});


})( jQuery );
