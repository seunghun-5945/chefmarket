// RenderImageScreen.jsx
import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InitialContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const PhotoImage = styled.Image`
  width: 200px;
  height: 200px;
  margin: 20px 0;
  border-radius: 10px;
`;

const ActionButtonsContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: ${props =>
    props.variant === 'cancel' ? '#f1f1f1' : '#e0e0e0'};
`;

const ActionButtonText = styled.Text`
  margin-left: 8px;
  color: ${props => (props.variant === 'cancel' ? '#666' : '#333')};
`;

const RenderImageScreen = ({imageUri, uploadImage, resetImage}) => (
  <InitialContainer>
    <PhotoImage source={{uri: imageUri}} resizeMode="contain" />
    <ActionButtonsContainer>
      <ActionButton onPress={uploadImage}>
        <Icon name="cloud-upload" size={24} color="#333" />
        <ActionButtonText>업로드</ActionButtonText>
      </ActionButton>
      <ActionButton variant="cancel" onPress={resetImage}>
        <Icon name="refresh" size={24} color="#666" />
        <ActionButtonText variant="cancel">다시 선택</ActionButtonText>
      </ActionButton>
    </ActionButtonsContainer>
  </InitialContainer>
);

export default RenderImageScreen;
