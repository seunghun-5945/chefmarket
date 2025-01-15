import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { Text, Keyboard, Platform, Alert, TouchableOpacity, View, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Wrapper = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

const TitleText = styled.Text`
  font-size: 25px;
  font-weight: bold;
  margin-top: 100px;
`;

const SubText = styled.Text`
  font-size: 15px;
  color: gray;
`;

const InputContainer = styled.View`
  width: 90%;
  flex-direction: row;
  align-items: center;
  position: relative;
  margin-top: 20px;
`;

const InputBox = styled.TextInput`
  width: 100%;
  height: 50px;
  border: 1px solid black;
  border-radius: 8px;
  font-size: 20px;
  padding-left: 10px;
  padding-right: ${props => props.hasEyeIcon ? "50px" : "10px"};
`;

const ReadOnlyInputBox = styled(InputBox)`
  background-color: #f5f5f5;
`;

const CurrentLocationBtn = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  border-radius: 10px;
  margin-top: 10px;
`;

const EyeIconButton = styled.TouchableOpacity`
  position: absolute;
  right: 12px;
  height: 50px;
  justify-content: center;
`;

const NextButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.enabled ? 'orange' : '#ccc'};
  position: absolute;
  bottom: 0;
  opacity: ${props => props.enabled ? 1 : 0.7};
`;

const ButtonWrapper = styled.View`
  width: 100%;
  background-color: white;
  padding-bottom: ${Platform.OS === 'ios' ? 0 : 20}px;
  margin-bottom: ${props => Platform.OS === 'ios' ? props.keyboardHeight : 0}px;
  ${Platform.OS === 'ios' && 'position: absolute; bottom: 0;'}
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 12px;
  margin-top: 5px;
  align-self: flex-start;
  margin-left: 20px;
`;

const SignIn = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [arrayIndex, setArrayIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const titleTextArray = [
    "이메일을 입력해 주세요",
    "비밀번호를 확인합니다",
  ];
  
  const placeHolderArray = [
    "이메일",
    "비밀번호",
  ];
  
  const valueArray = [email, password];

  useEffect(() => {
    const keyboardWillShow = (event) => {
      if (Platform.OS === 'ios') {
        setKeyboardHeight(event.endCoordinates.height);
      } else {
        const screenHeight = Dimensions.get('window').height;
        const keyboardHeight = event.endCoordinates.height;
        // Android에서는 화면 크기를 기준으로 키보드 높이를 정확하게 계산
        setKeyboardHeight(keyboardHeight);
      }
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleChangeEmail = (value) => {
    setErrorMessage("");
    setEmail(value);
  };

  const handleChangePw = (value) => {
    setErrorMessage("");
    setPw(value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleInputChange = (value) => {
    switch (arrayIndex) {
      case 0:
        handleChangeEmail(value);
        break;
      case 1:
        handleChangePw(value);
        break;
    }
  };

  const handleCheckInput = () => {
    switch (arrayIndex) {
      case 0:
        if (!validateEmail(email)) {
          setErrorMessage("올바른 이메일 형식이 아닙니다.");
          return;
        }
        setArrayIndex(1);
        break;
      
      case 1:
        if (!validatePassword(password)) {
          setErrorMessage("비밀번호는 8자 이상이어야 합니다.");
          return;
        }
        handleSignIn(); // 로그인 처리
        break;
    }
  };

  const isButtonEnabled = () => {
    switch (arrayIndex) {
      case 0:
        return validateEmail(email);
      case 1:
        return validatePassword(password);
      default:
        return false;
    }
  };

  const handleSignIn = () => {
    Alert.alert(
      "로그인 완료",
      "로그인 성공 홈으로 이동합니다.",
      [{ text: "확인", onPress: () => navigation.navigate("Home") }]
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container>
      <Wrapper>
        <TitleText>{titleTextArray[arrayIndex]}</TitleText>
        <SubText>아이디 비밀번호를 입력하여 로그인을 진행해 주세요</SubText>
        <InputContainer>
        <InputBox
          placeholder={placeHolderArray[arrayIndex]}
          autoFocus={true}
          returnKeyType="done"
          value={valueArray[arrayIndex]}
          onChangeText={handleInputChange}
          secureTextEntry={arrayIndex === 1 && !showPassword} 
          hasEyeIcon={arrayIndex === 1}
          blurOnSubmit={false}
          keyboardType={arrayIndex === 0 ? 'email-address' : 'default'}
        />
          {arrayIndex === 1 && (
            <EyeIconButton onPress={togglePasswordVisibility}>
              <Icon 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24} 
                color="gray"
              />
            </EyeIconButton>
          )}
        </InputContainer>
        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </Wrapper>
      <ButtonWrapper keyboardHeight={keyboardHeight}>
        <NextButton 
          onPress={handleCheckInput}
          enabled={isButtonEnabled()}
          disabled={!isButtonEnabled()}
        >
          <Text style={{
            fontSize: 20, 
            fontWeight: "bold",
            color: isButtonEnabled() ? 'black' : '#666'
          }}>
            {arrayIndex === 1 ? "로그인" : "다음"}
          </Text>
        </NextButton>
      </ButtonWrapper>
    </Container>
  );
};

export default SignIn;