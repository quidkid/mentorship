// getResult is a function that takes a string keyword to include in the baseurl and
// a callBack function that will manipulate the result. 
// callBack must be a function that takes in a result.
function getResult (keyword, callBack) {
	var baseurl = "http://api.penncoursereview.com/v1/";
  var token = "?token=N6eYUxRT1ulnSlXL2Dspm2YHcbFIU2";

  var url = baseurl + keyword + token;
  $.getJSON (url, function(response) { 
  	callBack(response.result);
  });

}




$( document ).ready(function(){
  // getResult is taking in a "depts" keyword to built the dept request url
  // 
  getResult ("depts", function (result) {
   	for (var i = 0; i < result.values.length; i++)
    {
      if (result.values[i].name == "")
      // in the case that there is no name, use course id
        result.values[i].name = result.values[i].id;

      $("#depts").append('<option value="' + result.values[i].id + '">' 
        + result.values[i].name + '</option>');
    }
    $("#depts").prop("selectedIndex", -1);

   });
  // getRatings is a function that takes in a name and a path and uses getResult to make a query by sending the callback
  // callback is a function that takes in a string name and a reviews object
  function getRatings (name, id, path, callback){
    getResult(path + "/reviews", function(reviews){
      callback(name, id, reviews);
    });
  }
   
   // eventually, i want to return the easiest class for a selected department
  $("#depts").change(function(){
    $("#easiest").html("<img src='loader.gif' alt='loading...' width='42' height='42'>");
    // a variable dept stores the selected department value
    var dept = $('#depts option:selected').val();
    getResult("depts/" + dept, function(result) {
      // Iterate through the array of coursehistories of the dept
      
      var getRatingscounter = 0;
      var easiestCourses = [];
      for (var i = 0; i < result.coursehistories.length; i++)
      {
        // Using the getRatings function, take in the ith element of the array's name and path and a function that
        // manipulates parameters of the string name and the reviews object
        // we had to make getRatings its own function as a workaround of the 
        //asynchronous issue where the i would change
        
        getRatings(result.coursehistories[i].name, result.coursehistories[i].aliases[0],result.coursehistories[i].path, function (name, id, reviews){
          
          getRatingscounter++;
          var total = 0;
          var counter = 0;
          for (var k = 0; k < reviews.values.length; k++) {
            if (reviews.values[k].ratings.rDifficulty != undefined) {
                var rDifficultyval = parseFloat(reviews.values[k].ratings.rDifficulty);
                total = total + rDifficultyval;
                counter = counter + 1;
            }


          }

          var avg = total / counter;
          
          var course = {name: name, id: id, difficulty: avg};

          easiestCourses.push(course);
         
          if (getRatingscounter == result.coursehistories.length) {
            finish(easiestCourses);
           // $("#easiest").html("You should take " + smallestCourse + ", with the course id " + smallestID + " as it has a difficulty of " + smallestAvg);
          }

          
        });
      }

      
    })
  })
  // finish is a function that takes in a list called easiestCourses
  function finish (easiestCourses) {
    // -1 means a is less difficult
    easiestCourses.sort(function(a,b) {
      var ad = a.difficulty;
      var bd = b.difficulty;
      if (isNaN(ad) && isNaN(bd)) {return 0};
      if (isNaN(ad)) {return 1};
      if (isNaN(bd)) {return -1};

      return a.difficulty - b.difficulty});
    console.log(easiestCourses.map(function (a) {return a.difficulty}));
    var html = "";
    for (var i = 0; i < easiestCourses.length; i++) {
      html = html + "<p>" + easiestCourses[i].name + " " + easiestCourses[i].difficulty + " " + easiestCourses[i].id + "</p>";
    }
    $("#easiest").html(html);
  }
})

