import React, { useState } from 'react';
import { TouchableOpacity, Platform, PermissionsAndroid, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";

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
  const [images, setImages] = useState([]);
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

  return (
    <SafeContainer>
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
            />
            <StyledText>교환을 원하는 식재료</StyledText>
            <InputBox 
              placeholder="상세한 식재료명"
            />
            <StyledText>판매 금액</StyledText>
            <InputBox 
              placeholder="교환 대신 원하시는 판매금액을 입력해 주세요"
              keyboardType="numeric"
            />
            <StyledText>상세 설명</StyledText>
            <DetailInputBox 
              placeholder="거래 게시판에 올릴 식재료에 대한 설명을 상세하게 써주세요. 다양한 사람들이 이용하는 게시판인 만큼 매너와 에티켓을 지켜주시기 바라며 신선하고 무해한 상품만 등록해 주시면 감사하겠습니다."
              multiline={true}
              textAlignVertical="top"
            />
            <StyledText>희망 장소</StyledText>  
            <ButtonContainer>
              <StyledButton>
                <Icon name="gps-fixed" size={30} color="gray"/>
                <ButtonText>내위치</ButtonText>
              </StyledButton>
              <StyledButton>
                <Icon name="search" size={30} color="gray"/>
                <ButtonText>주소검색</ButtonText>
              </StyledButton>
              <StyledButton>
                <Icon2 name="map-marker-radius" size={30} color="gray"/>
                <ButtonText>지도찾기</ButtonText>
              </StyledButton>
            </ButtonContainer>
          </ContentContainer>
          
          <RegistButtonContainer>
            <RegistButton>
              <RegistText>등록하기</RegistText>
            </RegistButton>
          </RegistButtonContainer>
        </Container>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

export default RegistProduct;