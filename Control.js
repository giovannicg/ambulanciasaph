import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ToastAndroid,
  TouchableOpacity,
  Alert,
  Linking 
} from "react-native";
import * as Location from 'expo-location';
import { API_APH } from "@env";

let current_route = '';
const Control = () => {
  const [userData, setUserData] = React.useState(null);

  const [isAvailable, setIsAvailable] = React.useState(false);

  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [isMapOpen, setIsMapOpen] = React.useState(false);

  React.useEffect(() => {
    getUserData();
    getAvailability();
  }, []);

  const url = Platform.select({
    android: `geo:${latitude},${longitude}?q=${address}`,
  })
  
  
  const getUserData = async () => {
    try {
      const response = await fetch(API_APH + "/api/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        const data = await response.json();
        setUserData(data);
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al obtener datos del usuario. Error: " + error.message);
    }
  };

  const getAvailability = async () => {
    try {
      const response = await fetch(API_APH + "/api/user/availability", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setIsAvailable(data.is_available);
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al obtener datos del usuario. Error: " + error.message);
    }
  };

  const handleResourceValueChange = async () => {
    try {
      const response = await fetch(API_APH + "/api/user/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
        body: JSON.stringify({ is_available: !isAvailable }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setIsAvailable(!isAvailable);
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al obtener datos del usuario. Error: " + error.message);
    }
  };
  //get available routes from api and alert user if new route found 
  //with yes or no option to accept or not the route and navigate to map if yes is selected or do nothing if no is selected 
  const GetAvailableRoutes = async () => {
    try {
      const response = await fetch(API_APH + "/api/routes/available", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        //alert new route found with yes or no
        //if yes, navigate to route
        //if no, do nothing
        if (data.routes.length == 0) {
          alert("No new routes found");
          return;
        } else {
          Alert.alert(
            "New Route Found: " + data.routes[0].emergency_address,
            "Do you want to accept this route?",
            [
              {
                text: "No",
                onPress: () => console.log("No Pressed"),
                style: "cancel",
              },
              {
                text: "Yes",
                onPress: () => {
                  current_route = data.routes[0];
                  setLatitude(current_route.emergency_latitude);
                  setLongitude(current_route.emergency_longitude);
                  setAddress(current_route.emergency_address);
                  setInterval(() => {
                    getLocationPermission();
                  }
                  , 3000);
                },
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al obtener datos del usuario. Error: " + error.message);
    }
  };
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
        console.log(latitude);
        console.log(longitude);
        setIsMapOpen(true);
        Linking.openURL(url);
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al iniciar ruta. Error: " + error.message);
    }
  };
  async function finalizarRuta() {
    setIsMapOpen(false);
    console.log("finalizar ruta");
  }
  //get location from user and send it to api to update route location 
  async function getLocationPermission(){
    let {status} = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      alert('Permission to access location was denied');
      return;
    }
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
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al iniciar ruta. Error: " + error.message);
    }    
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <View>
          <Text style={styles.title}>Bienvenido: {userData.name}</Text>
          <Text style={styles.subtitle}>Correo: {userData.email}</Text>
          <Text style={styles.subtitle}>Centro: {userData.center.name}</Text>
          <Text style={styles.subtitle}>
            Provincia: {userData.province.name}
          </Text>
          <Text style={styles.subtitle}>Zona: {userData.zone.name}</Text>
          <Text style={styles.subtitle}>
            Institucion: {userData.institution.name}
          </Text>
          <Text style={styles.subtitle}>
            Tipo de Usuario: {userData.usertype.name}
          </Text>
          <Text style={styles.subtitle}>
            Recurso: {userData.resource.name}
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.subtitle}>Habilitado?:</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isAvailable ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleResourceValueChange}
              value={isAvailable}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={GetAvailableRoutes}
          >
            <Text style={styles.buttonText}>Buscar Rutas</Text>
          </TouchableOpacity>

          {!isMapOpen && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={startRoute}
          >
            <Text style={styles.buttonText}>Abrir Mapa</Text>
          </TouchableOpacity>
          )}
          {isMapOpen && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={finalizarRuta}
          >
            <Text style={styles.buttonText}>Finalizar Ruta</Text>
          </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
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

export default Control;
