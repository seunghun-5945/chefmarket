import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Landing from "./screens/Landing";
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn"
import Home from "./screens/Home";

const Stack = createStackNavigator();

const App = () => {

  // useEffect(() => {
  //   // 스플래시 스크린을 바로 숨김
  //   SplashScreen.hide();
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen 
          name="Landing" 
          component={Landing} 
          options={{ 
            headerShown: false,
            headerTitle: '',
          }}
        />
        <Stack.Screen 
          name="SignIn" 
          component={SignIn} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{ 
            headerShown: true,
            headerTitle: "회원가입",
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ 
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;