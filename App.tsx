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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 탭 네비게이터
const HomeStack = () => {
 return (
   <Tab.Navigator
     screenOptions={{
       tabBarActiveTintColor: '#e91e63',
       tabBarInactiveTintColor: 'gray',
     }}
   >
     <Tab.Screen 
       name="홈" 
       component={Home}
       options={({ navigation }) => ({
         headerTitle: "홈",
         headerShown: true,
         headerRight: () => (
           <View style={{ flexDirection: 'row', marginRight: 15 }}>
             <TouchableOpacity 
               onPress={() => navigation.navigate('HomeModal')}
               style={{ marginHorizontal: 10 }}
             >
               <Icon name="home" size={24} color="black" />
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => navigation.navigate('MapModal')}
               style={{ marginHorizontal: 10 }}
             >
               <Icon name="map" size={24} color="black" />
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => navigation.navigate('ProfileModal')}
               style={{ marginHorizontal: 10 }}
             >
               <Icon name="person" size={24} color="black" />
             </TouchableOpacity>
           </View>
         ),
         tabBarIcon: ({ color, size }) => (
           <Icon name="home" size={size} color={color} />
         ),
       })}
     />
     <Tab.Screen 
       name="식료품탐색" 
       component={FoodMap}
       options={{
         headerTitle: "식료품탐색",
         tabBarIcon: ({ color, size }) => (
           <Icon name="map" size={size} color={color} />
         ),
       }}
     />
     <Tab.Screen 
       name="레시피" 
       component={Recipe}
       options={{
         headerTitle: "레시피",
         tabBarIcon: ({ color, size }) => (
           <Icon name="restaurant-menu" size={size} color={color} />
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
         component={HomeStack}
         options={{ 
           headerShown: false,
         }}
       />


       {/* 모달 스크린들 */}
       <Stack.Group screenOptions={{ presentation: 'modal' }}>
         <Stack.Screen 
           name="HomeModal" 
           component={Home}
           options={{
             headerTitle: "홈 모달",
           }}
         />
         <Stack.Screen 
           name="MapModal" 
           component={FoodMap}
           options={{
             headerTitle: "맛집지도 모달",
           }}
         />
         <Stack.Screen 
           name="ProfileModal" 
           component={Profile}
           options={{
             headerTitle: "프로필 모달",
           }}
         />
       </Stack.Group>
     </Stack.Navigator>
   </NavigationContainer>
 );
};

export default App;