// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });
$(document).on("click", ".comment-btn", function () {

  $(".modal").modal();
  $(".modal").modal("open");
   $(".modal_content").empty();

  var id=$(this).attr("data-id");
  console.log(id)
   // Now make an ajax call for the Article
   $.ajax({
    method: "GET",
    url: "/articles/" + id
  })
    // With that done, add the note information to the page
    .then(function(data) {
        // If there's a note in the article
      
      console.log(data);
        var ul=$("<ul>");
        $(".modal-content").empty();
  for (var i=0; i<data.note.length;i++){

    var li=$("<li>")
     var h4=$("<h4>").html(data.note[i].title)
     var paragraph = $("<p>").html(data.note[i].body)
     var btn=$("<button>").html("X")


     btn.addClass("delete-comment");
     btn.attr("data-noteId",data.note[i]._id);
     btn.attr("data-ArticleId",data._id)
     li.append(h4,paragraph,btn);
  ul.append(li)
    $(".modal-content").append(ul);
  }

      // The title of the article
      $(".modal-content").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $(".modal-content").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $(".modal-content").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $(".modal-content").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
    
    });
});

$(document).on("click", ".delete-comment", function () {
  var articleId = $(this).attr("data-ArticleId");
  var id = $(this).attr("data-noteId")
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      url: "/deletecomment/" + articleId + "/" + id,
      type: "DELETE"

    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
   
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
  $('.modal').modal('close');
})






// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section

    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
  $('.modal').modal('close');
});


$(".save-article-btn").on("click", function (id) {
  console.log($(this).attr("data-id"))
  id = $(this).attr("data-id")
  console.log(id)
  $.ajax({
    url: "saved/" + id,
    type: "PUT"
  });
  location.reload();

})

$(".delete-article-btn").on("click", function (id) {
  console.log($(this).attr("data-id"))
  id = $(this).attr("data-id")
  console.log(id)
  $.ajax({
    url: "delete/" + id,
    type: "DELETE"
  });
  location.reload();
})