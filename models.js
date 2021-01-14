var mongoose = require ("mongoose");
var url = "mongodb://localhost:27017/passion";
mongoose.connect(url);
var Schema = mongoose.Schema;

module.exports = function(mongoose) {
	var userSchema = new Schema({
		name:{type:String, required:'Please enter your name'},
		email:{type:String, lowercase:true, unique:true, required:'Please provide your email-id'},
		username:{type:String, lowercase:true, unique:true, required:'Please enter an username in lowercase'},
		password:{type:String, required:'Please enter a password'},
		gender:{
			type:[{
					type:String,
					enum:['male','female']
			}],
			default:['male'],
			required:true
		},
  		location: {
			"type":{
						type: String, 
						enum: ['Point', 'LineString', 'Polygon'], 
						default: "Point", 
						required:true
			}, 
  			coordinates:{
  				type: [Number], 
  				default:[0,0] 
  			}
  		},		
  		profilePhoto:{type:String},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		updatedOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		dateOfBirth:{
			type:Date,
			max:Date.now,
		}
	
	});
	
	var feedSchema = new Schema({
		feedData:{type:String, required:'Please enter your feed'},
		feedBy:[{type : Schema.Types.ObjectId, ref : 'users'}],
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		feedPhoto:{type:String},
		feedCategory:{type:String,required:true},
		feedLikes:{type :Number,default:0},
		feedStatus:{
			type:[{
					type:String,
					enum:['text','image','video']
			}],
			default:['text'],
			required:true
		},
		location: {
			"type":{
						type: String, 
						enum: ['Point', 'LineString', 'Polygon'], 
						default: "Point", 
						required:true
			}, 
  			coordinates:{
  				type: [Number], 
  				default:[0,0] 
  			}
  		}  
	});

	var categorySchema = new Schema({
		categoryData:{type:String, required:'Please enter your feed',unique:true},
		categoryPhoto:{type:String},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
	});

	var interestSchema = new Schema({
		interestId:[{type : Schema.Types.ObjectId, ref : 'categories'}],
		userId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		interestData:{type:String},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
	});

	userSchema.index({location: '2dsphere'});
	feedSchema.index({location: '2dsphere'});

	var models = {
		Users:mongoose.model('users',userSchema),
		Feed:mongoose.model('feeds',feedSchema),
		Category:mongoose.model('categories',categorySchema),
		Interests:mongoose.model('interests',interestSchema)
	};
	return models;

}
