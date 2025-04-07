// RenderInitialScreen.jsx
import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 50px;
  background-color: white;
`;

const IconBox = styled.TouchableOpacity`
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
  border: 1px solid lightgray;
  border-radius: 20px;
`;

const IconBoxIconFrame = styled.View`
  flex: 8;
  align-items: center;
  justify-content: center;
`;

const IconBoxTextFrame = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
`;

const IconText = styled.Text`
  font-size: 16px;
  color: #666;
`;

const RenderInitialScreen = ({handleImagePick}) => (
  <Container>
    <IconBox onPress={() => handleImagePick('camera')}>
      <IconBoxIconFrame>
        <Icon name="add-a-photo" size={50} color="#666" />
      </IconBoxIconFrame>
      <IconBoxTextFrame>
        <IconText>영수증 촬영하기</IconText>
      </IconBoxTextFrame>
    </IconBox>

    <IconBox onPress={() => handleImagePick('gallery')}>
      <IconBoxIconFrame>
        <Icon name="add-photo-alternate" size={50} color="#666" />
      </IconBoxIconFrame>
      <IconBoxTextFrame>
        <IconText>갤러리에서 선택하기</IconText>
      </IconBoxTextFrame>
    </IconBox>
  </Container>
);

export default RenderInitialScreen;
