import React, {useEffect, useState, useCallback} from 'react';
import {View, TouchableOpacity, RefreshControl} from 'react-native';
import {Text} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useLayoutEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatListBox from '../components/ChatListBox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const HeaderText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #999;
  text-align: center;
  margin-bottom: 20px;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: lightsalmon;
  padding: 12px 20px;
  border-radius: 5px;
`;

const LoginButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const ChatRoom = () => {
  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MapModal')}
            style={{marginHorizontal: 10}}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileModal')}
            style={{marginHorizontal: 10}}>
            <Icon name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // Check login status on initial load
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen is focused
      checkLoginStatus();
      if (isLoggedIn) {
        // Trigger refresh of chat list when screen is focused
        handleRefresh();
      }

      return () => {
        // This will run when the screen loses focus (optional cleanup)
      };
    }, [isLoggedIn]),
  );

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      setIsLoggedIn(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Add a slight delay to show the refresh indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkLoginStatus();
    // Add any other refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleLogin = () => {
    navigation.navigate('Login', {
      returnScreen: 'ChatRoom',
    });
  };

  if (!isLoggedIn) {
    return (
      <Container>
        <HeaderText>채팅</HeaderText>
        <EmptyContainer>
          <EmptyText>채팅 기능을 이용하려면 로그인이 필요합니다.</EmptyText>
          <LoginButton onPress={handleLogin}>
            <LoginButtonText>로그인하기</LoginButtonText>
          </LoginButton>
        </EmptyContainer>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderText>채팅</HeaderText>
      <View style={{flex: 1}}>
        <ChatListBox
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </Container>
  );
};

export default ChatRoom;
