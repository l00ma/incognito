(function($){

function initializeConst() {
	$('#usr_id, #usr_email, #usr_pwd1, #usr_pwd2').prop('class', 'glowing-border');
	$('#usr_id').prop({maxlength: 32, size: 27, title: 'Username must be at least 4 characters long, may contain only digits, upper and lower case letters and underscores'} );
	$('#usr_email').prop({maxlength: 32, size: 27, title: 'Email must have a valid email format'});
	$('#usr_pwd1').prop({maxlength: 32, size: 27, title: 'Password must be at least 6 characters long, and must contain at least one upper case letter (A..Z), at least one lower case letter (a..z) and at least one number (0..9)'});
	$('#usr_pwd2').prop({maxlength: 32, size: 27, title: 'Retype your password. Your password and confirmation must match exactly'});
}

$(document).ready (function(){
	initializeConst();
});



$("#usr_id").bind("load keyup focus focusout", function() {
	if ( /^[a-zA-Z0-9_]{4,24}$/.test($(this).val())) { 
		$(this).css("background-color","#c9f7b8");
	}
	else {
		$(this).css("background-color","#f29999")
	}
});

$("#usr_email").bind("load keyup focus focusout", function() {
	if ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($(this).val())) { 
		$(this).css("background-color","#c9f7b8");
	}
	else {
		$(this).css("background-color","#f29999")
	}
});

$("#usr_pwd1, #usr_pwd2").bind("load keyup focus focusout", function() {
	if ( /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{6,16}$/.test($(this).val())) { 
		$(this).css("background-color","#c9f7b8");
	}
	else {
		$(this).css("background-color","#f29999")
	}
});

})( jQuery );