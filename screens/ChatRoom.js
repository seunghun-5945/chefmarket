import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-gesture-handler";
import styled from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import ChatListBox from "../components/ChatListBox";

const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const ChatRoom = () => {
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
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
      <ChatListBox />
    </Container>
  );
};

export default ChatRoom;