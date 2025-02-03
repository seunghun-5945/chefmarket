import React, { useLayoutEffect } from "react";
import { View, TouchableOpacity, Alert, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/MaterialCommunityIcons";
// import Logo from "../assets/testImage/chefLogo.png";

const Container = styled.View`
  flex: 1;
  background-color: lightgray;
  gap: 5px;
`;

const ImageFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: space-around;
  background-color: white;
`;

const StyledImage = styled.Image.attrs({
  resizeMode: "cover"
})`
  width: 120px;
  height: 120px;
  border-radius: 60px;
`;

const EditButton = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  border: 1px solid black;
  border-radius: 100px;
`;

const Reliabillity = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const IconContainer = styled.View`
  flex: 3;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 3px;

`;

const IconFrame = styled.TouchableOpacity`
  width: 24%;
  height: 49%;  
  align-items: center;
  justify-content: space-around;
  padding: 15px;

  background-color: white;
`;

const EtcFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: center;
  background-color: white;  
`;


const Profile = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => Alert.alert("설정", "설정 화면으로 이동합니다.")}
          style={{ marginRight: 15 }}
        >
          <Icon name="settings" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <Container>
      <ImageFrame>
        <StyledImage 
          source={require("../assets/testImage/chefLogo.png")} 
          resizeMode="cover" 
        />
        <Text style={{fontSize:25}}>이승훈</Text>
      </ImageFrame>
      <Reliabillity>
        <Text>여긴 신뢰도 보여줄 예정</Text>
      </Reliabillity>
      <IconContainer>
       <IconFrame>
        <Icon2 name="sell" size={30} color="black" />
        <Text>판매 목록</Text>
       </IconFrame>
       <IconFrame>
        <Icon name="heart-sharp" size={30} color="red" />
        <Text style={{textAlign:"center"}}>좋아요한 레시피</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-variant" size={30} color="gray" />
        <Text style={{textAlign:"center"}}>내가 올린 레시피</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-apple" size={30} color="red" />
        <Text style={{textAlign:"center"}}>보관중인 식재료</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-variant" size={30} color="gray" />
        <Text style={{textAlign:"center"}}>구독중인 셰프</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-variant" size={30} color="gray" />
        <Text style={{textAlign:"center"}}>내가 올린 레시피</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-variant" size={30} color="gray" />
        <Text style={{textAlign:"center"}}>내가 올린 레시피</Text>
       </IconFrame>
       <IconFrame>
        <Icon3 name="food-variant" size={30} color="gray" />
        <Text style={{textAlign:"center"}}>내가 올린 레시피</Text>
       </IconFrame>
      </IconContainer>
      <EtcFrame>
        <Text>여긴 뭘 넣을지 고민중</Text>
      </EtcFrame>
    </Container>
  );
};

export default Profile;
