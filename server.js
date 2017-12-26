var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');
var schedule = require('node-schedule');

var app = express();

var configFile = require('./config.json');

function weatherComponent(cities, callback) {
    var data = [];
    var city = [];

    city = cities;

    console.log(city);
    console.log("toinen yrtys ylla");

    var dayNum = configFile.checkingPeriod;
    var info;
    var itemsProcessed = 0;


    city.forEach(function (element, index, array) {
        var temp = {"city": element, "temperature": []};

        request('https://ilmatieteenlaitos.fi/saa/' + element + '?forecast=daily', function (error, response, body) {
            if (error)
                return callback(error || {statusCode: response.statusCode});

            if (body) {

                var $ = cheerio.load(body);


                for (var x = 0; x < dayNum; x++) {


                    var value = $('.local-weather-forecast-day-menu-item .day-' + x).text();

                    // console.log(value);

                    var weekday = value.match(/[a-z]/g);
                    var celcius = value.match(/[-0-9]/g);

                    if (celcius !== null && weekday !== null) {
                        weekday = weekday.join("");
                        celcius = celcius.join("");

                        //  console.log(weekday);
                        //  console.log(celcius);

                        if (celcius < 0) {
                            info = "DANGER";
                        } else {
                            info = "Ok";
                        }

                        temp.temperature.push({"day": weekday, "celcius": celcius, "status": info});


                    } else {
                        var errorText = "no weatherforecast for this location";
                        temp.temperature.push(errorText);

                    }

                }
                itemsProcessed++;
                data.push(temp);


                if (itemsProcessed === city.length) {
                    return callback(data, false);
                }
            }
        });
    });
}


app.get("/weatherByCity", function (req, res) {

    var cities = req.query.data;

    weatherComponent(cities, function (err, data) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {

            console.log("data lahetetty");
            console.log(data);
            res.send(data);
        }
    });
});

//update logs every minute
/*
setInterval(function() {
    console.log("here we go again");
        weatherComponent(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(util.inspect(data, {showHidden: false, depth: null}));
            }
        });
}, 60 * 1000); // 60 * 1000 milsec
*/






app.listen('8081');
console.log('server starts at port 8081');
exports = module.exports = app;