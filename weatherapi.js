/**
 * Function to retrieve informationq from the API
 * @param {String} inCity The city we are lookin for
 * @param {String} APP_ID The APP_ID
 */
function gettingInfo (inCity, APP_ID = "42f31002a9e81edcd1aa8cd52b456cc9"){
    const xhr = new XMLHttpRequest();
    xhr.open("GET","http://api.openweathermap.org/data/2.5/forecast/?units=metric&id="+ inCity+"&APPID="+APP_ID);
    xhr.addEventListener("load", function (e){
        if(e.target.status === 200){
            displayHTML(JSON.parse(e.target.responseText));
        } else {
            displayNotFound(e.target);
            e.target.abort();
        }
    });
    xhr.send(null);
}

/**
 * Generates the HTML for each day forecast
 * @param {Object} jsonObj the object Json returned by the API
 * @param {String} cityName The name of the city 
 * @param {Boolean} extendedInfos 
 */
function createDivForecast (data, cityName, extendedInfos = false) {
    let div = document.createElement("div");
    div.classList.add('forecast');
    if(extendedInfos) {
        let city = document.createElement('div');
        city.id = "cityNameText";
        city.appendChild(document.createTextNode(cityName));
        div.appendChild(city);
    }
    // icon
    let icon = document.createElement('img');
    let containerIcon = document.createElement('div');
    iconCode = data.weather[0].icon;
    icon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    containerIcon.appendChild(icon);
    div.appendChild(containerIcon);

    // temperature
    let containerTemp = document.createElement('div');
    containerTemp.id = "temp";
    containerTemp.appendChild(document.createTextNode(data.main.temp +"°"));
    div.appendChild(containerTemp);

    // description
    let containerDesc = document.createElement('div');
    containerDesc.textContent = data.weather[0].description;
    div.appendChild(containerDesc);

    if(extendedInfos) {
        let containerWindPressure = document.createElement('div');
        let containerHumiCloud = document.createElement('div');
        // windspeed
        let wind = document.createElement("span");
        wind.textContent =  "wind: " + data.wind.speed + " m/s";
        containerWindPressure.appendChild(wind);
        // pressure
        let pressure = document.createElement("span");
        pressure.textContent =  "Pressure: " + data.main.pressure + " hPa";
        containerWindPressure.appendChild(pressure);
        // humidity
        let humudity = document.createElement("span");
        humudity.textContent =  "Humudity: " + data.main.humidity + "%";
        containerHumiCloud.appendChild(humudity);
        //cloudiness
        let cloudiness = document.createElement("span");
        cloudiness.textContent =  "Cloudiness: " + data.clouds.all + "%";
        containerHumiCloud.appendChild(cloudiness);

        div.appendChild(containerWindPressure);
        div.appendChild(containerHumiCloud);
    }

    return div;
}
/**
 * Display the forecast
 * @param {Object} jsonObj Data of the day from the API
 */
function displayHTML(jsonObj) {
    var weather= document.querySelector("#weather");
    weather.innerHTML = "";
    let container = document.createElement('div');
    container.id = "otherDays";
    for(let i=0; i<jsonObj.list.length; i+=8){
        let div;
        if(i == 0){
            div = createDivForecast(jsonObj.list[i],jsonObj.city.name, true);
            let container= document.createElement('div');
            container.id = "mainDay";
            container.appendChild(div);
            weather.appendChild(container); 
        } else {
            div = createDivForecast(jsonObj.list[i], jsonObj.city.name);
            container.appendChild(div);
            weather.appendChild(container);
        }
        div.id = 'forecast'+i;   
    }                    
            
    // if you don't use the dt from the api this is a way to find the day by yourself.
    let daydiv = document.querySelectorAll("#mainDay>div, #otherDays>div");
    let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday" ,"Friday", "Saturday"];
    let counterDay = new Date().getDay();
    
    for(let j = 0 ; j<daydiv.length; j++) {
        let imgContainer = daydiv[j].querySelector("img").parentElement;
        if( counterDay > 6) { counterDay =0; } 
        daydiv[j].insertBefore(document.createTextNode(weekday[counterDay++]), imgContainer); 
    }           
}
/**
 * Display the not found html
 * @param {XMLHttpRequest} xhr the xhr object 
 */
