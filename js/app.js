// Global variables
let map, infoWindow;
let markers = [];
const startLat = 29.2903652;
const startLng = -94.8072069;

// List View defaults
let mainListView = [
  {
    name: "Willie G's Seafood & Steaks",
    location: {
      lat: 29.309499911980758,
      lng: -94.79283992444698
    }
  },
  {
    name: "Salsas Mexican & Seafood Restaurant",
    location: {
      lat: 29.275437059335676,
      lng: -94.81166352542532
    }
  },
  {
    name: "Landry’s Seafood House",
    location: {
      lat: 29.27074508184604,
      lng: -94.81979539851396
    }
  },
  {
    name: "Seafood Shack",
    location: {
      lat: 29.308176,
      lng: -94.80148
    }
  },
  {
    name: "BLVD. Seafood",
    location: {
      lat: 29.286536547339807,
      lng: -94.79393184698684
    }
  },
  {
    name: "Fabian Seafood",
    location: {
      lat: 29.295351,
      lng: -94.7916
    }
  },
  {
    name: "Joes Seafood & Restaurant",
    location: {
      lat: 29.296008066666666,
      lng: -94.808261
    }
  },
  {
    name: "Cajun Greek - Seafood",
    location: {
      lat: 29.27662529590058,
      lng: -94.83144941782639
    }
  },
  {
    name: "Miller's Seawall Grill",
    location: {
      lat: 29.29321890990014,
      lng: -94.78440393712224
    }
  },
  {
    name: "Outriggers Seafood Bar & Grill",
    location: {
      lat: 29.54990655901679,
      lng: -95.02352648493655
    }
  },
  {
    name: "Gaido's",
    location: {
      lat: 29.2794179,
      lng: -94.8046088
    }
  },
  {
    name: "Shrimp 'N Stuff Downtown",
    location: {
      lat: 29.3065016,
      lng: -94.7938907
    }
  },
  {
    name: "Benno's",
    location: {
      lat: 29.2982168,
      lng: -94.7782856
    }
  },
  {
    name: "Saltwater Grill",
    location: {
      lat: 29.3050748,
      lng: -94.790656
    }
  },
  {
    name: "Fisherman's Wharf",
    location: {
      lat: 29.3090404,
      lng: -94.7936206
    }
  }
];

// Callback to initialize map
function initMap() {
  // New Google Map object
  map = new google.maps.Map(document.getElementById( 'map' ), {
    center: { lat: startLat, lng: startLng },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create new InfoWindow object
  infoWindow = new google.maps.InfoWindow();

  for ( var i = 0; i < mainListView.length; i++ ) {
    (function() {
      // Create marker for each item
      let marker = new google.maps.Marker({
        map: map,
        title: mainListView[i].name,
        position: mainListView[i].location,
        animation: google.maps.Animation.DROP
      });

      // Store markers in array
      markers.push( marker );

      // Store marker object in each default list view entry
      mainListView[i].marker = marker;

      // Add listener to marker
      marker.addListener('click', function() {
        populateInfoWindow( this, infoWindow );
        infoWindow.setContent( iwContent );
      });

      // Populate marker InfoWindow
      function populateInfoWindow(marker, infoWindow) {
        if (infoWindow.marker != marker) {
          infoWindow.marker = marker;
          infoWindow.setContent(marker.iwContent);

          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            marker.setAnimation(null);
          }, 1500);

          infoWindow.open(map, marker);

          // Attaches listener to close InfoWindow
          // when user clicks the x on the window
          infoWindow.addListener('closeclick', function() {
            infoWindow.setMarker = null;
          });
        }
      }

      let iwContent;

      // JQuery AJAX using FourSquare api
      // Populates InfoWindow with FourSquare info
      $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        dataType: 'json',
        data: {
          client_id: 'ZDS3FWZNICFJZJE2VFD0UK5XTTWHR0GFXH5OFNP0R3YZGNW4',
          client_secret: 'XUJS0L0ZCKDBLG3QOAGFKDEES1ALQL212XRQ4HXFBD2FN5E0',
          query: mainListView[i].name,
          near: 'Galveston',
          v: 20180603
        },
        success: function( data ) {
          let venue = data.response.venues;

          iwContent = '<div class="infowindow"><strong>' +
          venue[0].name + '</strong><br>' +
          venue[0].location.formattedAddress[0] + '<br>' +
          venue[0].location.formattedAddress[1] + '<br>' +
          '<a id="fs-link" href="https://foursquare.com/v/' + venue[0].id + '">Check it out here...</a>';

          marker.iwContent;
        },
        error: function( err ) {
          // Sends to errorHandling function
          errorHandling( 'FourSquare request', err );
        }
      });
    })(i);
  }
}

// Constructor/Model
let Restaurant = function( data ) {
  let self = this;
  this.title = data.name;
  this.location = data.location;
  this.show = ko.observable(true);
}

// ViewModel
let ViewModel = function() {
  // Allows access to 'this' from within other local operations
  let self = this;

  // Declaring KO variables
  this.restaurants = ko.observableArray();
  this.userInput = ko.observable('');

  // Create a new instance of the Model for each location
  // and store to KO array for DOM
  for (var i = 0; i < mainListView.length; i++) {
    let restaurant = new Restaurant( mainListView[i] );
    self.restaurants.push( restaurant );
  }

  // KnockoutJS filter box functionality
  this.filter = ko.computed(function() {
    let input = self.userInput().toLowerCase();

    for ( var a = 0; a < self.restaurants().length; a++ ) {
      if (self.restaurants()[a].title.toLowerCase().indexOf( input ) > -1 ) {
        self.restaurants()[a].show( true );
        if ( markers[a] ) {
          markers[a].setVisible( true );
        }
      } else {
        self.restaurants()[a].show( false );
        if ( markers[a] ) {
          markers[a].setVisible( false );
        }
      }
    }
  });

  // Links the clicked ListView item with its map marker
  this.popMarker = function( restaurant ) {
    let index = mainListView.map(e => e.name).indexOf(restaurant.title);
    google.maps.event.trigger( mainListView[index].marker, 'click' );
  }
}

// Allows error handling in one method,
// instead of writing code each time
function errorHandling( subj, err ) {
  console.log( 'Issue with ' + subj + ': ' + err );
  // Compile error HTML
  const errorHtml = '<span class="error-msg">Issue with ' + subj + ': ' + err + '</span>';
  // Adds error msg to pre-defined element in DOM
  document.getElementById( 'error-handling' ).HTML( errorHtml );
}

// Applies KO bindings for use with DOM
ko.applyBindings( ViewModel );
