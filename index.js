var express = require("express");
var cookieParser = require('cookie-parser');
var http = require ('http');
var mongoose = require ("mongoose");
var app = express();
var modelObj = require('./models')(mongoose);

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var url = "mongodb://localhost:27017/passion";
mongoose.connect(url);


//Index
app.get('/', function(req, res) {
	
	res.render("index");

});

//Rendering User Details Home
app.get("/home/feed",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["email"])
	{
		var uid = req.cookies["uid"];
		var email = req.cookies["email"];
		
		modelObj.Users.find({'_id':uid,'email':email},'name',function(userErr,userResp){
			if (userErr) throw userErr;

			res.render('home',{user:userResp});

		});
			
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});


//Home
app.get("/home",function(req,res){

	res.send("<meta http-equiv=\"refresh\" content=\"0; url=/home/feed\">");

});

//Rendering category list and User interest list
app.get("/interest",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["email"])
	{
		var uid = req.cookies["uid"];
		var email = req.cookies["email"];	

		modelObj.Category.find({},function(catErr,catResp){
			if(catErr) throw catErr;

			modelObj.Interests.find({userId:uid},function(userErr,userResp){
				if (userErr) throw userErr;

				res.render('interest',{category:catResp,interest:userResp});

			});

		});

	}
	else 
	{
		// User is signed out.
		res.redirect("/");
	}
		
});

//Add User Interests
app.post("/add/interest",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["email"])
	{

		var uid = req.cookies["uid"];
		var email = req.cookies["email"];

		var interestData = req.body.interestData;
		var interestId;

		modelObj.Category.find({'categoryData':interestData},'_id',function(catErr,catResp){
			if (catErr) throw catErr;

			interestId = catResp[0]._id;
			var queryObj = {
				interestId:interestId,
				userId:uid,
				interestData:interestData
			};

			modelObj.Interests.count(queryObj,function(err,resp){
				if(err) throw err;

				if(resp=="0")
				{
					var userInterestData = new modelObj.Interests(queryObj);
					userInterestData.save(function(userErr,userResp){
						if(userErr) throw userErr;
						
						if(userResp)
						{
							res.send('<span style="font-weight:bold;color:green">Done Succesfully');	
						}
						else
						{
							res.send('<span style="font-weight:bold;color:red">Server error! Check your internet connection</span>');
						}

					});
				}

			});


		});

		
	}
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});

//Remove User Interests
app.post("/remove/interest",function(req,res){

	if(req.cookies["uid"] && req.cookies["email"])
	{

		var uid = req.cookies["uid"];
		var email = req.cookies["email"];
		var interestId;
		var interestData = req.body.interestData;

		modelObj.Category.find({'categoryData':interestData},'_id',function(catErr,catResp){
			if (catErr) throw catErr;

			interestId = catResp[0]._id;
			var queryObj = {
				interestId:interestId,
				userId:uid,
				interestData:interestData
			};

			modelObj.Interests.remove(queryObj,function(userErr,userResp){
			if(userErr) throw userErr;
			
				if(userResp)
				{
					res.send('<span style="font-weight:bold;color:green">Done Succesfully');	
				}
				else
				{
					res.send('<span style="font-weight:bold;color:red">Server error! Check your internet connection</span>');
				}

			});


		});
		
	}
	else 
	{
		// User is signed out.
		res.redirect("/");
	}
	
});


//Global Lists/Add Interests Globally
app.get("/feed/interest",function(req,res){

	var categoryObj = {categoryData:'Politics'};
	var categoryData = new modelObj.Category(categoryObj);
	categoryData.save(function(catErr,catRes){
		if(catErr) throw catErr;

		if(catRes)
		{
			res.send('<span style="font-weight:bold;color:green">Done Succesfully');	
		}
		else
		{
			res.send('<span style="font-weight:bold;color:red">Server error! Check your internet connection</span>');
		}

	});

});


//Update user current Location
app.post("/get/location",function(req,res){

	var longitude = req.body.long;
	var latitude = req.body.lat;
	
	console.log("Loc1");

	if(req.cookies["uid"] && req.cookies["email"])
	{
		var uid = req.cookies["uid"];
		var email = req.cookies["email"];

		console.log("Loc2");

		var locationArray = [];
		locationArray.push(longitude);
		locationArray.push(latitude);
		var location = {
			type:"Point",
			coordinates:locationArray
		};

		modelObj.Users.update({'_id':uid,'email':email},{$set:{'location':location}},function(locErr,locRes){
			if(locErr) throw locErr;
			
			console.log("Location Set");
		
		});		
	}

});

//Updating user coordinates manually
app.get("/loc",function(req,res){
	modelObj.Users.findByIdAndUpdate("5a10a1c7134aa912448e3519",{$set:{'location.coordinates':[22.81036482348093, 86.17263793945312]}},function(err,resp){
		if(err) throw err;

		console.log(resp);
	});

});

//Display user feed
app.post("/display/feed",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["email"])
	{
		var uid = req.cookies["uid"];
		var email = req.cookies["email"];
		
		modelObj.Interests.find({'userId':uid},'interestData',function(Err,Resp){
			if (Err) throw Err;

			var interestList = [];
			for(var i in Resp)
			{
				interestList.push(Resp[i].interestData);
			}			

			modelObj.Users.find({'_id':uid,'email':email},'location',function(locErr,locResp){
				if (locErr) throw locErr;

				var locationArray = locResp[0].location.coordinates;

				var distance = 100;
				
				// var locationArray = [];
				// locationArray.push(longitude);
				// locationArray.push(latitude);

				var point = [locationArray,distance/3963.2];

				//var feedArray = [];

				modelObj.Feed.find({ feedCategory:{ $in:interestList }, location:{ $geoWithin:{ $centerSphere:point } } }).sort({createdOn:-1}).exec(function(feedErr,feedResp) {
					if (feedErr) throw feedErr;

					//{$geoWithin: { $centerSphere: [ locationArray, distance ] } }
					//{$near:{$geometry:{type:"Point",coordinates:locationArray},$maxDistance: distance}}
					//{$nearSphere: { $geometry: {type : "Point",coordinates : locationArray},$minDistance:0,$maxDistance:distance }}


					res.render('feed',{feed:feedResp});
				});

			});

		});
		
	}

});


