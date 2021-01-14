var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//Firebase
var firebase = require("firebase");
var config = {
    apiKey: "AIzaSyC_H-AOZdn5-EHDJZB0l8GIL02agno97-w",
    authDomain: "yourpassion-a1364.firebaseapp.com",
    databaseURL: "https://yourpassion-a1364.firebaseio.com",
    projectId: "yourpassion-a1364",
    storageBucket: "",
    messagingSenderId: "608079507689"
};
firebase.initializeApp(config);
var ref = firebase.database().ref("Users");

//Firebase
app.get('/insert', function(req, res) {
    var refTopic = firebase.database().ref("Topics");
	
	refTopic.child("dance").set({
		Post:"first"
	});
	res.send("done");

});

//Main website

//Logcheck
app.post("/display/feed",function(req,res){
	firebase.auth().onAuthStateChanged(function(user){
		if(user)
		{
			// User is signed in.
			var emailVerified = user.emailVerified;
			var uid = user.uid;
			var postArray = [];

			if(emailVerified)
			{
				
				firebase.database().ref("Topics").child("dance").child("Post").on("value",function(snapshot){
					postArray = snapshot.val();
					//console.log(postArray);
				});
				
				res.status(200).render('feed',{post:postArray});
			}
			else
			{
				res.status(401).send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
			}
			
		} 
		else 
		{
			// User is signed out.
			res.redirect("/");
		}
	});

});


app.post("/findpeople",function(req,res){
	firebase.auth().onAuthStateChanged(function(user){
		res.setHeader('Content-Type', 'text/html');
		if(user)
		{
			// User is signed in.
			var emailVerified = user.emailVerified;
			var uid = user.uid;
			var x1=0;
			var y1=0;
			var coord = [];
			var r = 10;

			firebase.database().ref("Users").child(uid).child("location").on("value",function(snap){
				coord = snap.val();
			});
			
			x1 = coord.lat;
			y1 = coord.long;
			var j=0;

			if(emailVerified)
			{
				var keyArray = [];
				var userArray = [];
				firebase.database().ref("Users").on("value",function(snap){

					for(var i in snap.val())
					{
						var x = snap.val()[i]["location"].lat;
						var y = snap.val()[i]["location"].long;

						var cx = Math.pow((x-x1),2);
						var cy = Math.pow((y-y1),2);
						var radius = r*r;
						
						// console.log("Coordinate");
						// console.log(cx);
						// console.log(cy);

						var circle = cx+cy;
						if(circle < radius)
						{
							userArray[j] = snap.val()[i].name;

							j++;
						}
					}
				});

				res.status(200).render('findpeople',{user:userArray});
			}
			else
			{
				res.status(401).send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
			}
		} 
		else 
		{
			// User is signed out.
			res.redirect("/");
		}
	});

});

app.get("/home/feed",function(req,res){
	firebase.auth().onAuthStateChanged(function(user){
		res.setHeader('Content-Type', 'text/html');
  		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		if(user)
		{
			// User is signed in.
			var emailVerified = user.emailVerified;
			var uid = user.uid;

			if(emailVerified)
			{
				var userArray = [];
				var postArray = [];
				
				ref.child(uid).on("value",function(snap){
					userArray = snap.val();
					//console.log(userArray);
				});



				firebase.database().ref("Topics").child("dance").child("Post").orderByKey().on("value",function(snapshot){
					postArray = snapshot.val();
					//console.log(postArray);
				});
				
				res.status(200).render('home',{
		            user: JSON.stringify(userArray, null, 4),
               		post: JSON.stringify(postArray, null, 4)

				});
			}
			else
			{
				res.status(401).send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
			}
			
		} 
		else 
		{
			// User is signed out.
			res.redirect("/");
		}
	});

});

app.get("/interest",function(req,res){
	firebase.auth().onAuthStateChanged(function(user){
		if(user)
		{
			// User is signed in.
			var emailVerified = user.emailVerified;
			var uid = user.uid;

			// var topicRef = firebase.database().ref("Topics");
			// var interestList = [];
			// var index=0;
			// topicRef.on("value",function(snap){
			// 	for(var i in snap.val())
			// 	{
			// 		interestList[index] = snap.val()[i];
			// 		index++;
			// 	}
			// });

			var userInterest = [];
			firebase.database().ref("Users").child("interests").on("value",function(snapshot){
				userInterest = snapshot.val();
			});
			
			res.status(200).render('interest',{userInterest:userInterest});
		}
		else
		{
			res.status(401).send('<span style="font-weight:bold;color:red">Access Denied</span>');
		}
	});

});

app.post("/add/interest",function(req,res){

});

//Main Index
app.get('/', function(req, res) {
    res.render("index");

});


//Home
app.get("/home",function(req,res){
	res.status = 200;
	res.send("<meta http-equiv=\"refresh\" content=\"0; url=/home/feed\">");

});

//Question
app.get("/question",function(req,res){
	res.render("question");

});

