import React, {useState, useEffect, useCallback, useRef} from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  Image,
  Dimensions,
  Keyboard,
} from 'react-native';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const BackButton = styled.TouchableOpacity`
  margin-right: 15px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const MessageList = styled(FlatList)`
  padding: 15px;
`;

const MessageContainer = styled.View`
  max-width: 80%;
  margin-vertical: 5px;
  padding: 10px;
  border-radius: 10px;
  align-self: ${props => (props.isOwnMessage ? 'flex-end' : 'flex-start')};
  background-color: ${props => (props.isOwnMessage ? '#ff6b6b' : '#f0f0f0')};
`;

const MessageText = styled.Text`
  font-size: 16px;
  color: ${props => (props.isOwnMessage ? 'white' : '#333')};
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-top-width: 1px;
  border-top-color: #eee;
  background-color: white;
`;

const MessageInput = styled.TextInput`
  flex: 1;
  min-height: 40px;
  max-height: 100px;
  border-width: 1px;
  border-color: #eee;
  border-radius: 20px;
  padding-horizontal: 15px;
  margin-right: 10px;
`;

const SendButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`;

const MessageWrapper = styled.View`
  align-self: ${props => (props.isOwnMessage ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
  max-width: 80%;
`;

const SenderName = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  margin-left: ${props => (props.isOwnMessage ? 'auto' : '0')};
  text-align: ${props => (props.isOwnMessage ? 'right' : 'left')};
