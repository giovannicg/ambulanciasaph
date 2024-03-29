import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ToastAndroid,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigate  } from 'react-router-native';
import { API_APH } from "@env";

/**
 * Renders a control component that displays user data and allows the user to update their availability and search for routes.
 *
 * @returns {JSX.Element} The rendered control component.
 */
const Control = () => {
  const [userData, setUserData] = React.useState(null);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    getUserData();
    getAvailability();
  }, []);

  /**
   * Fetches user data from the API and sets the retrieved data in the state.
   *
   * @param {string} access_token - The access token used for authentication.
   * @return {void} This function does not return a value.
   */
  const getUserData = async () => {
    try {
      const response = await fetch(API_APH + "/api/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
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

  /**
   * Fetches the availability of a user from the API.
   *
   * @returns {Promise<void>} - A promise that resolves when the availability is fetched successfully.
   */
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

/**
 * Handles the change of the resource value asynchronously.
 *
 * @return {Promise<void>} - A promise that resolves when the resource value change is handled.
 */
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

  /**
   * Retrieves the available routes from the API.
   *
   * @return {Promise} A promise that resolves to the available routes.
   */
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
          alert("No hay rutas disponibles");
          return;
        } else {
          Alert.alert(
            "Nueva ruta encontrada: " + data.routes[0].emergency_address,
            "Quieres aceptar esta ruta?",
            [
              {
                text: "No",
                onPress: () => console.log("No Pressed"),
                style: "cancel",
              },
              {
                text: "Si",
                onPress: () => {
                  current_route = data.routes[0];
                  navigate('/mapa');
                  
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

  return (
    <View style={styles.container}>
      {userData ? (
        <View>
          <Text style={styles.title}>{userData.name}</Text>
          <Text style={styles.subtitle}>Correo: {userData.email}</Text>
          <Text style={styles.subtitle}>Centro: {userData.center.name}</Text>
          <Text style={styles.subtitle}>Provincia: {userData.province.name}</Text>
          <Text style={styles.subtitle}>Zona: {userData.zone.name}</Text>
          <Text style={styles.subtitle}>Institución: {userData.institution.name}</Text>
          <Text style={styles.subtitle}>Tipo de usuario: {userData.usertype.name}</Text>
          <Text style={styles.subtitle}>Recurso: {userData.resource.name}</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.subtitle}>Disponibilidad:</Text>
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
        </View>
      ) : (
        <Text>Cargando...</Text>
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
