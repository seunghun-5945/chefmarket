import React, {useEffect} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Landing from './screens/Landing';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Home from './screens/Home';
import FoodMap from './screens/FoodMap';
import Profile from './screens/Profile';
import Recipe from './screens/Recipe';
import Trade from './screens/Trade';
import TakePhoto from './screens/TakePhoto';
import ChatRoom from './screens/ChatRoom';
import Chat from './screens/Chat';
import RegistProduct from './screens/RegistProduct';
import GroupPurchases from './screens/GroupPurchases';
import DetailProduct from './screens/DetailProduct';
import UploadIngredient from './screens/UploadIngredient';
import MyIngredient from './screens/MyIngredient';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 공통 헤더 스타일
const commonHeaderOptions = {
  headerTitle: 'ChefMarket',
  headerTitleAlign: 'left',
  headerTitleStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Niconne',
  },
  headerStyle: {
    backgroundColor: '#D9534F', // 원하는 배경색 코드
    elevation: 0, // Android 그림자 제거
    shadowOpacity: 0, // iOS 그림자 제거
  },
  headerTintColor: 'white', // 헤더의 텍스트와 아이콘 색상
  headerLeft: () => null,
};

// 탭 네비게이터
const HomeStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D9534F',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarLabelStyle: {
          marginTop: 8, // 아이콘과 텍스트 사이 간격 조절
          fontSize: 12, // 텍스트 크기도 선택적으로 조절 가능
        },
        ...commonHeaderOptions,
      }}>
      <Tab.Screen
        name="홈"
        component={Home}
        options={{
          ...commonHeaderOptions,
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="식료품거래"
        component={Trade}
        options={{
          ...commonHeaderOptions,
          tabBarIcon: ({color, size}) => (
            <Icon name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="레시피"
        component={Recipe}
        options={{
          ...commonHeaderOptions,
          tabBarIcon: ({color, size}) => (
            <Icon name="flask" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="채팅"
        component={ChatRoom}
        options={{
          ...commonHeaderOptions,
          tabBarIcon: ({color, size}) => (
            <Icon
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="마이페이지"
        component={Profile}
        options={{
          ...commonHeaderOptions,
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={commonHeaderOptions}>
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="ChatRoom" component={ChatRoom} />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="RegistProduct"
          component={RegistProduct}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="GroupPurchases"
          component={GroupPurchases}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="DetailProduct"
          component={DetailProduct}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="TakePhoto"
          component={TakePhoto}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="UploadIngredient"
          component={UploadIngredient}
          options={{
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="MyIngredient"
          component={MyIngredient}
          options={{
            headerLeft: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
