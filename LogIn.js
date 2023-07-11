import React, { useState } from 'react';
import { TouchableOpacity,View, TextInput,Text,StyleSheet } from 'react-native';
import {API_APH} from '@env';
import { useNavigate  } from 'react-router-native';

/**
 * Renders the login screen and handles the login functionality.
 *
 * @return {ReactElement} The rendered login screen.
 */
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

/**
 * Realize a post request to the API_APH/api/login API with the email and password data and display the bearer token received in the console using fetch.
 *
 * @return {Promise<void>} No return value.
 */
  const handleLogin = async () => {
    //realizar un request de tipo post a la api DE API_APH/api/login con los datos de email y password y mostrar el baerer token recibido en la consola
    //utilizando fetch
    console.log(JSON.stringify({ email, password }));
    const response = await fetch(API_APH+'/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if(response.status==200){
      const data = await response.json();
      access_token = data.access_token;
      navigate('/control');
    }else{
      alert('Credenciales inválidas. Inténtalo de nuevo.');
    }    
  };

  return (
    <View style={styles.container}>
      <View style={styles.login}>
        <Text style={styles.title}>Inicio de Sesión</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          autoCompleteType="email" 
          textContentType="emailAddress" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          autoCompleteType="password" 
          textContentType="password" 
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  login: {
    width: 350,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;