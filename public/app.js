$(document).on("click", ".scrape", function() {
  $.get(`/scrape`, data => {
    location.href = "/articles";
  });
});

$(document).on("click", ".note", function() {
  let articleId = $(this).data("id");
  let articleName = $(this).data("title");
  $(".title").text(articleName);
  $("button.buttonID").data("articleId", articleId);
  $("button.buttonID").data("articleName", articleName);
  $("#noteModal").modal("show");
});

$(document).on("click", ".update", function() {
  let noteId = $(this).data("id");
  let noteTitle = $(this).data("title");
  let noteBody = $(this).data("body");
  $("button.updateButton").data("noteId", noteId);
  $(".modalTitleInput").attr("placeholder", noteTitle);
  $(".modalBodyInput").attr("placeholder", noteBody);
  $("#updateModal").modal("show");
});

$(document).on("click", ".buttonID", function() {
  let articleId = $(this).data("articleId");
  let articleName = $(this).data("articleName");
  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: {
      articleName: articleName,
      title: $("#modalTitle").val(),
      body: $("#modalBody").val()
    }
  }).then(data => console.log("Created new Note"));
});

$(document).on("click", ".updateButton", function() {
  let noteId = $(this).data("noteId");
  $.ajax({
    method: "PUT",
    url: "/notes/" + noteId,
    data: {
      title: $("#modalTitle").val(),
      body: $("#modalBody").val()
    }
  }).then(data => console.log("Note Successfully Updated"));
});

$(document).on("click", ".view", function() {
  let articleId = $(this).data("id");
  location.href = "/articles/" + articleId;
});

$(document).on("click", ".delete", function() {
  let noteId = $(this).data("id");
  $.ajax({
    method: "DELETE",
    url: "/notes/" + noteId
  }).then(data => {
    console.log("Note Successfully Deleted");
    location.reload();
  });
});
