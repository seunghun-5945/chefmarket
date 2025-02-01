import styled from "styled-components/native";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Container = styled.TouchableOpacity`
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: row;
`;

const IconFrame = styled.View`
  flex: 3;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.Image`
  width: 65px;
  height: 65px;
  border-radius: 50px;
  border: 1px solid lightgray;
`;

const ExplainFrame = styled.View`
  flex: 7;
`;

const NickNameFrame = styled.View`
  flex: 5;
  flex-direction: row;
  align-items: flex-end;
  padding: 2%;
`;

const NickName = styled.Text`
  font-weight: bold;
`;

const Date = styled.Text`
  font-size: 12px;
  margin-left: 10px;
  color: gray;
`;

const LastChatFrame = styled.View`
  flex: 5;
  justify-content: flex-start;
  padding: 2%;
`;

const LastChat = styled.Text`
  color: gray;
`;

const ChatListBox = () => {
  const navigation = useNavigation();

  const onClickChatRoomList = () => {
    navigation.navigate("Chat")
  }

  return (
    <Container onPress={onClickChatRoomList}>
      <IconFrame><ProfileImage /></IconFrame>

      <ExplainFrame>
        <NickNameFrame><NickName>편암선생</NickName><Date>4달 전</Date></NickNameFrame>
        <LastChatFrame><LastChat>안녕하세요 과메기 팝니다~</LastChat></LastChatFrame>
      </ExplainFrame>
    </Container>
  );
};

export default ChatListBox;