`;

const TimeText = styled.Text`
  font-size: 10px;
  color: ${props => (props.isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999')};
  margin-top: 5px;
  text-align: ${props => (props.isOwnMessage ? 'right' : 'left')};
`;

const SenderInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

const ProfileImage = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  margin-right: 8px;
`;

const GroupChat = ({route, navigation}) => {
  const {
    chatroomId,
    groupPurchaseId,
    groupPurchaseTitle,
    maxParticipants,
    currentParticipants,
    endDate,
  } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [chatStatus, setChatStatus] = useState({
    maxParticipants,
    currentParticipants,
    endDate,
  });

  const flatListRef = useRef(null);

  // 메시지 배열이 변경될 때마다 스크롤 처리
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // 약간의 지연을 주어 렌더링이 완료된 후 스크롤 실행
      const timeoutId = setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 200);

      return () => clearTimeout(timeoutId); // 컴포넌트 업데이트 시 타임아웃 정리
    }
  }, [messages]);

  // 현재 사용자 ID 및 프로필 가져오기
  const fetchCurrentUserInfo = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentUserId(response.data.id);

      // 현재 사용자 프로필도 캐시에 저장
      setUserProfiles(prev => ({
        ...prev,
        [response.data.id]: response.data,
      }));

      return response.data;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  }, []);

  // 특정 사용자 프로필 조회 함수
  const fetchUserProfile = useCallback(
    async userId => {
      // 이미 캐시된 프로필이 있다면 즉시 반환
      if (userProfiles[userId]) return userProfiles[userId];

      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          `http://3.34.59.23/api/v1/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 프로필 캐시에 저장
        setUserProfiles(prev => ({
          ...prev,
          [userId]: response.data,
        }));

        return response.data;
      } catch (error) {
        console.error(`사용자(${userId}) 프로필 조회 실패:`, error);
        return null;
      }
    },
    [userProfiles],
  );

  const connectWebSocket = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const currentUser = await fetchCurrentUserInfo();

      if (!token || !currentUser) {
        Alert.alert('오류', '인증 정보를 확인할 수 없습니다.');
        navigation.goBack();
        return;
      }

      const wsUrl = `ws://3.34.59.23/api/v1/group-purchases/ws/groupchat/${chatroomId}?token=${encodeURIComponent(
        token,
      )}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('그룹 채팅 웹소켓 연결 성공');
        setConnected(true);
        setLoading(false);
        requestChatHistory(ws);
      };

      ws.onmessage = event => {
        console.log('웹소켓 메시지 원본:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('파싱된 웹소켓 메시지:', data);

          // 오류 메시지가 있는지 확인
          if (data.error) {
            console.error('서버 오류 응답:', data.error);
          }

          handleWebSocketMessage(data);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      };

      ws.onerror = e => {
        console.error('웹소켓 연결 오류:', e);
        setConnected(false);
        setLoading(false);
        Alert.alert('연결 오류', '채팅 서버 연결에 실패했습니다.');
      };

      ws.onclose = event => {
        console.log('웹소켓 연결 종료:', event.code, event.reason);
        setConnected(false);
        setSocket(null);

        if (event.code !== 1000) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('웹소켓 연결 중 오류:', error);
      setLoading(false);
      Alert.alert('오류', '채팅 서버 연결 중 문제가 발생했습니다.');
    }
  }, [chatroomId, navigation, fetchCurrentUserInfo]);

  const requestChatHistory = sock => {
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      console.log('히스토리 요청 실패', '소켓 연결이 없습니다');
      return false;
    }

    try {
      // 백엔드에서 원하는 형식: chatroom_id 사용
      const historyRequest = {
        type: 'get_history',
        chatroom_id: parseInt(chatroomId, 10), // chatroomId 정수로 변환
      };

      console.log('히스토리 요청', historyRequest);
      sock.send(JSON.stringify(historyRequest));
      return true;
    } catch (error) {
      console.error('히스토리 요청 오류', error.message);
      return false;
    }
  };

  const handleWebSocketMessage = data => {
    if (data.type === 'history') {
      const historyMessages = data.messages.map(msg => {
        // 타임스탬프 처리 - 9시간 추가
        let messageTimestamp;
        try {
          if (msg.timestamp) {
            messageTimestamp = new Date(msg.timestamp);
            // 한국 시간으로 조정 (UTC+9)
            messageTimestamp.setHours(messageTimestamp.getHours() + 9);
          } else {
            messageTimestamp = new Date();
          }
        } catch (e) {
          console.error('타임스탬프 변환 오류:', e.message);
          messageTimestamp = new Date();
        }

        return {
          id: msg.id ? msg.id.toString() : Date.now().toString(),
          content: msg.content || '',
          sender_id: msg.sender_id || 'unknown',
          sender_nickname: msg.sender_nickname || '익명',
          created_at: messageTimestamp.toISOString(),
          rawTimestamp: msg.timestamp, // 원본 타임스탬프도 저장 (디버깅용)
        };
      });

      setMessages(historyMessages);
    } else if (data.type === 'chat') {
      // 현재 시간에 9시간을 더함
      const now = new Date();
      now.setHours(now.getHours() + 9);

      // 타임스탬프 처리 (있는 경우)
      let messageTimestamp = now;
      if (data.timestamp) {
        try {
          messageTimestamp = new Date(data.timestamp);
          // 한국 시간으로 조정 (UTC+9)
          messageTimestamp.setHours(messageTimestamp.getHours() + 9);
        } catch (e) {
          console.error('타임스탬프 변환 오류:', e.message);
        }
      }

      const newMessage = {
        id: Date.now().toString(),
        content: data.content || '',
        sender_id: data.sender_id || 'unknown',
        sender_nickname: data.sender_nickname || '익명',
        created_at: messageTimestamp.toISOString(),
        rawTimestamp: data.timestamp, // 원본 타임스탬프도 저장
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
  };

  const renderMessage = ({item}) => {
    const isOwnMessage = item.sender_id === currentUserId;
    const senderProfile = userProfiles[item.sender_id];

    return (
      <MessageWrapper isOwnMessage={isOwnMessage}>
        {!isOwnMessage && (
          <SenderInfo>
            {senderProfile?.profile_image_url && (
              <ProfileImage source={{uri: senderProfile.profile_image_url}} />
            )}
            <SenderName>
              {senderProfile?.nickname || item.sender_nickname || '익명'}
            </SenderName>
          </SenderInfo>
        )}
        <MessageContainer isOwnMessage={isOwnMessage}>
          <MessageText isOwnMessage={isOwnMessage}>{item.content}</MessageText>
          <TimeText isOwnMessage={isOwnMessage}>
            {formatRelativeTime(item.created_at)}
          </TimeText>
        </MessageContainer>
      </MessageWrapper>
    );
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN)
      return;

    const currentUser = userProfiles[currentUserId] || {};

    // 현재 시간에 9시간을 더함
    const now = new Date();
    now.setHours(now.getHours() + 9);

    const messageData = {
      type: 'chat',
      content: inputMessage,
      chat_id: parseInt(chatroomId, 10),
      sender_id: currentUserId,
      sender_nickname: currentUser.nickname || '익명',
      timestamp: now.toISOString(), // 9시간 더한 시간 사용
    };

    socket.send(JSON.stringify(messageData));

    const newMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender_id: currentUserId,
      sender_nickname: currentUser.nickname || '익명',
      created_at: now.toISOString(), // 9시간 더한 시간 사용
    };

    // 메시지 추가 후 상태 업데이트 콜백에서 스크롤 수행
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];

      // 메시지 배열이 업데이트된 후 setTimeout을 사용하여 스크롤 실행
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 100);

      return updatedMessages;
    });

    setInputMessage('');
  };

  // 메시지 수신 시 미조회된 프로필 자동 조회
  useEffect(() => {
    const unloadedUserIds = messages
      .filter(
        msg => msg.sender_id !== currentUserId && !userProfiles[msg.sender_id],
      )
      .map(msg => msg.sender_id);

    const uniqueUnloadedUserIds = [...new Set(unloadedUserIds)];
    uniqueUnloadedUserIds.forEach(fetchUserProfile);
  }, [messages, currentUserId, fetchUserProfile, userProfiles]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socket) socket.close();
    };
  }, [connectWebSocket]);

  // 상대 시간 포맷팅 함수 - 이미 한국 시간으로 조정된 날짜 문자열을 처리하는 것으로 가정
  const formatRelativeTime = dateString => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // 유효한 날짜인지 확인
      if (!date || isNaN(date.getTime())) {
        return '알 수 없음';
      }

      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) return '방금 전';
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;

      // 7일 이상이면 날짜 형식으로 표시
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return '--:--';
    }
  };

  return (
    <Container
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </BackButton>
        <HeaderTitle>{groupPurchaseTitle} 공구방</HeaderTitle>
      </Header>

      <MessageList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: false})
        }
        onLayout={() => flatListRef.current?.scrollToEnd({animated: false})}
      />

      <InputContainer>
        <MessageInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="메시지를 입력하세요"
          multiline={true}
        />
        <SendButton onPress={sendMessage}>
          <Icon name="send" size={24} color="#fff" />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default GroupChat;