//Filter public feed/ with location and category/Talent hunt
app.post("/talent",function(req,res){

	var longitude = req.body.longitude;
	var latitude = req.body.latitude;
	var category = req.body.category;
	var distance = req.body.distance;
	
	if(req.cookies["uid"] && req.cookies["email"])
	{
			var interestList = [];
			interestList.push(category);

			var locationArray = [];
			locationArray.push(latitude);
			locationArray.push(longitude);

			var point = [locationArray,distance/3963.2];

			console.log(category+" "+distance+" "+point);

			modelObj.Feed.find({ feedCategory:{ $in:interestList } , location:{ $geoWithin:{ $centerSphere:point } } }).sort({createdOn:-1}).exec(function(feedErr,feedResp) {
				if (feedErr) throw feedErr;


				res.render('feed',{feed:feedResp});
			});

		
	}

});


//Publish your post
app.post("/feed/submit",function(req,res){

	var postData = req.body.post;
	var postCategory = req.body.category;
	if (postData=="" || postData.length==0)
	{
		res.send('<span style="color:red;font-weight:bold;">Do not leave it blank</span>');
	}
	else
	{
		if(req.cookies["uid"] && req.cookies["email"])
		{
			var uid = req.cookies["uid"];
			var email = req.cookies["email"];
				

			modelObj.Users.find({'_id':uid,'email':email},'location',function(locErr,locResp){
				if (locErr) throw locErr;

				
				var locationArray = locResp[0].location.coordinates;

				
				var location = {
					type:"Point",
					coordinates:locationArray
				};

				var videoId = "";
				var status="";
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
				var match = postData.match(regExp);
				if (match && match[2].length == 11)
				{
					videoId =  match[2];
					status="video";
					postData = videoId;
				}
				else 
				{
					status="text";
				}
				
				var feedObj = {feedData:postData,feedBy:uid,feedCategory:postCategory,feedStatus:status,location:location};
				var feedData = new modelObj.Feed(feedObj);
				feedData.save(function(feedErr,feedRes){
					if(feedErr) throw feedErr;

					if(feedRes)
					{
						res.send('<span style="font-weight:bold;color:green">Posted Succesfully');	
					}
					else
					{
						res.send('<span style="font-weight:bold;color:red">Server error! Check your internet connection</span>');
					}
			
				});

			});
			
		}
		else 
		{
			// User is signed out.
			res.redirect("/");
		}
	} 
		
});

//Talent hunt page/Page for filtering posts according to category and location
app.get("/hunt",function(req,res){
	res.render("hunt");
});

//Account Register
app.post("/register",function(req,res){
	var email = req.body.email;
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.pass;
	var gender = req.body.gender;
	if (/\s/g.test(username) || /\W/g.test(username))
	{
		res.send('<span style="color:red;font-weight:bold;">Don\'t provide spaces.</span>');
	}
	else
	{
	
		modelObj.Users.find({'email':email},'email', function(emailErr,emailResp){
			if(emailErr) throw emailErr;
			
			if(emailResp.length==0)
			{
				modelObj.Users.find({'username':username},'username', function(usernameErr,usernameResp){
					if(usernameErr) throw usernameErr;

					if(usernameResp.length == 0)
					{
						var userObj = {name:name,email:email,username:username,password:password,gender:gender};
						var userData = new modelObj.Users(userObj);
						userData.save(function(regErr,regRes){
							if(regErr) throw regErr;

							if(regRes)
							{
								res.send('<span style="font-weight:bold;color:green">User is registered successfully');	
							}
							else
							{
								res.send('<span style="font-weight:bold;color:red">Error in user registeration</span>');
							}
					
						});
					

					}
					else
					{
						res.send('<span style="font-weight:bold;color:red">Username already exist</span>');
					}
				});
			}
			else
			{
				res.send('<span style="font-weight:bold;color:red">Email id already exist</span>');
			}

		});	
			
	}
});




//Account Signin
app.post("/signin",function(req,res){
	var email = req.body.logemail;
	var password = req.body.logpass;

	modelObj.Users.find({'email':email},'email _id password', function(logErr,logResp){
		if (logErr) throw logErr;

		if(logResp.length!=0)
		{
			if(logResp[0].email == email && logResp[0].password==password)
			{
				res.cookie('email',logResp[0].email , {expire: 360000 + Date.now()}); 	
				res.cookie('uid', logResp[0]._id , {expire: 360000 + Date.now()}); 	
				res.send("true");
			}
			else
			{
				res.send('<span style="font-weight:bold;color:red">Invalid Credentials</span>');
			}	
		}
		else
		{
			res.send('<span style="font-weight:bold;color:red">You are not registered</span>');
		}			

	});


});

//Logout
app.get('/signout',function(req,res){
	res.clearCookie("uid");
	res.clearCookie("email");
	res.send("<meta http-equiv=\"refresh\" content=\"0; url=/\">");
});


var server = app.listen(8000,function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("App is running");
});
