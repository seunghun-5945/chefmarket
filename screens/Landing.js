import { useEffect } from "react";
import styled from "styled-components/native";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native"; // React Navigation 훅
import SignInButton from "../components/SignInButton";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Container = styled.View`
  flex: 1;
`;

const Wrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const BackgroundVideo = styled(Video)`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const MainText = styled.Text`
  font-size: 50px;
  color: white;
  font-weight: bold;
  text-align: center;
`;

const SubText = styled.Text`
  font-size: 20px;
  color: white;
  margin-top: 30px;
`;

const SignInText = styled.View`
  width: 100%;
  height: auto;
  flex-direction: row;
  justify-content: center;
  margin-top: 15px;
`;

const StyledButton = styled(SignInButton)`
  background-color: ${props => props.bgColor || 'white'};
  margin-top: ${props => props.marginTop || '3%'};
`;

const Landing = () => {
  const navigation = useNavigation(); // Navigation 훅 사용
  
  useEffect(() => {
    checkJWTToken();
  }, []);

  const checkJWTToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // JWT 토큰이 존재하면 Home 화면으로 즉시 이동
        navigation.replace('Home');
        return; // 토큰이 있으면 아래 UI를 렌더링하지 않도록 early return
      }
    } catch (error) {
      console.error('토큰 확인 중 에러 발생:', error);
    }
  };

  return (
    <Container>
      <Wrapper>
        <BackgroundVideo
          source={require('../assets/video/cooking3.mp4')}
          resizeMode="cover"
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
        />
        <MainText>Chef's{'\n'}Market</MainText>
        <SubText>레시피 찾고 식재료 교환하고!</SubText>

        <StyledButton 
          bgColor="#F7E600"
          InlineText="카카오톡으로 시작하기"
          marginTop="10%"
          ButtonIcon={require("../assets/icons/kakaotalk.png")}
          iconWidth={20}    
          iconHeight={20}   
        />
        
        <StyledButton 
          bgColor="#02CB5B"
          InlineText="네이버로 시작하기"
          color="white"
          ButtonIcon={require("../assets/icons/naver.png")}
          iconWidth={30}    
          iconHeight={30}   
        />
        
        <StyledButton 
          InlineText="이메일로 시작하기"
          marginTop="15%"
          ButtonIcon={require("../assets/icons/email.png")}
          iconWidth={18}    
          iconHeight={18}
          onPress={() => navigation.navigate("SignUp")} 
        />
        <SignInText>
          <Text style={{color:"white"}}>이미 계정이 있으신가요?</Text>
          <Text 
            style={{color:"yellow", marginLeft:"5"}}
            onPress={() => navigation.navigate("SignIn")}
          >로그인</Text>
        </SignInText>

      </Wrapper>
    </Container>
  );
};

export default Landing;
