import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  align-items: center;
  elevation: 5;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const InputContainer = styled.View`
  width: 100%;
  margin-bottom: 15px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  margin-bottom: 5px;
  color: #555;
`;

const StyledInput = styled.TextInput`
  width: 100%;
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
`;

const SaveButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: #ff6b6b;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const ImagePickerButton = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-width: 1px;
  border-color: #ddd;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const EditProfileModal = ({visible, onClose, profile, onUpdate}) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setEmail(profile.email || '');
    }
  }, [profile, visible]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.put(
        'http://3.34.59.23/api/v1/users/me',
        {
          nickname,
          email,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      Alert.alert('성공', '프로필이 업데이트되었습니다.');
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '프로필 업데이트에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <ModalContainer>
        <ModalContent>
          <ModalTitle>내 정보 수정</ModalTitle>
          <CloseButton onPress={onClose}>
            <Icon name="close" size={24} color="#555" />
          </CloseButton>

          <ImagePickerButton>
            {profile?.profileImage ? (
              <ProfileImage source={{uri: profile.profileImage}} />
            ) : (
              <Icon name="camera" size={40} color="#777" />
            )}
          </ImagePickerButton>

          <InputContainer>
            <InputLabel>닉네임</InputLabel>
            <StyledInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
            />
          </InputContainer>

          <InputContainer>
            <InputLabel>이메일</InputLabel>
            <StyledInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
            />
          </InputContainer>

          <SaveButton onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText>저장하기</ButtonText>
            )}
          </SaveButton>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default EditProfileModal;