//Post Submit
app.post("/post/submit",function(req,res){

	var postData = req.body.post;
	var postCategory = req.body.category;
	if (postData=="")
	{
		res.send('<span style="color:red;font-weight:bold;">Do not leave it blank</span>');
	}
	else
	{
		firebase.auth().onAuthStateChanged(function(user){
			if(user)
			{
				// User is signed in.
				var emailVerified = user.emailVerified;
				var uid = user.uid;

				if(emailVerified)
				{
					var videoId = "";
					var status="";
					var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
					var match = postData.match(regExp);
					if (match && match[2].length == 11)
					{
					    videoId =  match[2];
					    status="video";
					}
					else 
					{
					    status="text";
					}
					
					var refPost = firebase.database().ref("Topics").child(postCategory).child("Post");

					refPost.push({
						post_data:postData,
						post_by:uid,
						status:status,
						videoId:videoId
					});
					res.send('<span style="font-weight:bold;color:green">Successfully Posted</span>');
				}
				else
				{
					res.status(401).send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
				}
				
			} 
			else 
			{
				// User is signed out.
				res.redirect("/");
			}
		});
	}

	
});

//Filter
app.post("/filter/post",function(req,res){

	var distance = req.body.distance;
	var category = req.body.category;
	firebase.auth().onAuthStateChanged(function(user){
		if(user)
		{
			// User is signed in.
			var emailVerified = user.emailVerified;
			var uid = user.uid;

			if(emailVerified)
			{
				var x1=0;
				var y1=0;
				var coord = [];
				var userCoord = [];
				var r = distance;
				var index=0;
				var postList = [];

				ref.child(uid).child("location").on("value",function(snap){
					coord = snap.val();
				});
			
				x1 = coord.lat;
				y1 = coord.long;

				firebase.database().ref("Topics").child(category).child("Post").on("value",function(snap){
					for(var i in snap.val())
					{
						var userId = snap.val()[i].post_by;
						ref.child(userId).child("location").on("value",function(snapshot){
							userCoord = snapshot.val();
						});
						
						//console.log(userId);

						x = userCoord.lat;
						y = userCoord.long;
						var cx = Math.pow((x-x1),2);
						var cy = Math.pow((y-y1),2);
						var radius = r*r;
						

						// console.log("Coordinate");
						// console.log(cx);
						//console.log(cy);

						var circle = cx+cy;
						if(circle < radius)
						{
							postList[index] = snap.val()[i];
							index++;
						}
					}
				});
				
				res.render('filter',{

					postList: JSON.stringify(postList, null, 4)

				});
				//console.log(postList);
			}
			else
			{
				res.status(401).send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
			}
			
		} 
		else 
		{
			// User is signed out.
			res.redirect("/");
		}
	});

	
});


//Get Location
app.post("/get/location",function(req,res){

	var long = req.body.long;
	var lat = req.body.lat;
	
	// if(typeof(long)=='number' && typeof(lat)=='number')
	// {
		firebase.auth().onAuthStateChanged(function(user){
			if(user)
			{
				// User is signed in.
				var emailVerified = user.emailVerified;
				var uid = user.uid;
				if(emailVerified)
				{
					var refLoc = firebase.database().ref("Users").child(uid).child("location");
					refLoc.update({
						long:long,
						lat:lat
					});
					res.status(200);
				}
				else
				{
					res.status(401);
				}
				
			} 
			else 
			{
				// User is signed out.
				res.redirect("/");
			}
		});

	// }
	// else 
	// {
	// 	res.send('<span style="color:red;font-weight:bold;">Locations are not valid</span>');
	// }
});


//Account Register
app.post("/register",function(req,res){
	var email = req.body.email;
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.pass;
	var gender = req.body.gender;
	if (/\s/g.test(username))
	{
		res.send('<span style="color:red;font-weight:bold;">Don\'t provide spaces in your username.</span>');
	}
	else if(/\W/g.test(username))
	{
		res.send('<span style="color:red;font-weight:bold;">You can\'t use special characters in username.</span>');
	}
	else
	{
		firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
			var uid = user.uid;
			ref.child(uid).set({
				name:name,
				email:email,
				username:username,
				uid:uid,
				gender:gender,
				location:{
					long:0,
					lat:0
				},
				interest:{
					art:0,
					dance:0,
					knowledge:0,
					music:0,
					sports:0,
					technology:0
				}
			});
			var user = firebase.auth().currentUser;
			user.sendEmailVerification().then(function() {
		  		res.send('<span style="font-weight:bold;color:green">User is registered successfully<br>Verification email is sent in your email</span>');
			}).catch(function(error) {
				res.send('<span style="font-weight:bold;color:green">User is registered successfully<br>Problem in sending verification email</span>');
			});
		}).catch(function(error) {
			console.log(error.code);
			console.log(error.message);
			res.send('<span style="font-weight:bold;color:red">'+error.message+'</span>');
		});
		
	}

});





app.post("/signin",function(req,res){
	var email = req.body.logemail;
	var password = req.body.logpass;
	firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
		firebase.auth().onAuthStateChanged(function(user){
			var emailVerified = user.emailVerified;
			if(emailVerified)
			{
				res.send("<meta http-equiv=\"refresh\" content=\"0; url=/home/feed\">");
				res.send("true");
			}
			else
			{
				res.send('<span style="font-weight:bold;color:red">It seems you have not verified your email.We have sent you verification link.</span>');
			} 

		});
	}).catch(function(error){
		var errorCode = error.code;
		var errorMessage = error.message;
		res.send('<span style="font-weight:bold;color:red">'+errorMessage+'</span>');
	});


});

//Logout
app.post('/logout',function(req,res){
	firebase.auth().signOut().then(function() {
	// Sign-out successful.
		res.send("true");
	}).catch(function(error) {
	// An error happened.
		res.send("false");
	});

});

var server = app.listen(8000,function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("App is running");
});
