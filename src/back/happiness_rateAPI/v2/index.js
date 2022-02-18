console.log("A");
module.exports = function (app){
    console.log("Loaded Module");
	const BASE_API_URL = "/api/v2";
    const dataStore = require("nedb");
	const path = require("path");
	const request = require('request');
	const express = require("express");

    const dbFileName = path.join(__dirname,"./countries.db");

    const db = new dataStore ({
        filename: dbFileName,
        autoload: true
	});
	// Proxy para API Grupo 5
	var proxy05 = "/api/v1/life_expectancies"
	var urlProxy05 = "https://sos1920-05.herokuapp.com"
	// Proxy para API Grupo 9
	var proxy09 = "/api/v4/renewable-sources-stats"
	var urlProxy09 = "https://sos1920-09.herokuapp.com"
	// Proxy para API Grupo 12
	var proxy12 = "/api/v2/overdose-deaths"
	var urlProxy12 = "https://sos1920-12.herokuapp.com"
	// Proxy para API Grupo 22
	var proxy22 = "/api/v1/og-basket-stats"
	var urlProxy22 = "https://sos1920-22.herokuapp.com"
   

var initialcountries = [
	{ 
		country: "spain",
		year:     2019,
		happinessRanking: 30,
		happinessRate: 6.365,
		var: 0.7
	},
	{ 
		country: "germany",
		year:     2019,
		happinessRanking: 17,
		happinessRate: 6.985,
		var: 0.29	
	},
	{
		country: "france",
		year:     2019,
		happinessRanking: 17,
		happinessRate: 6.592,
		var: 1.59
	},
	{
		country: "portugal",
		year:     2019,
		happinessRanking: 66,
		happinessRate: 5.693,
		var: 5.23
	}
	
];
				
// Proxy para API Grupo 5
app.use(proxy05, function(req, res){
	var url = urlProxy05 + req.baseUrl + req.url;
	console.log("piped: " + req.baseUrl + req.url);
	req.pipe(request(url)).pipe(res)
});	
app.use(express.static('.'));				
// Proxy para API Grupo 9
app.use(proxy09, function(req, res){
	var url = urlProxy09 + req.baseUrl + req.url;
	console.log("piped: " + req.baseUrl + req.url);
	req.pipe(request(url)).pipe(res)
});	
app.use(express.static('.'));				
// Proxy para API Grupo 12
app.use(proxy12, function(req, res){
	var url = urlProxy12 + req.baseUrl + req.url;
	console.log("piped: " + req.baseUrl + req.url);
	req.pipe(request(url)).pipe(res)
});	
app.use(express.static('.'));
// Proxy para API Grupo 22
app.use(proxy22, function(req, res){
	var url = urlProxy22 + req.baseUrl + req.url;
	console.log("piped: " + req.baseUrl + req.url);
	req.pipe(request(url)).pipe(res)
});		
app.use(express.static('.'));			


// GET COUNTRIES

app.get(BASE_API_URL+"/happiness_rate/loadInitialData", (req,res) =>{
	var fichero = db.getAllData();
	if(fichero.length>=1){
		res.sendStatus(409, "ALREADY EXIST");
		console.log("There is already loaded data");
	}else{	
	db.insert(initialcountries);
	res.sendStatus(200,"OK");
	res.send(JSON.stringify(initialcountries,null,2));
	}
});

app.get(BASE_API_URL+"/happiness_rate", (req,res) =>{
	
	    var limit = req.query.limit;
		var offset = req.query.offset;
		console.log("limit="+limit+", offset="+offset);
		
		var country = req.query.country;
		var year = parseInt(req.query.year);
	    var happinessRanking = parseInt(req.query.happinessRanking);
		var happinessRate = parseFloat(req.query.happinessRate);
		
		var var1 = parseFloat(req.query.var);
		
		var fromYear = parseInt(req.query.fromYear);
		var toYear = parseInt(req.query.toYear);
		console.log("country="+country+", year="+year+", happinessRate="+happinessRate+", bus="+ happinessRanking+", var="+var1+", fromYear="+fromYear+", toYear="+toYear);
		
		if(country){
			
			db.find({country: country}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else if(year){
			db.find({year: year}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else if(happinessRanking){
			db.find({happinessRanking: happinessRanking}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else if(happinessRate){
			db.find({happinessRate: happinessRate}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else if(var1){
			db.find({var: var1}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else if(fromYear && toYear){
			db.find({year: {$gte: fromYear, $lt: toYear}}).sort({year: 1}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}else{
			db.find({}).skip(offset).limit(limit).exec( function (err, countries) {
				countries.forEach( (v) => {
					delete v._id;
				});
				res.send(JSON.stringify(countries,null,2));
				console.log("Data sent:"+JSON.stringify(countries,null,2));
			});
		}
	});

// POST COUNTRIES
console.log("B");
app.post(BASE_API_URL+"/happiness_rate",(req,res) =>{
	console.log("C");
	var newCountry = req.body;
	var country = req.body.country;
	var year = parseInt(req.body.year);
	console.log("D");
		db.find({"country": country, "year": year},(error, countries)=>{
			console.log("E");
			if(countries.length != 0){	
				res.sendStatus(409,"CONFLICT");
				console.log("F");
			}else if(!newCountry.country || !newCountry.year || !newCountry.happinessRanking || !newCountry.happinessRate 
					  || !newCountry.var || Object.keys(newCountry).length != 5){
						console.log("G");
				res.sendStatus(400,"BAD REQUEST");
				console.log("H");
			}else{
				console.log("I");
				db.insert(newCountry);
				res.sendStatus(201,"CREATED");
			}
		});
		console.log("J");
});
console.log("L");
// DELETE COUNTRIES

app.delete(BASE_API_URL+"/happiness_rate", (req,res) =>{
	 db.find({}, (err,countries) =>{
        if(countries.length != 0){
            db.remove({}, { multi: true }, function (err, numRemoved) {
               });
            res.sendStatus(200,"OK");
        }else{
            res.sendStatus(405,"METHOD NOT ALLOWED");
        }
    });
});
//PUT COUNTRIES

app.put(BASE_API_URL+"/happiness_rate", (req,res)=>{
	res.sendStatus(405,"METHOD NOT ALLOWED");
});

//POST COUNTRIES/XXX

app.post(BASE_API_URL+"/happiness_rate/:country",(req,res) =>{
	res.sendStatus(405,"METHOD NOT ALLOWED");
});
//GET COUNTRIES/XXX
app.get(BASE_API_URL+"/happiness_rate/:country",(req,res)=>{
	var country = req.params.country;

		db.find({"country" :country},(error,countries)=>{
			if(countries.length==0){
				
				res.sendStatus(404,"NOT FOUND");
			}else{
				res.send(countries.map((t)=>{
					delete t._id;
					return(t);
				})[0]);
				console.log("Recurso mostrado");
			}
		})
	});

// GET  COUNTRIES/XXX/YYY 
app.get(BASE_API_URL+"/happiness_rate/:country/:year", (req,res)=>{

	var country = req.params.country;
 var year = parseInt(req.params.year);

 db.find({"country" :country, "year":year},(error, countries)=>{
	 if(countries.length==0){
		 console.log("ERROR 404. Recurso no encontrado");
		 res.sendStatus(404);
	 }else{
		 res.send(countries.map((t)=>{
			 delete t._id;
			 return(t);
		 })[0]);
		 console.log("Recurso mostrado");
	 }
 })
});
// PUT COUNTRY/XXX/YYY
	app.put(BASE_API_URL+"/happiness_rate/:country/:year", (req, res) =>{

        var country = req.params.country;
		var year = parseInt(req.params.year);
		var updateC = req.body;
		
		db.find({"country":country, "year": year},(error,countries)=>{
			console.log(countries);
			if(countries.length == 0){
				console.log("Error 404, recurso no encontrado.");
				res.sendStatus(404);
			}else if(!updateC.country || !updateC.year || !updateC.happinessRanking || !updateC.happinessRate
		  			 || !updateC.var || updateC.country != country || updateC.year != year
					 || Object.keys(updateC).length != 5
					){
				
					res.sendStatus(400,"BAD REQUEST");
			}else{
				db.update({"country":country,"year":year},{$set: updateC});
				res.sendStatus(200,"OK");
			}
		});
	});
// PUT COUNTRY/XXX

app.put(BASE_API_URL+"/happiness_rate/:country",(req,res)=>{
 	var country = req.params.country;
	var updateC = req.body;
		
		db.find({"country":country},(error,countries)=>{
			console.log(countries);
			if(countries.length == 0){
				res.sendStatus(404,"NOT FOUND");
			}else if(!updateC.country || !updateC.year || !updateC.happinessRanking || !updateC.happinessRate
		  			 || !updateC.var || updateC.country != country || Object.keys(updateC).length != 5){
					res.sendStatus(400,"BAD REQUEST");
			}else{
				db.update({"country":country},{$set: updateC});
				res.sendStatus(200,"OK");
			}
		});
	});

// DELETE COUNTRY/XXX

app.delete(BASE_API_URL+"/happiness_rate/:country",(req,res)=>{
   var country = req.params.country;
   db.count({country:country},function(err,count){
    if(count==0){
        res.sendStatus(404,"NOT FOUND");
    }else{

        db.find({country: country}, (err,countries) =>{
        db.remove({country : country}, {}, (err,countries_for_equality_stats1) =>{}); 

    });
        res.sendStatus(200,"OK");
    }
   });
});
	
//DELETE COUNTRY/XXX/YYY
	
app.delete(BASE_API_URL+"/happiness_rate/:country/:year", (req,res)=>{

	var country = req.params.country;
	var year = parseInt(req.params.year);

	db.find({"country":country, "year":year},(error, countries)=>{
		if(countries.length==0){
			res.sendStatus(404,"NOT FOUND");
		}else{	
            res.sendStatus(200,"OK");
            db.remove({ "country":country, "year":year });
			}
		})
	});
}
//M