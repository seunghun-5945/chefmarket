import React, {useState, useEffect, useLayoutEffect} from 'react';
import {View, TouchableOpacity, Alert, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon5 from 'react-native-vector-icons/Fontisto';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LevelProgressBar from '../components/LevelProgressBar';
import EditProfileModal from '../components/EditProfileModal';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
  padding: 10px;
`;

const ImageFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin: 10px;
  border-radius: 15px;
  elevation: 3;
  padding: 20px;
`;

const StyledImage = styled.Image`
  width: 130px;
  height: 130px;
  border-radius: 65px;
  border-width: 3px;
  border-color: #ddd;
  margin-bottom: 10px;
`;

const ProfileName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const RoleText = styled.Text`
  font-size: 16px;
  color: gray;
`;

const IconContainer = styled.View`
  flex: 3;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 10px;
`;

const IconFrame = styled.TouchableOpacity`
  width: 30%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 15px;
  elevation: 2;
  padding: 10px;
`;

const IconText = styled.Text`
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
`;

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{marginRight: 15}}>
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLogout()}
            style={{marginRight: 15}}>
            <Icon2 name="logout" size={24} color="white" />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그인 화면으로 이동합니다.', [
      {text: '취소', style: 'cancel'},
      {
        text: '확인',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('accessToken');
            navigation.replace('Landing');
          } catch (error) {
            console.error('로그아웃 오류:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          'http://3.34.59.23/api/v1/permissions/check',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(response.data.trust_score);
        setTrustScore(response.data.trust_score);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.replace('Landing');
          return;
        }

        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {Authorization: `Bearer ${token}`},
        });

        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          navigation.replace('Landing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  const handleProfileUpdate = updatedProfile => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <Container>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>프로필을 불러오는 중...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />

      <ImageFrame>
        <StyledImage source={require('../assets/testImage/chefLogo.png')} />
        <ProfileName>{profile?.nickname}</ProfileName>
        <RoleText>{profile?.role}</RoleText>
        <LevelProgressBar trustScore={trustScore} />
      </ImageFrame>

      <IconContainer>
        <IconFrame>
          <Icon2 name="sell" size={30} color="black" />
          <IconText>{'판매\n목록'}</IconText>
        </IconFrame>
        <IconFrame>
          <Icon name="heart-sharp" size={30} color="red" />
          <IconText>{'좋아요한\n레시피'}</IconText>
        </IconFrame>
        <IconFrame>
          <Icon3 name="food-variant" size={30} color="gray" />
          <IconText>{'내가 올린\n레시피'}</IconText>
        </IconFrame>
        <IconFrame onPress={() => navigation.navigate('MyIngredient')}>
          <Icon3 name="food-apple" size={30} color="red" />
          <IconText>{'보관중인\n식재료'}</IconText>
        </IconFrame>
        <IconFrame onPress={() => navigation.navigate('MyIngredient')}>
          <Icon3 name="food-apple" size={30} color="red" />
          <IconText>{'나의\n식재료'}</IconText>
        </IconFrame>
        <IconFrame onPress={() => navigation.navigate('UploadIngredient')}>
          <Icon5 name="shopping-basket-add" size={30} color="gray" />
          <IconText>{'식재료\n등록'}</IconText>
        </IconFrame>
      </IconContainer>
    </Container>
  );
};

export default Profile;
