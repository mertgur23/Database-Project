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
  			}
		}, "json");
	});
	
	$("#askQuestionButton").click(function(){
		var title = $("#questionTitle").val();
		var text = $("#questionText").val();
		var tags = $("#tags-area").val();
		//var splittedTags = tags.split(" ");
		alert(tags);
		if(title.length < 5){
			alert("Title must be at least 5 character");
		}
		else if(text < 20){
			alert("Question must be at least 20 character");
		}
		else{
			$.post("askQuestion", {title: title, text: text, tags: tags}, function(data){
				if(data.message){
	  					alert(data.message);
	  			}
	  			if(data.redirect){
	  				$(location).attr('pathname',data.redirect);
	  			}
			}, "json");
		}
	});

	$("#submitAnswer").click(function(){
		var qId = $(location).attr('pathname').split(':');
		var answer = $("#answer").val();
		if(answer.length < 10){
			alert("Answer must be at least 10 character");
		}
		else{
			$.post("answerQuestion", {answer: answer, qId : qId[1]}, function(data){
				if(data.message){
	  					alert(data.message);
	  			}
	  			if(data.redirect){
	  				$(location).attr('pathname',data.redirect);
	  			}
			}, "json");
		}
	});

	$(".dropdown-menu li").click(function(){
		var cat = $(this).text();
	  	$(this).parents(".input-group-btn").find('.btn').text(cat);
	  	$.post("getTag", {cat: cat}, function(data){
	  		if(data.tags)
	  		{
	  			var total_tags =[];
	  			for(var i = 0; i < data.tags.length; i++)
	  			{
	  				total_tags.push(data.tags[i].name);
	  			}
	  			$("#tags_available").text(total_tags);
	  		}
	  	}, "json");
	});
}); 

function IsEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
