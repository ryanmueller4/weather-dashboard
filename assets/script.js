var city ="Los Angeles";
var lat = "";
var lon = "";
var prevSearches = [];

$(".search").click(function () {
    city = $(".form-control").val().toUpperCase();

    if (city === "") {
        return;
    }

    if (geoRequest()) {
        if (localStorage.getItem("searchHistory") !== null) {
            var searchHist = JSON.parse(localStorage.getItem("searchHistory"));
            if (searchHist.includes(city)) {
                $(".form-control").val("");
                return;
            }
        }
        if (prevSearches.length === 8) {
            prevSearches.pop();
        }
        prevSearches.unshift(city);
        localStorage.setItem('searchHistory', JSON.stringify(prevSearches));

        $(".form-control").val("");

        displaySearches();

    } else {
        $(".modal").show();
        $(".form-control").val("");
        return;
    }
})

$(".close").click(function() {
    $(".modal").hide();
})

$("ul").click(function (event) {
    city = $(event.target).text();
    geoRequest();
 })

function displaySearches() {
    $("li").remove();
    if (localStorage.getItem("searchHistory") === null) {
        return;
    }

    prevSearches = JSON.parse(localStorage.getItem("searchHistory"));

    for (var i = 0; i < prevSearches.length; i++) {
        var histBtn = $("<li>").text(prevSearches[i]);
        $("ul").append(histBtn);
    }
};

function geoRequest() {
    var requestGood = true;
    fetch("https://api.openweathermap.org/geo/1.0/direct?q="+city+"&limit=1&appid=c479a3ed2cbe0a5a3c6926f6ff7aee05")
        .then(function (geoResp) {
            if (geoResp.status !== 200) {
                requestGood = false;
                return null;
            } else {
                return geoResp.json();
            }
        })
        .then(function (geoData) {
            if (geoData === null) {
                return;
            } else {
                city = geoData[0].name;
                lat = geoData[0].lat;
                lon = geoData[0].lon;
                weatherRequest();
            }
        })
    return requestGood;
}

function weatherRequest() {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=36475aa6e6360c06a75febf0d999bfb7&units=imperial")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            printCurrent(data);
            print5day(data);
        })
    return;
}

function printCurrent(data) {
    $(".currentDay").children().remove();
    
    let currentBox = $(".currentDay");
    let date = $("<h3>").text(city+" ("+dayjs.unix(data.current.dt).format("MM-DD-YYYY")+")");
    let icon = $("<img>").attr( "src", "https://openweathermap.org/img/wn/"+data.current.weather[0].icon+"@2x.png").css("height", "50px");
    date.append(icon);
    currentBox.append(date);
    let temp = $("<p>").text("Temp: "+data.current.temp+"°F");
    currentBox.append(temp);
    let wind = $("<p>").text("Wind: "+data.current.wind_speed+"MPH");
    currentBox.append(wind);
    let humidity = $("<p>").text("Humidity: "+data.current.humidity+"%");
    currentBox.append(humidity);
    let uv = $("<p>").text("UV Index: ");
    let uvi = data.current.uvi;
    let uvBox = $("<span>").text(uvi);
    if (uvi < 3) {
        
        uvBox.addClass("badge badge-success");
    } else if ( uvi < 5){
        uvBox.addClass("badge badge-warning");
    } else {
        uvBox.addClass("badge badge-danger");
    }
    uv.append(uvBox);
    currentBox.append(uv);
}

function print5day(data) {
    $(".forecastBoxes").children().remove();
    
    let forecastBoxes = $(".forecastBoxes");

    for (let i = 1; i < 6; i++ ){
        let forecastBox = $("<div>").addClass("col-12 col-sm-12 col-md-2 col-lg-2 card text-white mb-3");
        let date = $("<h5>").text(dayjs.unix(data.daily[i].dt).format("MM-DD-YYYY"));
        forecastBox.append(date);
        let icon = $("<img>").attr( "src", "https://openweathermap.org/img/wn/"+data.daily[i].weather[0].icon+"@2x.png").addClass("Box");
        forecastBox.append(icon);
        let temp = $("<p>").text("Temp: "+data.daily[i].temp.day+"°F");
        forecastBox.append(temp);
        let wind = $("<p>").text("Wind: "+data.daily[i].wind_speed+"MPH");
        forecastBox.append(wind);
        let humidity = $("<p>").text("Humidity: "+data.daily[i].humidity+"%");
        forecastBox.append(humidity);
        forecastBoxes.append(forecastBox);
    }
}

geoRequest();
displaySearches();