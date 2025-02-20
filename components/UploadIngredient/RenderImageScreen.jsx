import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
const screenWidth = Dimensions.get('window').width;

const InitialContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: white;
`;

const PhotoImage = styled.Image`
  width: ${screenWidth * 0.9}px;
  height: ${screenWidth * 0.9}px;
  margin: 20px 0;
  border-radius: 20px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 3;
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const LoadingText = styled.Text`
  margin-top: 20px;
  font-size: 18px;
  color: #333;
`;

const ActionButtonsContainer = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: center;
  margin-top: 20px;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  border-radius: 12px;
  background-color: ${props =>
    props.variant === 'cancel' ? '#f1f1f1' : '#4CAF50'};
  margin: 0 10px;
  min-width: 130px;
`;

const ActionButtonText = styled.Text`
  margin-left: 10px;
  font-size: 16px;
  font-weight: 500;
  color: ${props => (props.variant === 'cancel' ? '#666' : 'white')};
`;

const RenderImageScreen = ({
  imageUri,
  uploadImage,
  resetImage,
  isProcessing = false, // 새로운 prop 추가
}) => {
  // 처리 중일 때 로딩 화면
  if (isProcessing) {
    return (
      <LoadingContainer>
        <LottieView
          source={require('../../assets/lottie/loading-animation.json')} // 로티 애니메이션 파일 경로
          autoPlay
          loop
          style={{width: 200, height: 200}}
        />
        <LoadingText>OCR 분석 중입니다...</LoadingText>
      </LoadingContainer>
    );
  }

  // 일반 이미지 화면
  return (
    <InitialContainer>
      <PhotoImage source={{uri: imageUri}} resizeMode="cover" />
      <ActionButtonsContainer>
        <ActionButton onPress={uploadImage}>
          <Icon name="cloud-upload" size={24} color="white" />
          <ActionButtonText>업로드</ActionButtonText>
        </ActionButton>
        <ActionButton variant="cancel" onPress={resetImage}>
          <Icon name="refresh" size={24} color="#666" />
          <ActionButtonText variant="cancel">다시 선택</ActionButtonText>
        </ActionButton>
      </ActionButtonsContainer>
    </InitialContainer>
  );
};

export default RenderImageScreen;
