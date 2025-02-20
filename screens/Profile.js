import React, {useState, useEffect, useLayoutEffect} from 'react';
import {View, TouchableOpacity, Alert, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import Icon5 from 'react-native-vector-icons/Fontisto';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: lightgray;
  gap: 5px;
`;

const ImageFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: space-around;
  background-color: white;
`;

const StyledImage = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: 120px;
  height: 120px;
  border-radius: 60px;
`;

const Reliabillity = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const IconContainer = styled.View`
  flex: 3;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 3px;
`;

const IconFrame = styled.TouchableOpacity`
  width: 24%;
  height: 49%;
  align-items: center;
  justify-content: space-around;
  padding: 15px;

  background-color: white;
`;

const EtcFrame = styled.View`
  flex: 3;
  background-color: white;
  padding: 10px;
`;

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity
            onPress={() => Alert.alert('설정', '설정 화면으로 이동합니다.')}
            style={{marginRight: 15}}>
            <Icon name="settings" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLogout()}
            style={{marginRight: 15}}>
            <Icon2 name="logout" size={24} color="black" />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그인 화면으로 이동합니다.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('accessToken');
            navigation.replace('Landing');
          } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('Token:', token);

        if (!token) {
          navigation.replace('Landing');
          return;
        }

        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API Response:', response.data);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });

        if (err.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          navigation.replace('Landing');
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  if (loading) {
    return (
      <Container>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>프로필을 불러오는 중...</Text>
        </View>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>프로필을 불러올 수 없습니다</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ImageFrame>
        <StyledImage
          source={require('../assets/testImage/chefLogo.png')}
          resizeMode="cover"
        />
        <Text style={{fontSize: 25}}>{profile.nickname}</Text>
      </ImageFrame>
      <Reliabillity>
        <Text>{profile.role}</Text>
      </Reliabillity>
      <IconContainer>
        <IconFrame>
          <Icon2 name="sell" size={30} color="black" />
          <Text>판매 목록</Text>
        </IconFrame>
        <IconFrame>
          <Icon name="heart-sharp" size={30} color="red" />
          <Text style={{textAlign: 'center'}}>좋아요한 레시피</Text>
        </IconFrame>
        <IconFrame>
          <Icon3 name="food-variant" size={30} color="gray" />
          <Text style={{textAlign: 'center'}}>내가 올린 레시피</Text>
        </IconFrame>
        <IconFrame onPress={() => navigation.navigate('MyIngredient')}>
          <Icon3 name="food-apple" size={30} color="red" />
          <Text style={{textAlign: 'center'}}>보관중인 식재료</Text>
        </IconFrame>
        <IconFrame onPress={() => navigation.navigate('UploadIngredient')}>
          <Icon5 name="shopping-basket-add" size={30} color="gray" />
          <Text style={{textAlign: 'center'}}>식재료 등록</Text>
        </IconFrame>
        <IconFrame>
          <Icon3 name="food-variant" size={30} color="gray" />
          <Text style={{textAlign: 'center'}}>내가 올린 레시피</Text>
        </IconFrame>
        <IconFrame>
          <Icon3 name="food-variant" size={30} color="gray" />
          <Text style={{textAlign: 'center'}}>내가 올린 레시피</Text>
        </IconFrame>
        <IconFrame>
          <Icon3 name="food-variant" size={30} color="gray" />
          <Text style={{textAlign: 'center'}}>내가 올린 레시피</Text>
        </IconFrame>
      </IconContainer>
      <EtcFrame>
        <Text>상세정보</Text>
        <Text>이름: {profile.nickname}</Text>
        <Text>이메일: {profile.email}</Text>
      </EtcFrame>
    </Container>
  );
};

export default Profile;
