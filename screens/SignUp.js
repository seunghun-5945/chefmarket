import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { Text, Keyboard, Platform, Alert, TouchableOpacity, View, Dimensions, PermissionsAndroid } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import Address from "../components/Address";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Geolocation from 'react-native-geolocation-service';

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

const AddressButton = styled.TouchableOpacity`
  width: 100%;
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
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [arrayIndex, setArrayIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState({
    roadAddress: '',    // 도로명 주소
    zipCode: '',        // 우편번호
    longitude: '',      // x 좌표
    latitude: ''        // y 좌표
  });

  const navigation = useNavigation();

  const titleTextArray = [
    "아이디를 입력해 주세요",
    "이메일을 입력해 주세요",
    "닉네임을 입력해 주세요",
    "비밀번호를 입력해 주세요",
    "비밀번호를 확인합니다",
    "마지막으로 주소를 입력해 주세요"
  ];
  
  const placeHolderArray = [
    "아이디",
    "이메일",
    "닉네임",
    "비밀번호",
    "비밀번호 확인",
    "탭하여 주소 찾기"
  ];
  
  const valueArray = [name, email, nickname, password, pwCheck, addressInfo];

  useEffect(() => {
    const keyboardWillShow = (event) => {
      if (Platform.OS === 'ios') {
        setKeyboardHeight(event.endCoordinates.height);
      } else {
        const screenHeight = Dimensions.get('window').height;
        const keyboardHeight = event.endCoordinates.height;
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

  const handleChangeNickname = (value) => {
    setErrorMessage("");
    setNickname(value);
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
    setAddressInfo(value);
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
        handleChangeNickname(value);
        break;
      case 3:
        handleChangePw(value);
        break;
      case 4:
        handleChangePwCheck(value);
        break;
      case 5:
        handleChangeAddress(value);
        break;
    }
  };

  const handleAddressSelect = (addressInfo) => {
    setAddressInfo({
        roadAddress: addressInfo.roadAddress,
        zipCode: addressInfo.zipCode,
        longitude: addressInfo.longitude,
        latitude: addressInfo.latitude
    });
    setErrorMessage("");
  };

  const handleCheckInput = () => {
    switch (arrayIndex) {
      case 0:
        if (name.length < 2) {
          setErrorMessage("아이디는 2글자 이상이어야 합니다.");
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
        if (nickname.length < 2) {
          setErrorMessage("닉네임은 2글자 이상이어야 합니다.");
          return;
        }
        setArrayIndex(3);
        break;
      
      case 3:
        if (!validatePassword(password)) {
          setErrorMessage("비밀번호는 8자 이상이어야 합니다.");
          return;
        }
        setArrayIndex(4);
        break;
      
      case 4:
        if (password !== pwCheck) {
          setErrorMessage("비밀번호가 일치하지 않습니다.");
          return;
        }
        setArrayIndex(5);
        break;

      case 5:
        if (addressInfo === null) {
          setErrorMessage("주소를 입력해 주세요.");
          return;
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
        return nickname.length >= 2;
      case 3:
        return validatePassword(password);
      case 4:
        return password === pwCheck;
      case 5:
        return addressInfo.roadAddress !== '' && addressInfo.zipCode !== '';
        default:
      return false;
    }
  };

  const handleInputPress = () => {
    if (arrayIndex === 5) {
      setShowAddressModal(true);
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://3.34.59.23/api/v1/auth/register', {
        email: email,
        username: name,
        nickname: nickname,
        password: password,
        address_name: addressInfo.roadAddress,
        zone_no: addressInfo.zipCode,
        location_lat: addressInfo.latitude,
        location_lon: addressInfo.longitude
      });
      
      Alert.alert(
        "회원가입 완료",
        "회원가입이 성공적으로 완료되었습니다.",
        [{ text: "확인", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      console.log("회원가입 실패:", error);
      
      let errorMsg = "회원가입에 실패했습니다.";
      if (error.response) {
        errorMsg = error.response.data.message || errorMsg;
      }
      
      Alert.alert(
        "회원가입 실패",
        errorMsg,
        [{ text: "확인" }]
      );
    }
  };

  const togglePasswordVisibility = () => {
    if (arrayIndex === 3) {
      setShowPassword(!showPassword);
    } else if (arrayIndex === 4) {
      setShowPasswordCheck(!showPasswordCheck);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "위치 권한 필요",
            message: "앱의 일부 기능을 사용하려면 위치 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "취소",
            buttonPositive: "확인"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("위치 권한 허용됨");
          return true;
        } else {
          console.log("위치 권한 거부됨");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // 기존 iOS 로직 유지
      try {
        const status = await Geolocation.requestAuthorization('whenInUse');
        // console.log('iOS 위치 권한 상태:', status);
        
        return status === 'granted';
      } catch (err) {
        console.error('위치 권한 요청 에러:', err);
        return false;
      }
    }
    return false;
  };
  
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
        Alert.alert(
            '위치 권한 필요',
            '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
            [{ text: '확인' }]
        );
        return;
    }

    setIsLoading(true);

    Geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            // console.log('🌍 현재 위치 좌표:', { latitude, longitude });

            try {
                const response = await axios.get(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`, {
                    headers: {
                        'Authorization': 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99'
                    }
                });

                console.log('🌐 Kakao API 전체 응답:', JSON.stringify(response.data, null, 2));

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

                console.log('지오로케이션:', {
                    roadAddress: addressInfo.address.address_name,
                    zipCode: addressInfo.road_address?.zone_no || '',
                    longitude: longitude.toString(),
                    latitude: latitude.toString()
                });
            } catch (error) {
                console.error('❌ 주소 변환 에러:', error.response ? error.response.data : error.message);
                Alert.alert(
                    '주소 확인 실패',
                    `현재 위치의 주소를 가져오는데 실패했습니다: ${error.message}`,
                    [{ text: '확인' }]
                );
            } finally {
                setIsLoading(false);
            }
        },
        (error) => {
            console.error('❌ 위치 가져오기 에러:', error);
            Alert.alert(
                '위치 확인 실패',
                `GPS 위치를 가져오는데 실패했습니다: ${error.message}`,
                [{ text: '확인' }]
            );
            setIsLoading(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
            distanceFilter: 10,
        }
    );
};

  return (
    <Container>
      <Wrapper>
        <TitleText>{titleTextArray[arrayIndex]}</TitleText>
        <SubText>한번만 입력하니 주의깊게 작성해 주세요!</SubText>
        <InputContainer>
          {arrayIndex === 5 ? (
            <View style={{width:"100%", flexDirection:"column", border:"1"}}>
              <AddressButton 
                onPress={handleInputPress}
                activeOpacity={0.8}
              >
                <ReadOnlyInputBox
                  placeholder={placeHolderArray[arrayIndex]}
                  value={addressInfo.roadAddress}
                  editable={false}
                  hasEyeIcon={false}
                  onPressIn={handleInputPress}
                />
              </AddressButton>
              <CurrentLocationBtn 
                onPress={getCurrentLocation}
                disabled={isLoading}
              >
                <Icon name="location-outline" size={25} color="red" />
                <Text>{isLoading ? "위치 가져오는 중..." : "현재 위치로 설정"}</Text>
              </CurrentLocationBtn>
            </View>
          ) : (
            <InputBox
              placeholder={placeHolderArray[arrayIndex]}
              autoFocus={true}
              returnKeyType="done"
              value={valueArray[arrayIndex]}
              onChangeText={handleInputChange}
              secureTextEntry={(arrayIndex === 3 && !showPassword) || (arrayIndex === 4 && !showPasswordCheck)}
              hasEyeIcon={arrayIndex >= 3 && arrayIndex <= 4}
              blurOnSubmit={false}
            />
          )}
          {arrayIndex >= 3 && arrayIndex <= 4 && (
            <EyeIconButton onPress={togglePasswordVisibility}>
              <Icon
                name={arrayIndex === 3 
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
            {arrayIndex === 5 ? "완료" : "다음"}
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