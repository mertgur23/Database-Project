$(document).ready(function() {

  $("#registerButton").click(function() {
    var username = $("#registerUsername").val();
    var email = $("#registerEmail").val();
    var password = $("#registerPassword").val();

    if (username.length < 5) {
      alert("Your username must be at least 5 character");
    } else if (username.length > 15) {
      alert("Your username must be at max 15 character");
    } else if (!IsEmail(email)) {
      alert("Enter a valid email!");
    } else if (password.length < 8) {
      alert("Your password must be at least 8 character!");
    } else {
      $.post("register", {
        username: username,
        email: email,
        password: password
      }, function(data) {
        if (data.message) {
          alert(data.message);
        }
        if (data.redirect) {
          $(location).attr('pathname', data.redirect);
        }
      }, "json");
    }
  });

  $("#loginButton").click(function() {
    var username = $("#loginUsername").val();
    var password = $("#loginPassword").val();
    $.post("login", {
      username: username,
      password: password
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });


  $("#favouriteQuestion").click(function() {
    var qId = $(location).attr('pathname').split(':');
    $.post("favourite", {
      post_id: qId[1]
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });

  $("#unfavouriteQuestion").click(function() {
    var qId = $(location).attr('pathname').split(':');
    $.post("unfavourite", {
      post_id: qId[1]
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });

  $("#askQuestionButton").click(function() {
    var title = $("#questionTitle").val();
    var text = $("#questionText").val();
    var tags = $("#tags-area").val();
    var splittedTags = tags.split(" ");
    if (title.length < 5) {
      alert("Title must be at least 5 character");
    } else if (text < 20) {
      alert("Question must be at least 20 character");
    } else if (tags.length == 0) {
      alert("Please enter at least one tag");
    } else if (splittedTags.length > 5) {
      alert("You can give at most 5 tags");
    } else {
      var duplicate = 0;
      for(var i = 0; i < splittedTags.length - 1; i++)
      {
        for(var j = i + 1; j < splittedTags.length; j++)
        {
          if(splittedTags[i] == splittedTags[j])
          {
            duplicate = 1;
            break;
          }
        }
      }
      if(duplicate == 0)
      {
        $.post("askQuestion", {
          title: title,
          text: text,
          tags: tags
        }, function(data) {
          if (data.message) {
            alert(data.message);
          }
          if (data.redirect) {
            $(location).attr('pathname', data.redirect);
          }
        }, "json");
      }
      else
        alert("Do not provide same tags");
    }
  });


  $("#submitAnswer").click(function() {
    var qId = $(location).attr('pathname').split(':');
    var answer = $("#answer").val();
    if (answer.length < 10) {
      alert("Answer must be at least 10 character");
    } else {
      $.post("answerQuestion", {
        answer: answer,
        qId: qId[1]
      }, function(data) {
        if (data.message) {
          alert(data.message);
        }
        if (data.redirect) {
          $(location).attr('pathname', data.redirect);
        }
      }, "json");
    }
  });

  $(".add-comment-button").click(function() {
    $("#myModal").attr("data-postid", $(this).attr("data-postid"));
    $("#myModal").modal('show');
  });


  $("#enterCommand").click(function() {
    var postId = $("#myModal").attr("data-postid");
    var comment = $("#comment").val();
    if (comment.length < 10) {
      alert("Comment must be at least 10 character");
    } else {
      $.post("commentPost", {
        comment: comment,
        postId: postId
      }, function(data) {
        window.location.reload(true);
      }, "json");
    }
  });

  $(".upvoteButton").click(function() {
    var postId = $(this).attr("data-post_id");
    $.post("upvote", {
      postId: postId
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });

  $(".downvoteButton").click(function() {
    var postId = $(this).attr("data-post_id");
    $.post("downvote", {
      postId: postId
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });

  $(".answerSelect").click(function() {
    var postId = $(this).attr("data-post_id");
    $.post("acceptAnswer", {
      postId: postId
    }, function(data) {
      if (data.message) {
        alert(data.message);
      }
      if (data.redirect) {
        $(location).attr('pathname', data.redirect);
      }
    }, "json");
  });

  $(".dropdown-menu li").click(function() {
    var cat = $(this).text();
    $(this).parents(".input-group-btn").find('.btn').text(cat);
    $.post("getTag", {
      cat: cat
    }, function(data) {
      if (data.tags) {
        var total_tags = [];
        for (var i = 0; i < data.tags.length; i++) {
          total_tags.push(data.tags[i].name);
        }
        $("#tags_available").text(total_tags);
      }
    }, "json");
  });

  $("#dropdown-menu2 li").click(function() {
    var cat = $(this).text();
    $(this).parents(".input-group-btn2").find('.btn').text(cat);
    $.post("getTag", {
      cat: cat
    }, function(data) {
      if (data.tags) {
        var total_tags = [];
        for (var i = 0; i < data.tags.length; i++) {
          total_tags.push(data.tags[i].name);
        }
        $("#tags_available2").text(total_tags);
      }
    }, "json");
  });

  $("#followTags").click(function() {
    var tags = $("#tags-area2").val();
    if (tags.length == 0)
      alert("Please enter at least one tag to follow");
    else {
      var splittedTags = tags.split(" ");
      var duplicate = 0;
      for(var i = 0; i < splittedTags.length - 1; i++)
      {
        for(var j = i + 1; j < splittedTags.length; j++)
        {
          if(splittedTags[i] == splittedTags[j])
          {
            duplicate = 1;
            break;
          }
        }
      }
      if(duplicate == 0)
      {
        $.post("followTag", {
          tags: tags
        }, function(data) {
          if (data.message) {
            alert(data.message);
          }
          if (data.redirect) {
            $(location).attr('pathname', data.redirect);
          }
        }, "json");
      }
      else
        alert("Do not provide same tags"); 
    }
  });

  $("#addTags").click(function() {
    var tags = $("#tags-area3").val();
    var category = $("#dropdown-menu2 li").parents(".input-group-btn2").find('.btn').text();
    if (category == "Categories")
      alert("Please select a category to add tag");
    else if (tags.length == 0)
      alert("Please enter at least one tag to add");
    else {
      var splittedTags = tags.split(" ");
      var duplicate = 0;
      for(var i = 0; i < splittedTags.length - 1; i++)
      {
        for(var j = i + 1; j < splittedTags.length; j++)
        {
          if(splittedTags[i] == splittedTags[j])
          {
            duplicate = 1;
            break;
          }
        }
      }
      if(duplicate == 0)
      {
        $.post("addTag", {
          tags: tags,
          category: category
        }, function(data) {
          if (data.message) {
            alert(data.message);
          }
          if (data.redirect) {
            $(location).attr('pathname', data.redirect);
          }
        }, "json");
      }
      else
        alert("Do not provide same tags");
    }
  });
  $('#search-area').keypress(function(e) {
    var searchText = $(this).val();
    var key = e.which;
    if (key == 13) // the enter key code
    {
      e.preventDefault();
      $.ajax({
        url: "search",
        type: "POST",
        data: {
          searchText: searchText
        },
        success: function(data) {
          console.log(data);
          document.open();
          document.write(data);
          document.close();
        }
      });
    }
  });

  $(".delete-button").click(function() {
    var postId = $(this).attr("data-post_id");
    $.post("deletePost", {
      postId: postId
    }, function(data) {
      window.location.reload(true);
    });
  });

  $(".delete-button-question").click(function() {
    var postId = $(this).attr("data-post_id");
    $.post("deletePost", {
      postId: postId
    }, function(data) {
      $(location).attr('pathname', "/");
    });
  });

});

function IsEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
