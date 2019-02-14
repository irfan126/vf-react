import React from 'react';
import { Cacher } from '../../services/cacher';


import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle,
  InfoWindow
} from "react-google-maps";

function MapCompnent(props) {

 const {coordinates, isError, isLocationLoaded} = props;

   return (
        <GoogleMap
          defaultZoom={15}
          defaultCenter={coordinates}
          center={coordinates}
          options={{disableDefaultUI: isError ? true : false}}
        >
          <Marker
            position={coordinates}
          />

          {isLocationLoaded && !isError && <Circle
            center={coordinates}
            radius={100}
          />}
          {isLocationLoaded && isError && 
            <InfoWindow position={coordinates} options={{maxWidth: 300}}> 
            <div>
                Sorry, there is a problem finding the location on the map. 
                We are trying to resolve the problem as soon as possible.
                Contact host for additional information if you are interested in booking this place.
                We are sorry for any inconvenience.
            </div>
          </InfoWindow>}
        </GoogleMap>
    )
}

function withGeocode(WrappedComponent) {
  return class extends React.Component {

    constructor() {
      super();

      this.cacher = new Cacher();
      this.state = {
        coordinates:{
          lat: 0,
          lng: 0
        },
        isError: false,
        isLocationLoaded: false
      }
    }

    componentWillMount() {
      this.getGeocodedLocation();
    }

    updateCoordinates(coordinates) {
      this.setState({
        coordinates,
        isLocationLoaded: true
      })
    }

    geocodeLocation(location) {
      const geocoder = new window.google.maps.Geocoder();
   
        return new Promise((resolve, reject) => {
              geocoder.geocode({address: location}, (result, status) => {
  
                if (status === 'OK') {
                    const geometry = result[0].geometry.location;
                    const coordinates = { lat: geometry.lat(), lng: geometry.lng()};
                    
                    this.cacher.cacheValue(location, coordinates);

                    resolve(coordinates);
                  } else {
                    reject('ERROR!!!!!!')
                  }

                });
        });
    }

    getGeocodedLocation() {
      const location = this.props.location;

      // if location is cached return cached values
      if (this.cacher.isValueCached(location)) {
        this.updateCoordinates(this.cacher.getCachedValue(location));

        // else geocode location
      } else {
          this.geocodeLocation(location).then(
            (coordinates) =>{
              this.updateCoordinates(coordinates);
            },
            (error) => {
              this.setState({isError: true, isLocationLoaded: true});
            });
      }
    }

    render(){
      return(
          <WrappedComponent {...this.state}/>
        )
    }
  }
}

export const MapWithGeocode = withScriptjs(withGoogleMap(withGeocode(MapCompnent)));

