import React from "react";
import { Text } from "react-native";
import styled from "styled-components/native";
import { Image } from "react-native";

const Container = styled.TouchableOpacity`
  width: 60%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor || 'white'};
  border-radius: 25px;
  margin-top: ${props => props.marginTop || '3%'};
`;

const IconArea = styled.View`
  width: 15%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const TextArea = styled.View`
  width: 75%;
  height: 100%;
  justify-content: center;
  padding-left: 3%;
`;

const ButtonText = styled.Text`
  color: ${props => props.color || 'black'};
  font-size: 15;
`;

const SignInButton = ({ 
  ButtonIcon, 
  InlineText, 
  bgColor, 
  marginTop, 
  color,
  iconWidth = 24,  // 기본값 24
  iconHeight = 24,  // 기본값 24
  onPress
}) => {
  return (
    <Container bgColor={bgColor} marginTop={marginTop} onPress={onPress}>
      <IconArea>
        {ButtonIcon && (
          <Image 
            source={ButtonIcon}
            style={{ width: iconWidth, height: iconHeight }}
            resizeMode="contain"
          />
        )}
      </IconArea>
      <Text style={{fontSize: 25, color:"lightgray"}}>|</Text>
      <TextArea>
        <ButtonText color={color}>{InlineText}</ButtonText>
      </TextArea>
    </Container>
  );
};

export default SignInButton;