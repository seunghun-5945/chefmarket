import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { Text, Keyboard, Platform, Alert, TouchableOpacity, View, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import Address from "../components/Address";
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

const SignUp = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [address, setAddress] = useState("");
  const [arrayIndex, setArrayIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const navigation = useNavigation();

  const titleTextArray = [
    "이름을 입력해 주세요",
    "이메일을 입력해 주세요",
    "비밀번호를 입력해 주세요",
    "비밀번호를 확인합니다",
    "마지막으로 주소를 입력해 주세요"
  ];
  
  const placeHolderArray = [
    "이름",
    "이메일",
    "비밀번호",
    "비밀번호 확인",
    "탭하여 주소 찾기"
  ];
  
  const valueArray = [name, email, password, pwCheck, address];

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

  const handleChangeName = (value) => {
    setErrorMessage("");
    setName(value);
  };

  const handleChangeEmail = (value) => {
    setErrorMessage("");
    setEmail(value);
  };

  const handleChangePw = (value) => {
    setErrorMessage("");
    setPw(value);
  };

  const handleChangePwCheck = (value) => {
    setErrorMessage("");
    setPwCheck(value);
  };

  const handleChangeAddress = (value) => {
    setErrorMessage("");
    setAddress(value);
  }

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
        handleChangeName(value);
        break;
      case 1:
        handleChangeEmail(value);
        break;
      case 2:
        handleChangePw(value);
        break;
      case 3:
        handleChangePwCheck(value);
        break;
      case 4:
        handleChangeAddress(value);
        break;
    }
  };

  const handleAddressSelect = (selectedAddress) => {
    setAddress(selectedAddress);
    setErrorMessage("");
  };

  const handleCheckInput = () => {
    switch (arrayIndex) {
      case 0:
        if (name.length < 2) {
          setErrorMessage("이름은 2글자 이상이어야 합니다.");
          return;
        }
        setArrayIndex(1);
        break;
      
      case 1:
        if (!validateEmail(email)) {
          setErrorMessage("올바른 이메일 형식이 아닙니다.");
          return;
        }
        setArrayIndex(2);
        break;
      
      case 2:
        if (!validatePassword(password)) {
          setErrorMessage("비밀번호는 8자 이상이어야 합니다.");
          return;
        }
        setArrayIndex(3);
        break;
      
      case 3:
        if (password !== pwCheck) {
          setErrorMessage("비밀번호가 일치하지 않습니다.");
          return;
        }
        setArrayIndex(4);
        break;

        case 4:
        if (address === null) {
          setErrorMessage("주소를 입력해 주세요.");
          return
        }
        handleSignUp();
        break;
    }
  };

  const isButtonEnabled = () => {
    switch (arrayIndex) {
      case 0:
        return name.length >= 2;
      case 1:
        return validateEmail(email);
      case 2:
        return validatePassword(password);
      case 3:
        return password === pwCheck;
      case 4:
        return address !== null && address !== '';
      default:
        return false;
    }
  };

  const handleInputPress = () => {
    if (arrayIndex === 4) {
      setShowAddressModal(true);
    }
  };

  const handleSignUp = () => {
    Alert.alert(
      "회원가입 완료",
      "회원가입이 성공적으로 완료되었습니다.",
      [{ text: "확인", onPress: () => navigation.navigate("Home") }]
    );
  };

  const togglePasswordVisibility = () => {
    if (arrayIndex === 2) {
      setShowPassword(!showPassword);
    } else if (arrayIndex === 3) {
      setShowPasswordCheck(!showPasswordCheck);
    }
  };

  return (
    <Container>
      <Wrapper>
        <TitleText>{titleTextArray[arrayIndex]}</TitleText>
        <SubText>한번만 입력하니 주의깊게 작성해 주세요!</SubText>
        <InputContainer>
          {arrayIndex === 4 ? (
            <View style={{width:"100%", flexDirection:"column", border:"1"}}>
              <ReadOnlyInputBox
                placeholder={placeHolderArray[arrayIndex]}
                value={address}
                editable={false}
                onPressIn={handleInputPress}
                hasEyeIcon={false}
              />
              <CurrentLocationBtn>
                <Icon name="location-outline" size={25} color="red" />
                <Text>현재 위치로 설정</Text>
              </CurrentLocationBtn>
            </View>
          ) : (
            <InputBox
              placeholder={placeHolderArray[arrayIndex]}
              autoFocus={true}
              returnKeyType="done"
              value={valueArray[arrayIndex]}
              onChangeText={handleInputChange}
              secureTextEntry={(arrayIndex === 2 && !showPassword) || (arrayIndex === 3 && !showPasswordCheck)}
              hasEyeIcon={arrayIndex >= 2 && arrayIndex <= 3}
              blurOnSubmit={false}
            />
          )}
          {arrayIndex >= 2 && arrayIndex <= 3 && (
            <EyeIconButton onPress={togglePasswordVisibility}>
              <Icon 
                name={arrayIndex === 2 
                  ? (showPassword ? 'eye-outline' : 'eye-off-outline')
                  : (showPasswordCheck ? 'eye-outline' : 'eye-off-outline')
                } 
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
            {arrayIndex === 4 ? "완료" : "다음"}
          </Text>
        </NextButton>
      </ButtonWrapper>

      <Address
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={handleAddressSelect}
      />
    </Container>
  );
};

export default SignUp;