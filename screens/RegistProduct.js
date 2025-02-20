import React, { useState } from 'react';
import { TouchableOpacity, Platform, PermissionsAndroid, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import Postcode from '@actbase/react-daum-postcode';
import Address from '../components/Address';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Container = styled.View`
  flex: 1;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: 10px;
  margin-bottom: ${props => props.keyboardOpen ? '0px' : '80px'};
`;

const ImageContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 0px;
`;

const SelectedImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 5px;
`;

const StyledButton = styled.TouchableOpacity`
  flex-direction: row;
  border-radius: 5px;
  margin-right: 10px;
  align-items: center;
  border: 1px solid lightgray;
  padding: 10px;
  gap: 5px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  padding: 10px 10px 10px 0px;
`;

const StyledText = styled.Text` 
  font-weight: bold;
  font-size: 20px;
  margin: 15px 0px 10px 0px;
`;

const InputBox = styled.TextInput`
  border: 1px solid lightgray;
  border-radius: 5px;
  padding: 15px;
`;

const DetailInputBox = styled.TextInput`
  border: 1px solid lightgray;
  border-radius: 5px;
  padding: 10px;
  min-height: 100px;
`;

const RegistButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const RegistButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 5px;
  background-color: salmon;
`;

const RegistText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const RegistProduct = () => {
  const [images, setImages] = useState([]); // 1.사진
  const [ingredientId, setIngredientId] = useState(0);  // 2.유저 고유 id 값 - jwt로 받아 올거임
  const [ingredientName, setIngredientName] = useState(''); // 3.식재료 이름인데 그냥 제목으로 할까보다
  const [seelerId, setSellerId] = useState(); // 4.판매자 id - jwt로 받아올거임
  const [value, setValue] = useState(0); // 5. 가격
  const [title, setTitle] = useState(''); // 제목으로 만든건데 이거 대신에 3. ingredientName 들어갈거임
  const [addressInfo, setAddressInfo] = useState({  // 번외. 위치정보 (lat, lon 빼고는 내가 쓸거임)
    roadAddress: '',
    zipCode: '',
    longitude: '',
    latitude: ''
  });
  const [longitude, setLongitude] = useState(0);  // 6.위도 정보
  const [latitude, setLatitude] = useState(0) // 7.경도 정보
  const [contents, setContents] = useState(''); // 9. 상세정보
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // 갤러리 권한 요청
  const checkGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "ChefMarket 권한 요청",
            message: "사진 선택을 위해 갤러리 접근 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "거부",
            buttonPositive: "허용"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openGallery();
        } else {
          alert('갤러리 접근 권한이 필요합니다.');
        }
      } catch (err) {
        console.warn(err);
        alert('권한 요청 중 오류가 발생했습니다.');
      }
    } else {
      openGallery();
    }
  };

  // 카메라 권한 요청
  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "ChefMarket 카메라 권한 요청",
            message: "사진 촬영을 위해 카메라 접근 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "거부",
            buttonPositive: "허용"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera();
        } else {
          alert('카메라 접근 권한이 필요합니다.');
        }
      } catch (err) {
        console.warn(err);
        alert('권한 요청 중 오류가 발생했습니다.');
      }
    } else {
      openCamera();
    }
  };

  // 갤러리 열기
  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 5 - images.length,
      quality: 1.0,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      
      if (response.errorMessage) {
        alert('이미지 선택 중 오류가 발생했습니다: ' + response.errorMessage);
        return;
      }

      if (response.assets) {
        if (images.length + response.assets.length > 5) {
          alert('최대 5장까지만 선택할 수 있습니다.');
          return;
        }
        setImages(prevImages => [...prevImages, ...response.assets]);
      }
    });
  };

  // 카메라 열기
  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 1.0,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) return;
      
      if (response.errorMessage) {
        alert('카메라 오류: ' + response.errorMessage);
        return;
      }

      if (response.assets) {
        if (images.length >= 5) {
          alert('최대 5장까지만 선택할 수 있습니다.');
          return;
        }
        setImages(prevImages => [...prevImages, ...response.assets]);
      }
    });
  };

  // 이미지 삭제
  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  // 이미지 업로드 함수
  const uploadImages = async () => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('file', {
          uri: image.uri,
          type: image.type,
          name: image.fileName || `image${index}.jpg`
        });
      });
  
      // sales API로 직접 이미지와 함께 데이터 전송
      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) throw new Error('이미지 업로드 실패');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('이미지 업로드 에러:', error);
      throw error;
    }
  };

  // 위치 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "위치 권한 필요",
            message: "현재 위치를 가져오기 위해 위치 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "취소",
            buttonPositive: "확인"
          }
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
        alert('현재 위치를 가져오기 위해 위치 권한이 필요합니다.');
        return;
      }
  
      setIsLocationLoading(true);
  
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
              {
                headers: {
                  'Authorization': 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99'
                }
              }
            );
  
            if (!response.data.documents || response.data.documents.length === 0) {
              throw new Error('주소 정보를 찾을 수 없습니다.');
            }
  
            const addressInfo = response.data.documents[0];
            setAddressInfo({
              roadAddress: addressInfo.address.address_name,
              zipCode: addressInfo.road_address?.zone_no || '',
              longitude: longitude.toString(),
              latitude: latitude.toString()
            });
          } catch (error) {
            console.error('주소 변환 에러:', error);
            alert('현재 위치의 주소를 가져오는데 실패했습니다.');
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          console.error('위치 가져오기 에러:', error);
          alert('GPS 위치를 가져오는데 실패했습니다.');
          setIsLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10
        }
      );
    };
  
      // 주소 선택 핸들러
  const handleAddressSelect = (addressData) => {
    setAddressInfo(addressData);
    setShowAddressModal(false);
  };

  // 게시글 등록 함수
  const handleSubmit = async () => {
    if (!addressInfo.roadAddress) {
      alert('주소를 입력해주세요.');
      return;
    }
    if (!title || !ingredientName || !value || !contents) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
  
    if (images.length === 0) {
      alert('최소 1장의 이미지를 등록해주세요.');
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      // 이미지 파일들 추가
      images.forEach((image, index) => {
        formData.append('file', {
          uri: image.uri,
          type: image.type,
          name: image.fileName || `image${index}.jpg`
        });
      });
  
      // 나머지 데이터 추가
      formData.append('ingredient_id', 0);  // API 문서에 있는 필수 필드들
      formData.append('ingredient_name', ingredientName);
      formData.append('seller_id', 0);
      formData.append('value', Number(value));
      formData.append('location_lat', Number(addressInfo.latitude));
      formData.append('location_lon', Number(addressInfo.longitude));
      formData.append('expiry_date', new Date().toISOString().split('T')[0]);
      formData.append('status', 'Available');
      formData.append('contents', contents);
  
      // API 호출
      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) throw new Error('게시글 등록 실패');
      
      alert('게시글이 성공적으로 등록되었습니다.');
      // 성공 후 처리 (예: 페이지 이동)
      
    } catch (error) {
      console.error('등록 에러:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeContainer>
      {showAddressModal && (
        <Postcode
          style={{ width: '100%', height: '100%' }}
          onSelected={handleAddressSelect}
          onError={console.error}
        />
      )}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        onKeyboardDidShow={() => setKeyboardOpen(true)}
        onKeyboardDidHide={() => setKeyboardOpen(false)}
      >
        <Container>
          <ContentContainer 
            keyboardOpen={keyboardOpen}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <StyledText>사진 등록</StyledText>
            <ButtonContainer>
              <StyledButton onPress={checkCameraPermission}>
                <Icon name="add-photo-alternate" size={30} color="gray"/>
              </StyledButton>
              <StyledButton onPress={checkGalleryPermission}>
                <Icon name="add-a-photo" size={30} color="gray"/>
                <ButtonText>({images.length}/5)</ButtonText>
              </StyledButton>
            </ButtonContainer>

            <ImageContainer>
              {images.map((image, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => removeImage(index)}
                  activeOpacity={0.7}
                >
                  <SelectedImage 
                    source={{ uri: image.uri }} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ImageContainer>

            <StyledText>제목</StyledText>
            <InputBox 
              placeholder="글 제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
            />
            <StyledText>교환을 원하는 식재료</StyledText>
            <InputBox 
              placeholder="상세한 식재료명"
              value={ingredientName}
              onChangeText={setIngredientName}
            />
            <StyledText>판매 금액</StyledText>
            <InputBox 
              placeholder="교환 대신 원하시는 판매금액을 입력해 주세요"
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
            />
            <StyledText>상세 설명</StyledText>
            <DetailInputBox 
              placeholder="거래 게시판에 올릴 식재료에 대한 설명을 상세하게 써주세요..."
              multiline={true}
              textAlignVertical="top"
              value={contents}
              onChangeText={setContents}
            />
            <StyledText>희망 장소</StyledText>  
            <InputBox 
              placeholder="주소를 검색하세요"
              value={addressInfo.roadAddress}
              editable={false}
            />
            <ButtonContainer>
              <StyledButton
                onPress={() => getCurrentLocation()}
              >
                <Icon name="gps-fixed" size={30} color="gray"/>
                <ButtonText>내위치</ButtonText>
              </StyledButton>
              <StyledButton
                onPress={() => setShowAddressModal(true)}
              >
                <Icon name="search" size={30} color="gray"/>
                <ButtonText>주소검색</ButtonText>
              </StyledButton>
              <StyledButton
                onPress={() => getCurrentLocation()}
              >
                <Icon2 name="map-marker-radius" size={30} color="gray"/>
                <ButtonText>지도찾기</ButtonText>
              </StyledButton>
            </ButtonContainer>
          </ContentContainer>
          
          <RegistButtonContainer>
            <RegistButton 
              onPress={handleSubmit}
              disabled={loading}
            >
              <RegistText>{loading ? '등록 중...' : '등록하기'}</RegistText>
            </RegistButton>
          </RegistButtonContainer>
        </Container>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

export default RegistProduct;