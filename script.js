var wasCityHistoryButtonClicked = false
var currentDate = moment().format().slice(0,10)

var cityHistory = []

//Checks the current date every minute
var updatedDate = setInterval(function(){
    currentDate = moment().format().slice(0,10)
},60000)

startUp()

//When the user clicked search button
$("#submit-button").on("click",function(event){
    event.preventDefault()
    
    var userChoice = $("#user-search").val()

    if(userChoice !== ""){
        apiDataCall(userChoice)
    }
})

//When the user clicks any of the previously searched cities
$("#city-history").on("click",function(){

    //Checks if what was clicked on was a button with the attribute of city-name, if yes make an ajax call with that city name
    if($(event.target).attr("city-name")){

        //Tell the computer that the following ajax call was made by clicking the city history button
        wasCityHistoryButtonClicked = true

        //Saves the button attribute for the floowing ajax call
        var buttonClicked = $(event.target).attr("city-name")

        //Makes an ajax call with the city-name of the button clicked
        apiDataCall(buttonClicked)
    }
})


function apiDataCall(userChoice){

        //Search the open weather api for that city
        var apikey = "f60093565126bc915ec9856d96e4bfee"
    
        //Variable saving chosen locations longitutde and latitiude
        var longitutde = ""
        var latitiude = ""
    
        var mainQueryUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ userChoice +"&appid=" + apikey
    
        //Location Current Information
        var cityName = ""
        var tempF = ""
        var humidity = ""
        var windSpeed = ""
        var uvIndex = ""
    
        $.ajax({
            url: mainQueryUrl,
            method: "GET"
    
        //Then in the main weather section ajax call
        }).then(function(result){

            //Cariables Defined for main weather section
            //Uv index ajax call info
            longitutde = result.coord.lon
            latitiude = result.coord.lat  
            var uvQueryUrl = "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=" + apikey + "&lat=" + latitiude + "&lon=" + longitutde
            
            cityName = result.name 
            
            tempF = ("Temperature: " + (result.main.temp * (9/5) -459.67).toFixed(2)) + "°"
    
            humidity = "Humidity: " +result.main.humidity + "%"
    
            windSpeed = "Wind: " + result.wind.speed + " Meters/s"
    
            //uv index ajax call
            $.ajax({
                url: uvQueryUrl,
                method: "GET"
            }).then(function(result){

                uvIndex = "UV Index: " + result[0].value

                var forecastUrl = "https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q="+ cityName +"&appid=" + apikey

                //Setting nextDayComparision 
                var currentDay = currentDate.slice(8,10)

                $.ajax({
        
                    url: forecastUrl,
                    method: "GET"
                    
                }).then(function(result){
                    //Create 2 dimensional array that stores each day for the next 5 days and
                    var forecastData = [["Day", "Weather Condition", "Temperature","Humidity"],
                                        ["Day", "Weather Condition", "Temperature","Humidity"],
                                        ["Day", "Weather Condition", "Temperature","Humidity"],
                                        ["Day", "Weather Condition", "Temperature","Humidity"],
                                        ["Day", "Weather Condition", "Temperature","Humidity"]]

                    //Display All the data to the correct place
                    $("#main-dashboard-content").empty()

                    var newDivEl = $("<div>")
                    newDivEl.addClass("position")

                    var newTitleEl = $("<h2>").text(cityName +" (" + currentDate + ")")
                    
                    var newRmBtnEL = $("<button>").text("Remove City")
                    newRmBtnEL.addClass("btn btn-outline-danger rm-button")
                    newRmBtnEL.attr("cityName",cityName)
                    newRmBtnEL.attr("id","rm-button")

                    var newHrEl = $("<hr>")
                    var newTempEl = $("<p>").text(tempF)
                    var newHumidityEl = $("<p>").text(humidity)
                    var newWindSpeedEl = $("<p>").text(windSpeed)
                    var newUvIndexEl = $("<p>").text(uvIndex)

                    newDivEl.append(newTitleEl, newRmBtnEL, newHrEl, newTempEl, newHumidityEl, newWindSpeedEl, newUvIndexEl)
                    
                    
                    $("#main-dashboard-content").append(newDivEl)

                    //Added click event to remove button
                    $(".rm-button").on("click",function(event){
                        
                        //Grab the parent functions city name
                        var cityToBeRemoved = $(this).attr("cityName")
                        console.log(cityToBeRemoved)
                        
                        //Remove correct button using remove city function
                        removeCity(cityToBeRemoved)
                        
                    })

                    //If this ajax call was made by clicking on the search button, create a new button
                    if(!wasCityHistoryButtonClicked){  
                        
                        //Check if a previous ajax call was made
                        if((cityHistory.includes(cityName)) === false){
                            cityHistory.push(cityName)
                            storeCityHistory()
                            renderCityHistory()
                        }
                    
                    //Otherwise set the following button to false 
                    }else{
                        wasCityHistoryButtonClicked = false
                    }
                
                    //Find the first day that does no equal the current day of the user
                    for(var i = 0; i < result.list.length; i++){
                        var forecastDay = result.list[i].dt_txt.slice(8,10)
            
                        //Checks that the current day and the next day are not the same
                        if(forecastDay != currentDay){
            
                            var dayCounter = 0
            
                            //Save forecast for the next 5 days im forecastData array
                            for(var j = i ; j < result.list.length; j+= 8){
            
                                forecastData[dayCounter][0] = result.list[j].dt_txt.slice(0,10)
            
                                forecastData[dayCounter][1] = result.list[j].weather[0].main
            
                                forecastData[dayCounter][2] = (result.list[j].main.temp * (9/5) -459.67).toFixed(2)

                                forecastData[dayCounter][3] = result.list[j].main.humidity
            
                                dayCounter++
                            }
            
                            //Create card elements using forecast data 2D array
                            for(var i = 0; i < 5; i++){
            
                                //Clear - if any - elements attached to 5 day forecast cards
                                $("#card"+i).empty()

                                //Create new elements for 5 day forecast cards 
                                var newDay = $("<p>").text(forecastData[i][0])
            
                                var newWeather = $("<img>")

                                //Set Proper img depending on weather conditions
                                if(forecastData[i][1] === "Clear"){
                                    newWeather.attr("src","./assets/sun.svg")
            
                                } else if (forecastData[i][1] === "Clouds"){
                                    newWeather.attr("src","./assets/cloudy.svg")
            
                                } else if(forecastData[i][1] === "Rain"){
                                    newWeather.attr("src","./assets/rain.svg")
            
                                } else if(forecastData[i][1] === "Snow"){
                                    newWeather.attr("src","./assets/snow.svg")
                                }
            
                                var newTemp = $("<p>").text("Temp: "+forecastData[i][2]  + "°")
            
                                var newHumidity = $("<p>").text("Humidity: "+forecastData[i][3] + "%")

                                $("#card"+i).append(newDay,newWeather,newTemp,newHumidity)
            
                            }
                            return
                        }
                    }
                })
            })
        })
}

