import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import Postcode from '@actbase/react-daum-postcode';
import Geolocation from 'react-native-geolocation-service';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.ScrollView`
  width: 90%;
  max-height: 90%;
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  elevation: 5;
`;

const ContentContainer = styled.View`
  align-items: center;
  padding-bottom: 20px;
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
  z-index: 1;
`;

const InputContainer = styled.View`
  width: 100%;
  margin-bottom: 15px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
`;

const StyledInput = styled.TextInput`
  width: 100%;
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  background-color: ${props => (props.editable ? 'white' : '#f5f5f5')};
`;

const SaveButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: #ff6b6b;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
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
  overflow: hidden;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const NonEditableText = styled.Text`
  font-size: 12px;
  color: #888;
  margin-top: 3px;
  font-style: italic;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
  width: 100%;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const AddressButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
`;

const EditProfileModal = ({visible, onClose, profile, onUpdate}) => {
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // 주소 정보 관리 객체
  const [addressInfo, setAddressInfo] = useState({
    roadAddress: '',
    zipCode: '',
    longitude: '',
    latitude: '',
  });

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setUsername(profile.username || '');
      setEmail(profile.email || '');
      setAddressInfo({
        roadAddress: profile.address_name || '',
        zipCode: profile.zone_no || '',
        longitude: profile.location_lon ? profile.location_lon.toString() : '',
        latitude: profile.location_lat ? profile.location_lat.toString() : '',
      });
      setProfileImage(profile.profile_image || null);
    }
  }, [profile, visible]);

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setProfileImage(selectedAsset.uri);
        setSelectedImageFile({
          uri:
            Platform.OS === 'android'
              ? selectedAsset.uri
              : selectedAsset.uri.replace('file://', ''),
          type: selectedAsset.type || 'image/jpeg',
          name: selectedAsset.fileName || 'profile_image.jpg',
        });
      }
    } catch (error) {
      console.log('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 위치 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 필요',
            message: '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      try {
        const status = await Geolocation.requestAuthorization('whenInUse');
        return status === 'granted';
      } catch (err) {
        console.error('위치 권한 요청 에러:', err);
        return false;
      }
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('알림', '현재 위치를 가져오기 위해 위치 권한이 필요합니다.');
      return;
    }

    setIsLocationLoading(true);

    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        try {
          const response = await axios.get(
            `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
            {
              headers: {
                Authorization: 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99',
              },
            },
          );

          if (
            !response.data.documents ||
            response.data.documents.length === 0
          ) {
            throw new Error('주소 정보를 찾을 수 없습니다.');
          }

          const addressData = response.data.documents[0];
          setAddressInfo({
            roadAddress:
              addressData.road_address?.address_name ||
              addressData.address.address_name,
            zipCode: addressData.road_address?.zone_no || '',
            longitude: longitude.toString(),
            latitude: latitude.toString(),
          });
        } catch (error) {
          console.error('주소 변환 에러:', error);
          Alert.alert('오류', '현재 위치의 주소를 가져오는데 실패했습니다.');
        } finally {
          setIsLocationLoading(false);
        }
      },
      error => {
        console.error('위치 가져오기 에러:', error);
        Alert.alert('오류', 'GPS 위치를 가져오는데 실패했습니다.');
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10,
      },
    );
  };

  // 주소 선택 핸들러
  const handleAddressSelect = data => {
    const fullAddr = data.address || data.jibunAddress;
    const zipCode = data.zonecode;

    // 카카오 맵 API를 사용하여 좌표 변환
    axios
      .get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
          fullAddr,
        )}`,
        {
          headers: {
            Authorization: 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99',
          },
        },
      )
      .then(response => {
        if (response.data.documents && response.data.documents.length > 0) {
          const coords = response.data.documents[0];
          setAddressInfo({
            roadAddress: fullAddr,
            zipCode: zipCode,
            longitude: coords.x,
            latitude: coords.y,
          });
        } else {
          setAddressInfo({
            roadAddress: fullAddr,
            zipCode: zipCode,
            longitude: '',
            latitude: '',
          });
          Alert.alert(
            '알림',
            '좌표를 찾을 수 없습니다. 위치 정보 없이 주소만 저장됩니다.',
          );
        }
      })
      .catch(error => {
        console.error('좌표 변환 에러:', error);
        setAddressInfo({
          roadAddress: fullAddr,
          zipCode: zipCode,
          longitude: '',
          latitude: '',
        });
        Alert.alert('오류', '좌표 변환 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setShowAddressModal(false);
      });
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // FormData 객체 생성
      const formData = new FormData();

      // 텍스트 데이터 추가
      formData.append('nickname', nickname);
      formData.append('address_name', addressInfo.roadAddress);
      formData.append('zone_no', addressInfo.zipCode);

      // 숫자 데이터는 문자열로 변환해서 추가
      if (addressInfo.latitude) {
        formData.append('location_lat', parseFloat(addressInfo.latitude));
      }
      if (addressInfo.longitude) {
        formData.append('location_lon', parseFloat(addressInfo.longitude));
      }

      // 이미지 파일이 선택되었으면 추가
      if (selectedImageFile) {
        formData.append('profile_image', selectedImageFile);
      }

      // FormData 로깅 (디버깅용)
      console.log('FormData 내용:');
      formData._parts.forEach(part => {
        console.log(part[0], part[1]);
      });

      const response = await axios.put(
        'http://3.34.59.23/api/v1/users/me',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('성공', '프로필이 업데이트되었습니다.');
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);

      if (error.response) {
        console.log('서버 응답 오류:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

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
        {showAddressModal ? (
          <View
            style={{
              width: '90%',
              height: '90%',
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <CloseButton onPress={() => setShowAddressModal(false)}>
              <Icon name="close" size={24} color="#555" />
            </CloseButton>
            <Postcode
              style={{flex: 1, width: '100%', height: '100%'}}
              onSelected={handleAddressSelect}
              onError={error => {
                console.error('주소 검색 오류:', error);
                Alert.alert('오류', '주소 검색 중 오류가 발생했습니다.');
              }}
            />
          </View>
        ) : (
          <ModalContent>
            <ContentContainer>
              <ModalTitle>내 정보 수정</ModalTitle>
              <CloseButton onPress={onClose}>
                <Icon name="close" size={24} color="#555" />
              </CloseButton>

              <ImagePickerButton onPress={pickImage}>
                {profileImage ? (
                  <ProfileImage source={{uri: profileImage}} />
                ) : (
                  <Icon name="camera" size={40} color="#777" />
                )}
              </ImagePickerButton>

              {/* 유저네임 (수정 불가) */}
              <InputContainer>
                <InputLabel>유저네임</InputLabel>
                <StyledInput
                  value={username}
                  editable={false}
                  placeholder="유저네임"
                />
                <NonEditableText>수정할 수 없는 필드입니다</NonEditableText>
              </InputContainer>

              {/* 이메일 (수정 불가) */}
              <InputContainer>
                <InputLabel>이메일</InputLabel>
                <StyledInput
                  value={email}
                  editable={false}
                  placeholder="이메일을 입력하세요"
                  keyboardType="email-address"
                />
                <NonEditableText>수정할 수 없는 필드입니다</NonEditableText>
              </InputContainer>

              {/* 닉네임 (수정 가능) */}
              <InputContainer>
                <InputLabel>닉네임</InputLabel>
                <StyledInput
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="닉네임을 입력하세요"
                  editable={true}
                />
              </InputContainer>

              {/* 주소 섹션 */}
              <SectionTitle>주소 정보</SectionTitle>

              <InputContainer>
                <InputLabel>주소</InputLabel>
                <StyledInput
                  value={addressInfo.roadAddress}
                  placeholder="주소를 검색하세요"
                  editable={false}
                />
              </InputContainer>

              <InputContainer>
                <InputLabel>우편번호</InputLabel>
                <StyledInput
                  value={addressInfo.zipCode}
                  placeholder="우편번호"
                  editable={false}
                />
              </InputContainer>

              <ButtonContainer>
                <AddressButton
                  onPress={getCurrentLocation}
                  disabled={isLocationLoading}>
                  {isLocationLoading ? (
                    <ActivityIndicator size="small" color="#ff6b6b" />
                  ) : (
                    <>
                      <IconMaterial
                        name="gps-fixed"
                        size={20}
                        color="#555"
                        style={{marginRight: 5}}
                      />
                      <Text>내 위치</Text>
                    </>
                  )}
                </AddressButton>

                <AddressButton onPress={() => setShowAddressModal(true)}>
                  <IconMaterial
                    name="search"
                    size={20}
                    color="#555"
                    style={{marginRight: 5}}
                  />
                  <Text>주소 검색</Text>
                </AddressButton>

                <AddressButton onPress={getCurrentLocation}>
                  <IconMaterialCommunity
                    name="map-marker-radius"
                    size={20}
                    color="#555"
                    style={{marginRight: 5}}
                  />
                  <Text>지도 찾기</Text>
                </AddressButton>
              </ButtonContainer>

              <InputContainer>
                <InputLabel>위도</InputLabel>
                <StyledInput
                  value={addressInfo.latitude}
                  placeholder="위도"
                  editable={true}
                  keyboardType="numeric"
                  onChangeText={text =>
                    setAddressInfo(prev => ({...prev, latitude: text}))
                  }
                />
              </InputContainer>

              <InputContainer>
                <InputLabel>경도</InputLabel>
                <StyledInput
                  value={addressInfo.longitude}
                  placeholder="경도"
                  editable={true}
                  keyboardType="numeric"
                  onChangeText={text =>
                    setAddressInfo(prev => ({...prev, longitude: text}))
                  }
                />
              </InputContainer>

              <SaveButton onPress={handleSave} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ButtonText>저장하기</ButtonText>
                )}
              </SaveButton>
            </ContentContainer>
          </ModalContent>
        )}
      </ModalContainer>
    </Modal>
  );
};

export default EditProfileModal;
