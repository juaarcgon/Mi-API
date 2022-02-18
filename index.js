const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
//API Juan Manuel
const happiness_rateAPIv1 = require("./src/back/happiness_rateAPI/v1");
const happiness_rateAPIv2 = require("./src/back/happiness_rateAPI/v2");
//API Adrian
const global_competitiveness_indexAPIv1 = require("./src/back/global_competitiveness_indexAPI/v1");
const global_competitiveness_indexAPIv2 = require("./src/back/global_competitiveness_indexAPI/v2");
//API Alejandro
const countries_for_equality_statsAPIv1 = require("./src/back/countries_for_equality_statsAPI/v1");
const countries_for_equality_statsAPIv2 = require("./src/back/countries_for_equality_statsAPI/v2");

var app = express();

app.use(bodyParser.json());
app.use(cors());


happiness_rateAPIv1(app);   
happiness_rateAPIv2(app);   
global_competitiveness_indexAPIv1(app);    
global_competitiveness_indexAPIv2(app);    
countries_for_equality_statsAPIv1(app);    
countries_for_equality_statsAPIv2(app);    

var port = process.env.PORT || 9999;

app.use("/", express.static("./public"));

app.listen(port, () => {
    console.log("Server ready on port " + port);
});

console.log("Starting server...");