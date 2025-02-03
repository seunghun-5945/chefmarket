import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import Landing from "./screens/Landing";
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn"
import Home from "./screens/Home";
import FoodMap from "./screens/FoodMap";
import Profile from "./screens/Profile";
import Recipe from "./screens/Recipe"; 
import Trade from "./screens/Trade";
import TakePhoto from "./screens/TakePhoto";
import ChatRoom from "./screens/ChatRoom";
import Chat from "./screens/Chat";
import RegistProduct from "./screens/RegistProduct";
import DetailProduct from "./screens/DetailProduct";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 탭 네비게이터
const HomeStack = () => {
 return (
   <Tab.Navigator
     screenOptions={{
       tabBarActiveTintColor: '#eHomeModal91e63',
       tabBarInactiveTintColor: 'gray',
     }}
   >
    <Tab.Screen 
      name="홈" 
      component={Home}
      options={{
        headerTitle: "홈",
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
     <Tab.Screen 
       name="식료품거래" 
       component={Trade}
       options={{
         headerTitle: "식료품거래",
         tabBarIcon: ({ color, size }) => (
           <Icon name="cart" size={size} color={color} />
         ),
       }}
     />
     <Tab.Screen 
       name="레시피" 
       component={Recipe}
       options={{
         headerTitle: "레시피",
         tabBarIcon: ({ color, size }) => (
           <Icon name="flask" size={size} color={color} />
         ),
       }}
     />
     <Tab.Screen 
       name="채팅" 
       component={ChatRoom}
       options={{
         headerTitle: "채팅목록",
         tabBarIcon: ({ color, size }) => (
           <Icon name="chatbubble-ellipses-outline" size={size} color={color} />
         ),
       }}
     />
     <Tab.Screen 
       name="마이페이지" 
       component={Profile}
       options={{
         headerTitle: "마이페이지",
         tabBarIcon: ({ color, size }) => (
           <Icon name="person" size={size} color={color} />
         ),
       }}
     />
   </Tab.Navigator>
 );
};

const App = () => {
//  useEffect(() => {
//    SplashScreen.hide();
//  }, []);

 return (
   <NavigationContainer>
     <Stack.Navigator initialRouteName="Home">
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
         component={HomeStack}
         options={{ 
           headerShown: false,
         }}
       />
       <Stack.Screen 
         name="ChatRoom" 
         component={ChatRoom}
         options={{ 
           headerShown: true,
           headerTitle: "채팅방",
         }}
       />
        <Stack.Screen 
          name="Chat" 
          component={Chat}
          options={{ 
            headerShown: true,
            headerTitle: "채팅",
          }}
        />
        <Stack.Screen
          name="RegistProduct"
          component={RegistProduct}
          options={{
            headerShown: true,
            headerTitle: "상품등록",
          }}
        />
        <Stack.Screen
          name="DetailProduct"
          component={DetailProduct}
          options={{
            headerShown: true,
            headerTitle: ""
          }}
        />
     </Stack.Navigator>
   </NavigationContainer>
 );
};

export default App;