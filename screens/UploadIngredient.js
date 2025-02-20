// UploadIngredient.jsx
import React from 'react';
import {Text} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';

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

const UploadIngredient = () => {
  const navigation = useNavigation();

  return (
    <Container>
      <IconBox onPress={() => navigation.navigate('TakePhoto')}>
        <IconBoxIconFrame>
          <Icon name="receipt-outline" size={50} color="#666" />
        </IconBoxIconFrame>
        <IconBoxTextFrame>
          <IconText>영수증 촬영하여 추가하기</IconText>
        </IconBoxTextFrame>
      </IconBox>

      <IconBox>
        <IconBoxIconFrame>
          <Icon2 name="keyboard-o" size={50} color="#666" />
        </IconBoxIconFrame>
        <IconBoxTextFrame>
          <IconText>직접 입력하여 추가하기</IconText>
        </IconBoxTextFrame>
      </IconBox>
    </Container>
  );
};

export default UploadIngredient;