//When createButton function is called
//Display that city in the city history section of the page
function createButton(name){

    //City History Button Styles
    var btnClasses = "btn btn-lg btn-block city-button"

    //Create a new button 
    var newBtn = $("<button>")

    //Give it a text of the city name 
    newBtn.text(name)

    //Give the button proper classes
    newBtn.addClass(btnClasses)

    //Give it a data attribute of cityname
    newBtn.attr("city-name", name)

    //Display button on screen by appending
    $("#city-history").prepend(newBtn)


}

//Display City history buttons
function renderCityHistory(){
    $("#city-history").empty()
    // Clear toDO element and update cityhistory
 
    for(var i = 0; i < cityHistory.length;i++){
        createButton(cityHistory[i])
    }
}

//Store searched history
function storeCityHistory() {
    // Add code here to stringify the todos array and save it to the "todos" key in localStorage
    var stringifyCityHistory = JSON.stringify(cityHistory)
    localStorage.setItem("cityHistory", stringifyCityHistory)
}

//Remove cities from city history button
function removeCity(cityToBeRemoved){
    var elementToBeRemoved = (cityHistory.indexOf(cityToBeRemoved))
    //Remove city from array
    cityHistory.splice(elementToBeRemoved, 1)

    console.log(cityHistory)

    //Update local storage
    storeCityHistory()

    //Render city history again
    renderCityHistory()

    //run an ajax call for the last  element
    if(cityHistory.length != 0){

        apiDataCall(cityHistory[cityHistory.length-1])

    } else {

        $("#main-dashboard-content").empty()
        for(var i = 0; i < 5; i++){
            //Clear - if any - elements attached to 5 day forecast cards
            $("#card"+i).empty()
        }
    }

}

//What needs to happen when the application first starts
function startUp(){
    var cityHistoryInStorage = JSON.parse(localStorage.getItem("cityHistory"))


    if(cityHistoryInStorage != 0){

        cityHistory = cityHistoryInStorage
        renderCityHistory()
        apiDataCall(cityHistory[cityHistory.length-1])

    }

}