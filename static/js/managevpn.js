(function($){

var config_complete_list;

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

function load_vpn_config() {
	$.ajax({ 
		type:'get', 
		async: false,
		url: 'load_vpn_config/',
		dataType: 'json',
		success: (function(data){
			if (typeof data == 'undefined') {
                return false;
            }else {
            	var config_complete_list = data;
				actualise(config_complete_list);
            }
		}),
		error: (function() {
			window.location = "../connexion";
		}),
	});
}

function actualise(data) {
	if (data.length === 0) {
		var addtext = document.getElementById("info_vpn");
		$('#info_vpn').append('<p id=\'deconnect\'>No config file find. Upload files above!!</p>');
	}
	else{
		$('#tableau_vpn').append('<th>Config file</th><th>select</th>')
		for (var i = 0; i < data.length; i++) {
	    	var txtVpn = data[i];
	    	//Do something
	    	var newTr = '<tr><td class=\'glowing-border\'>' + txtVpn + '</td><td><input type="checkbox" value="'+ txtVpn + '"></td></tr>';
	    	$('#tableau_vpn').append(newTr);
		}
		$('#controls_vpn').append('<button id="but_selectall_vpn_conf">Select all</button><div class="divider"/><button id="but_selectnone_vpn_conf">Select none</button><div class="divider"/><button id="but_delete_vpn_conf">Delete selected</button>');
		//boutons
		//action button tout selectionner
		$('#but_selectall_vpn_conf').click(function() {
			$('#tableau_vpn td').find('input:checkbox').prop('checked', true);
		});
		//action button tout dÃ©selectionner
		$('#but_selectnone_vpn_conf').click(function() {
			$('#tableau_vpn td').find('input:checkbox').prop('checked', false);       
		});
		//fonction supprimer
		$('#but_delete_vpn_conf').on('click', function() {
			var checked_values = [];
			//on stock le nom des videos cochées dans le tableau checked_values
			$('#tableau_vpn td').find(":checked").each(function () {
				//var $this = $(this);
				var id_nb = $(this).val();
				checked_values.push(id_nb);
			});
			//si le tableau checked_values contient au moins une video, on l'efface.
			if (checked_values.length > 0) {
				if (checked_values.length === 1) {
					var response = confirm ('Delete this file ?');
					if (response == false) 
						return;
				}
				else {
					var response = confirm ('Delete ' + checked_values.length + ' files ?');
					if (response == false) 
						return;
				}
			
				//checked_values = checked_values.toString();

				$.ajax({ 
					type:'post',
					async: false,
					url: '../vpn_config/delete_vpn_config/',
					data: JSON.stringify(checked_values),
					success: function(result){
						if (result !== 'OK') {alert ('Unable to delete. An error occurs!!');}
						else {window.location.href = '../vpn_config';}
					}
				});
				//window.location.href = '../vpn_config/load_vpn_config/';
			}
			//si le tableau checked_values ne contient aucune video, on avertit l'utilisateur et on quitte
			else {
				alert ('Select a file to delete.');
			}
		});

		}
}

// actions
$(document).ready (function(){
	load_vpn_config();
});


})( jQuery );