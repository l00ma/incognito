(function($){

//boutons en haut à droite
$('#but_profil').click(function() {
	location.href='/profil?param=0';
});
$('#but_logout').click(function() {
	location.href='/deconnexion';
});

$('#but_login').click(function() {
	location.href='/connexion';
});

$("#but_menu").click(function() {
	location.href='/welcome';
});

})( jQuery );