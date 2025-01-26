import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-gesture-handler";
import styled from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";

const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const ChatRoomContainer = styled.View`
  width: 100%;
  height: 100px;
  flex-direction: row;
`;

const IconFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: center;
  border: 1px solid red;
`;

const ProfileImage = styled.Image`
  width: 80px;
  height: 80px;
  border: 1px solid red;
  border-radius: 50px;
`;

const ExplainFrame = styled.View`
  flex: 7;
    border: 1px solid blue;
`;

const NickNameFrame = styled.View`
  flex: 5;
`;

const LastChatFrame = styled.View`
  flex: 5;
`;

const ChatRoom = () => {
  return (
    <ChatRoomContainer>
      <IconFrame><ProfileImage /></IconFrame>
      <ExplainFrame>
      
      </ExplainFrame>
    </ChatRoomContainer>
  );
};

const Chat = () => {
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 15 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("MapModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="search" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("ProfileModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);
  
  return (
    <Container>
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
      <ChatRoom />
    </Container>
  );
};

export default Chat;