function displayNotFound(xhr) {
    var weather= document.querySelector("#weather");
    weather.innerHTML = "";

    // div not found
    let notFound = document.createElement("div");
    let notFoundContainer = document.createElement("div");
    notFoundContainer.id = "notFoundContainer";
    notFound.title = `${xhr.status} - ${xhr.statusText}`;
    notFound.id = "notFound";
    notFound.textContent = `${xhr.status} - ${xhr.statusText}`;
    notFoundContainer.appendChild(notFound);
    weather.appendChild(notFoundContainer);
}

function getCityID(inCity) {
    const listCity = fetch("http://localhost/Sites/weather_API/Step2-autocomplete/city.list.min.json");
    listCity.then(response => {
        return response.json();
    }).then(cities => {
        const rgx = new RegExp(`^${inCity}`, 'gi');
        let matchingCities = [];

        cities.forEach(function(city){
            if(rgx.test(city.name) && matchingCities.length<10) {
                matchingCities.push(city);
            }
        });
        displayListCities(matchingCities);
    });
}

function displayListCities(matchingCities) {
    results.style.display = matchingCities.length ? 'block' : 'none'; // We hide the container if we don't have results
		
    if (matchingCities.length) { // We do modify the results only if we have ones
        results.innerHTML = ''; // We clear the results
        let div;
        for (let i = 0 ; i < matchingCities.length ; i++) {
                div = results.appendChild(document.createElement('div'));
                div.textContent = matchingCities[i].name + " - " + matchingCities[i].state +" - " + matchingCities[i].country;
                div.setAttribute("data-city", matchingCities[i].id);
                div.setAttribute("data-cityName", matchingCities[i].name);
                div.addEventListener('click', function(e) {
                    chooseResult(e.target);
                });
            
        }
    }
}

function chooseResult(result) { // We choose one of the results of the request and we manage all what is related to
    searchElement.value = result.getAttribute("data-cityName"); // We change the content of the search field and we store as previous value
    searchHidden.value = previousValue = result.getAttribute("data-city");
    results.style.display = 'none'; // we hide the results
    result.className = ''; // we suppress the focus effect
    selectedResult = -1; // we put again the selection to zero
    searchElement.focus(); // if the result has been chosen with a click even if the focus is lost we re-attribute it again
    gettingInfo(searchHidden.value);
}

//////////////////////////////////////////////////////////////////////////
////////////////////////////EXECUTION////////////////////////////////////
////////////////////////////////////////////////////////////////////////   
var searchElement = document.querySelector("#cityName"),
    searchHidden = document.querySelector("#cityId"),
    results = document.querySelector('#listCities'),
    selectedResult = -1, // allow to know which result is selected : -1 means "no selection"
    previousRequest, // We store our previous request in this variable
    previousValue = searchElement.value; // We do the same with the previous value
	
/**
 * Execution initial function
 */
function init() {
    searchElement.focus();
    searchElement.addEventListener("keyup", function(e){
        let divs = results.querySelectorAll('div');
        if (e.keyCode == 38 && selectedResult > -1) { // If the key pressed is the up arrow
            divs[selectedResult--].className = '';
            if (selectedResult > -1) { // this condition protect from a modification of childNodes[-1], which is not existing
                divs[selectedResult].className = 'result_focus';
            }
        }
        else if (e.keyCode == 40 && selectedResult < divs.length - 1) { // if the jey pressed is arrow bottom
            if (selectedResult > -1) { // this condition protect from a modification of childNodes[-1], which is not existing
                divs[selectedResult].className = '';
            }
            divs[++selectedResult].className = 'result_focus';
        }
        else if (e.keyCode == 13 && selectedResult > -1) { // if the key pressed is Enter
            gettingInfo(divs[selectedResult].getAttribute("data-city"));
            results.innerHTML="";
        } 
        else if (e.keyCode == 13 && selectedResult == -1) {
            gettingInfo(divs[0].getAttribute("data-city"));
            results.innerHTML="";
        }
        else if (searchHidden.value != previousValue) { // if the content of the search field has changed
            previousValue = searchHidden.value;
    
            if (previousRequest && previousRequest.readyState < XMLHttpRequest.DONE) {
                previousRequest.abort(); // if we have still a research running, we stop it
            }
    
            previousRequest = getCityID(previousValue); // we store the new request

            selectedResult = -1; // we reset the selection for every entered characters
        }
        else {
            if(searchElement.value!= "") {
                getCityID(searchElement.value);
            }
            results.innerHTML= "";
        }
    });
}
init();