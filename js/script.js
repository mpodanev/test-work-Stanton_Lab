const mapButton = document.getElementById('map-button');
const mapPopUp = document.getElementById('popup-map');
const closePopUpBtn = document.getElementById('popup-map-close');
const input = document.getElementById('location');
const mapLabel = document.querySelector('.popup-map__place-wrapper');


mapButton.addEventListener('click', function(e) {
  e.preventDefault();

  mapPopUp.classList.remove('visually-hidden');
  mapLabel.innerHTML = input.value;
});
closePopUpBtn.addEventListener('click', function(e) {
  e.preventDefault();

  mapPopUp.classList.add('visually-hidden');
});

function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 48.468801,
      lng: 35.040874
    },
    zoom: 13,
    mapTypeId: 'roadmap',
    disableDefaultUI: true
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }


  // Create the search box and link it to the UI element.
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        // icon: icon,
        title: place.name,
        position: place.geometry.location,
        draggable: true
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });

    map.fitBounds(bounds);

    google.maps.event.addListener(markers[markers.length - 1], 'dragend', function (e) {
      var positionMarker = e.latLng;

      var request = {
        location: positionMarker,
        radius: '50',
      };
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);

    });


    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {

        var request2 = {
          placeId: results[0].place_id
        };

        var service2 = new google.maps.places.PlacesService(map);
        service2.getDetails(request2, callback2);

        function callback2(place2, status2) {
          if (status2 == google.maps.places.PlacesServiceStatus.OK) {
            input.value = place2.formatted_address;
            mapLabel.innerHTML = place2.formatted_address;
          }
        }
      }
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}


const sliderElem = document.getElementById('range-slider');
const thumbElem = document.getElementById('range-thumb');
const rangeInput = document.getElementById('size');
const tooltip = document.getElementById('tooltip');
const min = ~~rangeInput.min;
const max = ~~rangeInput.max;
const valueRange = rangeInput.value;
const rangeWidth = sliderElem.clientWidth;
const thumbWidth = thumbElem.clientWidth;
const sizeMinElem = document.querySelector('.form__size-min span');
const sizeMaxElem = document.querySelector('.form__size-max span');
let tooltipNumber = tooltip.querySelector('span');
let percent = 0;


tooltipNumber.innerHTML = valueRange;
thumbElem.style.left = - (thumbWidth / 2) + 'px';
sizeMinElem.innerHTML = min;
sizeMaxElem.innerHTML = max;

thumbElem.onmousedown = function(e) {
  const thumbCoords = getCoords(thumbElem);
  const shiftX = e.pageX - thumbCoords.left;
  const sliderCoords = getCoords(sliderElem);

  document.onmousemove = function(e) {
    let newLeft = e.pageX - shiftX - sliderCoords.left;

    // курсор ушёл вне слайдера
    if (newLeft < 0) {
      newLeft = 0;
      rangeInput.value = min;
    }
    let rightEdge = sliderElem.offsetWidth;
    if (newLeft > rightEdge) {
      newLeft = rightEdge;
      rangeInput.value = max;
    }

    thumbElem.style.left = newLeft - (thumbWidth / 2) + 'px';
    tooltip.style.left = newLeft + 'px';
    percent = ( Math.ceil(newLeft * 100 / (rangeWidth - 1) * 100) / 100 );
    rangeInput.value = Math.round(min + ((max - min) / 100 * percent));
    tooltip.style.bottom = Math.round(46 + ((64 - 46) / 100 * percent)) + 'px';
    tooltip.style.fontSize = Math.round(8 + ((24 - 8) / 100 * percent)) + 'px';
    tooltipNumber.innerHTML = rangeInput.value;
    sliderElem.style.backgroundImage = 'linear-gradient(90deg ,#FFE8A0 0%, #FE7D07 ' + percent +'%, #BEC3FE ' + percent + '%, #BEC3FE 100%)'
  }

  document.onmouseup = function() {
    document.onmousemove = document.onmouseup = null;
  };

  return false;
};

thumbElem.ondragstart = function() {
  return false;
};

function getCoords(elem) {
  let box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };

}
