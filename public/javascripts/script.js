$(document).ready(function() {

	$("#registerButton").click(function(){
		var username = $("#registerUsername").val();
		var email = $("#registerEmail").val();
		var password = $("#registerPassword").val();

		if(username.length < 5){
			alert("Your username must be at least 5 character");
		}
		else if(username.length > 15){
			alert("Your username must be at max 15 character");
		}
		else if(!IsEmail(email)){
			alert("Enter a valid email!");
		}
		else if(password.length < 8){
			alert("Your password must be at least 8 character!");
		}
		else{
			$.post("register", {username: username, email: email, password: password}, function(data){
  				if(data.message){
  					alert(data.message);
  				}
  				if(data.redirect){
  					$(location).attr('pathname',data.redirect);
  				}
			}, "json");
		}

		
	});

	$("#loginButton").click(function(){
		var username = $("#loginUsername").val();
		var password = $("#loginPassword").val();
		$.post("login", {username: username, password: password}, function(data){
			if(data.message){
  					alert(data.message);
  			}
  			if(data.redirect){
  				$(location).attr('pathname',data.redirect);
  				$.cookie("username", data.cookiename);
  				$.cookie("password", data.cookiepass);
  			}
		}, "json");
	});

	$("#loginPage").click(function(){
		//$("html").remove();
		$("html").load("/login");
	});


}); 

function IsEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
