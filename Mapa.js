import * as React from 'react';
import * as Location from 'expo-location';
import { Alert, StyleSheet,View,TouchableOpacity,Text } from 'react-native';
import MapView,{Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useNavigate  } from 'react-router-native';
import {GOOGLE_MAPS_KEY,API_APH } from '@env';


const ambulanceIcon = require('./assets/image/ambulance.png');
const hospitalIcon = require('./assets/image/hospital.png');
const emergenceIcon = require('./assets/image/emergencia.png');

/**
 * Renders a map view with markers for the origin, emergency location, and destination.
 * Allows the user to start and finish a route and update the current location.
 *
 * @return {View} The rendered map view with markers and buttons.
 */
const Mapa= () =>  {
  const [origin, setOrigin] = React.useState({
    latitude:parseFloat(current_route.start_latitude),
    longitude: parseFloat(current_route.start_longitude)
  });
  const [emergency, setEmergency] = React.useState({
    latitude: parseFloat(current_route.emergency_latitude), 
    longitude: parseFloat(current_route.emergency_longitude)
  });
  const [destination, setdestination] = React.useState({
    latitude: parseFloat(current_route.destination_latitude), 
    longitude: parseFloat(current_route.destination_longitude)
  });

  const [isInEmergency, setisInEmergency] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const interval = setInterval(() => {
      getLocation();
      console.log('This will run every second!');
    }, 3000);
    //prompt yes no to start route
    Alert.alert(
      "Iniciar ruta",
      "¿Desea iniciar la ruta?",
      [
        {
          text: "No",
          onPress: () => {console.log("No Pressed"); clearInterval(interval);},
          style: "cancel",
          
        },
        {
          text: "Si",
          onPress: () => {
            startRoute();
            getPermission();
          },
        },
      ],
      { cancelable: false }
    );
    return () => clearInterval(interval);
  }, []);

  //function startRoute calls api with put method to start route
  /**
   * This code defines a function called startRoute which makes an API request to start a route.
   *  It uses the fetch function to send a PUT request to a specific API endpoint. 
   * The request includes headers with the content type and an authorization token. 
   * If the response status is 200, it alerts "Ruta iniciada" (route started). 
   * If there is an error or the response status is not 200, it throws an error and alerts the error message.
   */
  const startRoute = async () => {
    try {
      const response = await fetch(API_APH + "/api/routes/"+current_route.id+"/start", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        alert("Ruta iniciada");
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al iniciar ruta. Error: " + error.message);
    }
  };

  /**
   * Requests foreground permissions for location access.
   *
   * @return {Promise} An async function that resolves with the status of the permission request.
   */
  async function getPermission(){
    let {status} = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      alert('Permission to access location was denied');
    }
  }
  /**
   * Retrieves the current location and sends it to the server.
   *
   * @return {Promise<void>} No return value.
   */
  async function getLocation(){  
    let location = await Location.getCurrentPositionAsync({});
    try {
      const response = await fetch(API_APH + "/api/routes/"+current_route.id+"/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify({
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString()
        })
      });
      
      if (response.status === 200) {
        const data = await response.json();
        setOrigin({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al iniciar ruta. Error: " + error.message);
    }    
    
  }
/**
 * An asynchronous function that performs the "Recogido" operation.
 *
 * @return {Promise<void>} - A Promise that resolves when the operation is complete.
 */
  async function Recogido(){
    try {
      const response = await fetch(API_APH + "/api/routes/"+current_route.id+"/informPickedUp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        setisInEmergency(true);
        alert("Recogido");
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al iniciar ruta. Error: " + error.message);
    }
  }


  /**
   * Finalizes the route.
   *
   * @return {Promise<void>} - Resolves when the route is finished successfully.
   */
  async function finalizarRuta(){
    try {
      const response = await fetch(API_APH + "/api/routes/"+current_route.id+"/finish", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        navigate('/control');
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al finalizar ruta. Error: " + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <MapView 
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={styles.map}

      >
        <Marker
          coordinate={origin}
          image={ambulanceIcon}
        />
        <Marker
          coordinate={emergency}
          image={emergenceIcon}
        />
        <Marker
          coordinate={destination}
          image={hospitalIcon}
        />
        <MapViewDirections
          origin={origin}
          destination= {emergency}
          apikey={GOOGLE_MAPS_KEY}
          strokeColor='red'
          strokeWidth={3}
         />
         <MapViewDirections
          origin={emergency}
          destination= {destination}
          apikey={GOOGLE_MAPS_KEY}
          strokeColor='blue'
          strokeWidth={3}
         />
        </MapView>
      {!isInEmergency && (

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={Recogido}
          >
            <Text style={styles.buttonText}>Recogido</Text>
          </TouchableOpacity>
          )}
          {isInEmergency && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={finalizarRuta}
          >
            <Text style={styles.buttonText}>Finalizado</Text>
          </TouchableOpacity>
          )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map:{
    width: '100%',
    height: '90%'
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 20,
    minWidth: "50%",
  },
  TouchableOpacityStyle: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 30,
  },
});

export default Mapa;
