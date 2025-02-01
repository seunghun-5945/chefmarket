import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { FlatList, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Image, View } from "react-native";

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Header = styled.View`
  flex: 2;
  justify-content: center;
  align-items: center;
`;

const Main = styled.View`
  flex: 8;
  padding: 10px;
`;

const MessageRow = styled.View`
  flex-direction: ${(props) => (props.isMine ? "row-reverse" : "row")};
  align-items: center;
  margin-vertical: 5px;
`;

const ProfileImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-horizontal: 10px;
`;

const MessageContainer = styled.View`
  background-color: ${(props) => (props.isMine ? "lightsalmon" : "#f1f1f1")};
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-top-width: 1px;
  border-color: #ccc;
  padding: 10px;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 10px;
  border-width: 1px;
  border-radius: 10px;
  border-color: #ccc;
  margin-right: 10px;
`;

const SendButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 10px 15px;
  border-radius: 10px;
`;

const SendText = styled.Text`
  color: white;
  font-weight: bold;
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket("https://port-0-chat-server-m6hpmvyn426e94ab.sel4.cloudtype.app");
  
      socket.onopen = () => {
        console.log("✅ WebSocket 연결됨");
      };
  
      socket.onmessage = (event) => {
        console.log("📩 메시지 수신:", event.data);
        const { text, profileImage } = JSON.parse(event.data);
        const newMessage = {
          id: Date.now().toString(),
          text,
          profileImage,
          isMine: false,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };
  
      socket.onerror = (error) => {
        console.error("❌ WebSocket 에러:", error);
      };
  
      socket.onclose = () => {
        console.log("❌ WebSocket 연결 종료됨");
        // 연결이 끊어지면 3초 후 재연결 시도
        setTimeout(connectWebSocket, 3000);
      };
  
      setWs(socket);
    };
  
    connectWebSocket();
  
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === "" || !ws) return;
    
    const messageData = {
      text: input,
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg", // 내 프로필 이미지 (임시)
    };

    ws.send(JSON.stringify(messageData)); // 서버로 메시지 전송
    setMessages((prevMessages) => [...prevMessages, { ...messageData, id: Date.now().toString(), isMine: true }]);
    setInput("");
  };

  return (
    <Container>
      <Header>
        <Text>채팅방</Text>
      </Header>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 8 }}>
        <Main>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageRow isMine={item.isMine}>
                {!item.isMine && <ProfileImage source={{ uri: item.profileImage }} />}
                <MessageContainer isMine={item.isMine}>
                  <Text>{item.text}</Text>
                </MessageContainer>
              </MessageRow>
            )}
          />
        </Main>
        <InputContainer>
          <Input value={input} onChangeText={setInput} placeholder="메시지를 입력하세요..." />
          <SendButton onPress={sendMessage}>
            <SendText>전송</SendText>
          </SendButton>
        </InputContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Chat;