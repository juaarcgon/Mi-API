module.exports = function (app){
    console.log("Loaded Module");
	const BASE_API_URL = "/api/v1";
    const dataStore = require("nedb");
    const path = require("path");

    const dbFileName = path.join(__dirname,"./countries.db");

    const db = new dataStore ({
        filename: dbFileName,
        autoload: true
    });
   

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

app.post(BASE_API_URL+"/happiness_rate",(req,res) =>{
	
	var newCountry = req.body;
	var country = req.body.country;
	var year = parseInt(req.body.year);

		db.find({"country": country, "year": year},(error, countries)=>{
			if(countries.length != 0){	
				res.sendStatus(409,"CONFLICT");
			}else if(!newCountry.country || !newCountry.year || !newCountry.happinessRanking || !newCountry.happinessRate 
					  || !newCountry.var || Object.keys(newCountry).length != 5){
				res.sendStatus(400,"BAD REQUEST");
			}else{
				db.insert(newCountry);
				res.sendStatus(201,"CREATED");
			}
		});
	
});

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
// GET COUNTRIES/XXX

app.get(BASE_API_URL+"/happiness_rate/:country",(req,res)=>{
	var country = req.params.country;

		db.find({"country" :country},(error,countries)=>{
			if(countries.length==0){
				
				res.sendStatus(404,"NOT FOUND");
			}else{
				res.send(countries.map((t)=>{
					delete t._id;
					return(t);
				}));
				console.log("Recurso mostrado");
			}
		})
	});
//GET V2 COUNTRIES/XXX
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
//GET COUNTRIES/XXX/YYY
	
app.get(BASE_API_URL+"/happiness_rate/:country/:year", (req,res)=>{

        var country = req.params.country;
        var year = parseInt(req.params.year);

        db.find({"country" :country, "year":year},(error, countries)=>{
            if(countries.length==0){
                
                res.sendStatus(404,"NOT FOUND");
            }else{
                res.send(countries.map((c)=>{
                    delete c._id;
                    return(c);
                }));
                console.log("OK");
            }
        })
	});

// GET V2 COUNTRIES/XXX/YYY 
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