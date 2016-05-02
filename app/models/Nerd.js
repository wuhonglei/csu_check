// grab the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema 
var userSchema = new Schema({
    date: Date,
    data: Array
});

var personSchema = new Schema({
	date: Date,
	data: [{
		name: String,
		lab: String,
		tutor: String,
		time: Number
	}]
});
// the schema is useless so far 
// we need to create a model using it 
var Day = mongoose.model('Day', userSchema, 'detail_attendancy');
var Person = mongoose.model('Person', personSchema, 'person');
// make this available to our users in our Node applications
exports.Day = Day;
exports.Person = Person;

