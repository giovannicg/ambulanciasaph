import { NativeRouter, Routes, Route } from 'react-router-native';
import React from 'react';
import LoginScreen from './LogIn';
import Control from './Control';

let access_token = null;
let current_route = null;

const App = () => {
  
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<LoginScreen/> }/>
        <Route path="/control"  element={<Control/>} />
      </Routes>
    </NativeRouter>
    
  );
};

export default App;