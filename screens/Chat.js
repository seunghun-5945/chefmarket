import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components/native';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TradeModal from '../components/Trade/TradeModal';
import TradeMessage from '../components/Trade/TradeMessage';
import NotificationMessage from '../components/Trade/NotificationMessage';
import CancelNotification from '../components/Trade/CancelNotification';

const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 5px;
`;

const ChatContainer = styled.View`
  flex: 1;
  padding: 10px;
`;

// 채팅 입력 관련
const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const MessageInput = styled.TextInput`
  flex: 1;
  height: 40px;
  border-radius: 20px;
  padding: 0 15px;
  background-color: #f0f0f0;
  margin-right: 10px;
`;

const SendButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: lightsalmon;
  align-items: center;
  justify-content: center;
`;

// 메시지 관련
const MessageItem = styled.View`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
`;

const MyMessage = styled(MessageItem)`
  align-self: flex-end;
  background-color: lightsalmon;
`;

const OtherMessage = styled(MessageItem)`
  align-self: flex-start;
  background-color: white;
  border-width: 1px;
  border-color: #eeeeee;
`;

const MessageText = styled.Text`
  font-size: 14px;
  color: ${props => (props.isMyMessage ? 'white' : 'black')};
`;

const TimeText = styled.Text`
  font-size: 10px;
  color: ${props => (props.isMyMessage ? '#eee' : '#999')};
  align-self: flex-end;
  margin-top: 2px;
`;

// 상품 정보 관련
const ProductInfoContainer = styled.View`
  background-color: white;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
`;

const ProductLeftFrame = styled.View`
  flex: 5;
`;

const ProductImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  margin-right: 10px;
`;

const ProductInfo = styled.View`
  flex: 1;
  align-items: flex-start;
  justify-content: center;
`;

const ProductTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

const ProductPrice = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

// 빈 상태 및 로딩 관련
const EmptyView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #999;
`;

const TradeButton = styled.TouchableOpacity`
  border-radius: 5px;
  align-items: center;
  padding: 10px;
  background-color: #eee;
`;

const CompleteTradeButton = styled.TouchableOpacity`
  border-radius: 5px;
  align-items: center;
  padding: 10px;
  background-color: #4caf50; /* 초록색 */
`;

const CompleteButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

// 로그 유틸리티 함수
const logMessage = (prefix, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${prefix}:`, data);
};

const Chat = ({route, navigation}) => {
  const {
    chatId: initialChatId,
    itemId,
    productData,
    sellerId,
    sellerName,
    buyerId,
  } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [actualChatId, setActualChatId] = useState(initialChatId);
  const [realUserId, setRealUserId] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tradeInfo, setTradeInfo] = useState(null);
  const [lastAppointmentDate, setLastAppointmentDate] = useState(null);

  const [isTradeComplete, setIsTradeComplete] = useState(false);
  const [isTradeButtonLoading, setIsTradeButtonLoading] = useState(false);
  const [isArrived, setIsArrived] = useState(false);
  const [showCancelNotification, setShowCancelNotification] = useState(false);

  const flatListRef = useRef();

  // 실제 사용자 ID 가져오기
  useEffect(() => {
    const fetchRealUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.error('토큰이 없습니다');
          setRealUserId(buyerId); // 토큰이 없으면 기본 buyerId 사용
          return;
        }

        // /api/v1/users/me API를 호출하여 실제 사용자 정보 가져오기
        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.id) {
          setRealUserId(response.data.id);
          logMessage('실제 사용자 ID 로드 성공', {
            realUserId: response.data.id,
            buyerId: buyerId,
          });
        } else {
          setRealUserId(buyerId);
          logMessage('사용자 정보에 ID가 없음, buyerId 사용', buyerId);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        setRealUserId(buyerId); // 오류 시 기본 buyerId 사용
        logMessage('사용자 정보 가져오기 오류, buyerId 사용', {
          error: error.message,
          buyerId: buyerId,
        });
      }
    };

    fetchRealUserId();
  }, [buyerId]);

  // 컴포넌트 마운트 시 채팅 참가자 정보 로깅
  useEffect(() => {
    console.log('=== 채팅 참가자 ID 정보 ===');
    console.log('sellerId (판매자 ID):', sellerId);
    console.log('buyerId (구매자 ID):', buyerId);
    console.log('realUserId (현재 사용자 ID):', realUserId);
    console.log('chatId:', initialChatId);
    console.log('itemId (상품 ID):', itemId);

    logMessage('채팅 참가자 정보', {
      채팅방ID: initialChatId || '아직 생성되지 않음',
      상품ID: itemId,
      구매자ID: buyerId,
      판매자ID: sellerId,
      판매자이름: sellerName,
      상품명: productData?.title || '정보 없음',
    });
  }, []);

  useEffect(() => {
    const checkArrivalStatus = async () => {
      try {
        const arrivalStatus = await AsyncStorage.getItem(`arrival_${itemId}`);
        setIsArrived(arrivalStatus === 'true');
        logMessage('도착 상태 확인', {
          상품ID: itemId,
          도착상태: arrivalStatus === 'true',
        });
      } catch (error) {
        console.error('도착 상태 확인 오류:', error);
      }
    };

    if (itemId) {
      checkArrivalStatus();
    }
  }, [itemId]);

  // 시간 포맷팅 함수 - 수정
  const formatRelativeTime = date => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '--:--';
      }

      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      // 1분 이내면 "방금 전"
      if (diffMinutes < 1) {
        return '방금 전';
      }
      // 1시간 이내면 "~분 전"
      else if (diffHours < 1) {
        return `${diffMinutes}분 전`;
      }
      // 오늘 이내면 "~시간 전"
      else if (diffDays < 1) {
        return `${diffHours}시간 전`;
      }
      // 어제면 "어제"
      else if (diffDays === 1) {
        return '어제';
      }
      // 일주일 이내면 "~일 전"
      else if (diffDays < 7) {
        return `${diffDays}일 전`;
      }
      // 그 이상이면 날짜 표시
      else {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}.${month}.${day}`;
      }
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return '--:--';
    }
  };

  // 새 메시지가 추가되면 스크롤을 아래로
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 200);
    }
  }, [messages]);

  // 히스토리 요청 함수
  const requestChatHistory = (sock, roomId) => {
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      logMessage('히스토리 요청 실패', '소켓 연결이 없습니다');
      return false;
    }

    try {
      const historyRequest = {
        type: 'get_history',
        chat_id: parseInt(roomId, 10),
      };

      logMessage('히스토리 요청', historyRequest);
      sock.send(JSON.stringify(historyRequest));
      return true;
    } catch (error) {
      logMessage('히스토리 요청 오류', error.message);
      return false;
    }
  };

  const handleWebSocketMessage = data => {
    logMessage('웹소켓 메시지 수신', {
      데이터타입: typeof data,
      데이터길이: typeof data === 'string' ? data.length : '알 수 없음',
      채팅방ID: actualChatId,
    });

    try {
      // 문자열 데이터 파싱
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        logMessage('파싱된 데이터', parsedData);
      } catch (e) {
        logMessage('JSON 파싱 실패', e.message);
        parsedData = data;
      }

      // 연결 상태 메시지 처리
      if (parsedData && parsedData.type === 'connection') {
        logMessage('연결 상태', parsedData.status);
        return;
      }

      // 히스토리 메시지 처리
      if (parsedData && parsedData.type === 'history') {
        logMessage('채팅 히스토리 수신', {
          메시지수: parsedData.messages?.length || 0,
          채팅방ID: actualChatId,
        });

        if (!parsedData.messages || !Array.isArray(parsedData.messages)) {
          logMessage('유효하지 않은 히스토리 데이터', parsedData);
          return;
        }

        // 히스토리 메시지를 상태에 맞게 변환
        const historyMessages = parsedData.messages.map(msg => {
          const msgObj = {
            id: msg.id.toString(),
            text: msg.content,
            sender: msg.sender_id,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          };

          // 취소 알림 메시지 식별
          if (msg.content.includes('[알림:취소알림]')) {
            msgObj.isCancelNotification = true;
          }

          return msgObj;
        });

        // 히스토리의 각 메시지에 대한 발신자/수신자 정보 로깅
        historyMessages.forEach((msg, index) => {
          // 실제 사용자 ID로 비교 (기본값으로 buyerId 사용)
          const currentUserId = realUserId !== null ? realUserId : buyerId;
          const isMine = String(msg.sender) === String(currentUserId);
          const senderName = isMine ? '나(사용자)' : '상대방';
          const receiverName = isMine ? '상대방' : '나(사용자)';

          logMessage(`히스토리 메시지 #${index + 1}`, {
            발신자ID: msg.sender,
            발신자: senderName,
            수신자ID: isMine ? sellerId : currentUserId,
            수신자: receiverName,
            메시지:
              msg.text.substring(0, 30) + (msg.text.length > 30 ? '...' : ''),
            시간: msg.timestamp.toISOString(),
          });
        });

        // 메시지 배열 설정
        setMessages(historyMessages);
        return;
      }

      // 히스토리 에러 메시지 처리
      if (parsedData && parsedData.type === 'history_error') {
        logMessage('히스토리 로드 오류', parsedData.message);
        return;
      }

      // 일반 채팅 메시지 처리
      let messageContent = '';
      let messageSenderId = '';

      // 객체 형태 메시지 처리
      if (parsedData && typeof parsedData === 'object') {
        messageContent = parsedData.content || '';
        messageSenderId = parsedData.sender_id || '';
        logMessage('객체 메시지 처리', {
          내용: messageContent,
          발신자ID: messageSenderId,
        });
      }
      // 문자열 형태 메시지 처리
      else if (typeof parsedData === 'string') {
        // Room 형식 메시지
        if (parsedData.startsWith('Room')) {
          const match = parsedData.match(/Room \d+ - Message: (.*)/);
          if (match && match[1]) {
            try {
              const innerParsed = JSON.parse(match[1]);
              messageContent = innerParsed.content || '';
              messageSenderId = innerParsed.sender_id || '';
            } catch (e) {
              messageContent = match[1];
              messageSenderId = sellerId;
            }
          }
        } else {
          messageContent = parsedData;
          messageSenderId = sellerId;
        }
      }

      // 메시지 내용이 없으면 처리하지 않음
      if (!messageContent) {
        logMessage('메시지 내용이 없음', '무시합니다');
        return;
      }

      // 발신자/수신자 정보 명확히 로깅
      const currentUserId = realUserId !== null ? realUserId : buyerId;
      const isSenderMe = String(messageSenderId) === String(currentUserId);
      const receiverId = isSenderMe ? sellerId : currentUserId;

      logMessage('메시지 상세 정보', {
        발신자ID: messageSenderId,
        발신자: isSenderMe ? '나(사용자)' : '상대방',
        수신자ID: receiverId,
        수신자: isSenderMe ? '상대방' : '나(사용자)',
        메시지내용: messageContent,
        채팅방ID: actualChatId,
      });

      // 새 메시지 객체 생성
      const newMessage = {
        id: Date.now().toString(),
        text: messageContent,
        sender: messageSenderId,
        timestamp: new Date(),
      };

      // 취소 알림 메시지 식별
      if (messageContent.includes('[알림:취소알림]')) {
        newMessage.isCancelNotification = true;
      }

      // 상태 업데이트 (함수형 업데이트 사용)
      setMessages(prev => [...prev, newMessage]);
      logMessage('메시지 추가됨', {
        메시지ID: newMessage.id,
        발신자ID: newMessage.sender,
        시간: newMessage.timestamp.toISOString(),
      });
    } catch (error) {
      logMessage('메시지 처리 오류', error.message);
    }
  };

  // 채팅방 생성/조회 함수
  const initChatRoom = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        setLoading(false);
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      logMessage('채팅방 생성/조회 요청', {
        buyer_id: buyerId,
        seller_id: sellerId,
        item_id: itemId,
        real_user_id: realUserId,
      });

      const response = await fetch('http://3.34.59.23/api/v1/chat/chats/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyer_id: parseInt(buyerId, 10),
          seller_id: parseInt(sellerId, 10),
          item_id: parseInt(itemId, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`채팅방 생성 실패: ${response.status}`);
      }

      const chatData = await response.json();
      logMessage('채팅방 생성/조회 성공', chatData);

      // 실제 채팅방 ID 저장
      const newChatId = chatData.id;
      setActualChatId(newChatId);

      // 실제 채팅방 ID로 웹소켓 연결
      connectWebSocket(newChatId, token);
    } catch (error) {
      logMessage('채팅방 초기화 오류', error.message);
      setLoading(false);
      Alert.alert('오류', '채팅방을 시작할 수 없습니다.');
    }
  };
  // 채팅방 연결
  useEffect(() => {
    if (!itemId || !buyerId || !sellerId) {
      setLoading(false);
      Alert.alert('오류', '필요한 정보가 부족합니다.');
      return;
    }

    // 실제 사용자 ID가 아직 로드되지 않았으면 대기
    if (realUserId === null) {
      return;
    }

    // 이미 채팅방 ID가 있으면 바로 연결, 없으면 생성/조회 후 연결
    if (initialChatId) {
      const connectWithExistingId = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          logMessage('기존 채팅방 연결', {
            채팅방ID: initialChatId,
            사용자ID: realUserId,
            구매자ID: buyerId,
            판매자ID: sellerId,
          });
          connectWebSocket(initialChatId, token);
        } else {
          setLoading(false);
          Alert.alert('오류', '로그인이 필요합니다.');
        }
      };

      connectWithExistingId();
    } else {
      logMessage('새 채팅방 생성 시도', {
        사용자ID: realUserId,
        구매자ID: buyerId,
        판매자ID: sellerId,
        상품ID: itemId,
      });
      initChatRoom();
    }

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      if (socket) {
        try {
          logMessage('채팅 종료', {
            채팅방ID: actualChatId,
            사용자ID: realUserId,
            구매자ID: buyerId,
            판매자ID: sellerId,
            메시지수: messages.length,
          });
          socket.close(1000, '정상 종료');
        } catch (error) {
          logMessage('소켓 종료 오류', error.message);
        }
      }
    };
  }, [itemId, buyerId, sellerId, initialChatId, realUserId]); // realUserId 의존성 추가

  const connectWebSocket = (roomId, accessToken) => {
    // user_id 파라미터에 실제 사용자 ID 사용
    const wsUrl = `ws://3.34.59.23/api/v1/chat/ws/chat/${roomId}?token=${encodeURIComponent(
      accessToken,
    )}&user_id=${realUserId}`;

    logMessage('웹소켓 연결 시도', {
      채팅방ID: roomId,
      사용자ID: realUserId,
      URL:
        wsUrl.substring(0, wsUrl.indexOf('?')) +
        '?token=***&user_id=' +
        realUserId,
    });

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logMessage('웹소켓 연결 성공', {
          채팅방ID: roomId,
          사용자ID: realUserId,
          판매자ID: sellerId,
        });
        setConnected(true);
        setLoading(false);

        // 채팅 히스토리 요청
        requestChatHistory(ws, roomId);
      };

      // 웹소켓 메시지 처리 함수 연결
      ws.onmessage = e => {
        logMessage('웹소켓 메시지 수신됨', {
          데이터타입: typeof e.data,
          채팅방ID: roomId,
        });
        handleWebSocketMessage(e.data);
      };

      ws.onerror = error => {
        logMessage('웹소켓 오류', {
          채팅방ID: roomId,
          오류: error.message || '알 수 없는 오류',
        });
        setConnected(false);
        setLoading(false);
      };

      ws.onclose = event => {
        logMessage('웹소켓 연결 종료', {
          채팅방ID: roomId,
          코드: event.code,
          이유: event.reason || '이유 없음',
        });
        setConnected(false);
        setSocket(null);

        // 비정상 종료일 경우 자동 재연결 (선택적)
        if (event.code !== 1000 && event.code !== 1001) {
          setTimeout(async () => {
            logMessage('웹소켓 재연결 시도', {
              채팅방ID: roomId,
              사용자ID: realUserId,
            });
            const newToken = await AsyncStorage.getItem('accessToken');
            if (newToken && !connected) {
              connectWebSocket(roomId, newToken);
            }
          }, 3000);
        }
      };

      setSocket(ws);
    } catch (error) {
      logMessage('웹소켓 생성 오류', error.message);
      setConnected(false);
      setLoading(false);
    }
  };

  // 메시지 전송 함수
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    if (!socket) {
      logMessage('메시지 전송 실패', '소켓이 없음');
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      logMessage('메시지 전송 실패', {
        이유: '소켓 연결 끊김',
        소켓상태: socket.readyState,
      });
      Alert.alert('연결 오류', '채팅 연결이 끊어졌습니다. 다시 연결 중...');

      // 재연결 시도
      reconnectWebSocket();
      return;
    }

    // type 필드 추가하고 숫자 타입을 사용하는 ID 변환
    const messageData = {
      type: 'chat',
      content: inputMessage,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10), // 실제 사용자 ID 사용
      timestamp: new Date().toISOString(),
    };

    // 메시지 발신 정보 명확히 로깅
    logMessage('메시지 전송', {
      메시지타입: 'chat',
      채팅방ID: actualChatId,
      발신자ID: realUserId,
      발신자: '나(사용자)',
      수신자ID: sellerId,
      수신자: '판매자',
      메시지내용: inputMessage,
      시간: messageData.timestamp,
    });

    // 내 메시지 UI에 즉시 추가
    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: realUserId, // 실제 사용자 ID 사용
      timestamp: new Date(),
    };

    // 메시지 추가
    setMessages(prev => [...prev, newMessage]);

    // 소켓으로 메시지 전송
    try {
      socket.send(JSON.stringify(messageData));
      logMessage('메시지 전송 성공', {
        메시지ID: newMessage.id,
        채팅방ID: actualChatId,
      });
    } catch (error) {
      logMessage('메시지 전송 오류', error.message);
      Alert.alert('오류', '메시지를 전송할 수 없습니다.');
    }

    // 입력창 초기화
    setInputMessage('');
  };

  const reconnectWebSocket = async () => {
    setConnected(false);

    if (socket) {
      try {
        // 기존 소켓이 아직 열려있다면 정상적으로 닫기
        if (socket.readyState === WebSocket.OPEN) {
          logMessage('소켓 재연결 위해 연결 종료', {
            채팅방ID: actualChatId,
          });
          socket.close(1000, '정상 종료 후 재연결');
        }
      } catch (error) {
        logMessage('소켓 종료 오류', error.message);
      }
    }

    // 잠시 대기 후 다시 연결
    setTimeout(async () => {
      const savedToken = await AsyncStorage.getItem('accessToken');
      if (savedToken) {
        logMessage('웹소켓 재연결 시작', {
          채팅방ID: actualChatId,
          사용자ID: realUserId,
        });
        connectWebSocket(actualChatId, savedToken);
      }
    }, 1000);
  };

  const isTradeMessage = text => {
    return (
      text.includes('[거래약속]') ||
      text.includes('[거래수락]') ||
      text.includes('[거래거절]')
    );
  };

  const isNotificationMessage = text => {
    return (
      text.includes('[알림]') ||
      text.includes('[도착알림]') ||
      text.includes('[알림취소]')
    );
  };

  // 거래 수락 메시지 보내기 함수
  const sendTradeAcceptMessage = info => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
      return;
    }

    const acceptMessage = `[거래수락] 약속시간: ${info.time}, 장소: ${info.location}`;

    const messageData = {
      type: 'chat',
      content: acceptMessage,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10),
      timestamp: new Date().toISOString(),
    };

    // 내 메시지 UI에 즉시 추가
    const newMessage = {
      id: Date.now().toString(),
      text: acceptMessage,
      sender: realUserId,
      timestamp: new Date(),
    };

    // 메시지 추가
    setMessages(prev => [...prev, newMessage]);

    // 소켓으로 메시지 전송
    try {
      socket.send(JSON.stringify(messageData));

      // 알림 메시지도 추가
      const notificationMessage = `[알림] 거래가 수락되었습니다. 약속 시간에 도착하면 '도착 알리기' 버튼을 눌러주세요.`;
      const notificationData = {
        type: 'chat',
        content: notificationMessage,
        chat_id: parseInt(actualChatId, 10),
        sender_id: parseInt(realUserId, 10),
        timestamp: new Date().toISOString(),
      };

      // 알림 메시지 UI에 즉시 추가
      const notificationMsg = {
        id: Date.now().toString() + '_notification',
        text: notificationMessage,
        sender: realUserId,
        timestamp: new Date(),
      };

      // 메시지 추가 - 약간의 시간차를 두고 추가
      setTimeout(() => {
        setMessages(prev => [...prev, notificationMsg]);
        socket.send(JSON.stringify(notificationData));
      }, 300);
    } catch (error) {
      logMessage('거래수락 메시지 전송 오류', error.message);
      Alert.alert('오류', '메시지를 전송할 수 없습니다.');
    }
  };

  // 거래 거절 메시지 보내기 함수
  const sendTradeDeclineMessage = info => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
      return;
    }

    const declineMessage = `[거래거절] 약속시간: ${info.time}, 장소: ${info.location}`;

    const messageData = {
      type: 'chat',
      content: declineMessage,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10),
      timestamp: new Date().toISOString(),
    };

    // 내 메시지 UI에 즉시 추가
    const newMessage = {
      id: Date.now().toString(),
      text: declineMessage,
      sender: realUserId,
      timestamp: new Date(),
    };

    // 메시지 추가
    setMessages(prev => [...prev, newMessage]);

    // 소켓으로 메시지 전송
    try {
      socket.send(JSON.stringify(messageData));
      Alert.alert('알림', '거래 약속을 거절했습니다.');
    } catch (error) {
      logMessage('거래거절 메시지 전송 오류', error.message);
      Alert.alert('오류', '메시지를 전송할 수 없습니다.');
    }
  };

  // 4. 약속 취소 처리 함수 추가
  const handleCancelAppointment = async itemIdFromCancel => {
    logMessage('약속 취소 처리', {
      상품ID: itemIdFromCancel || itemId,
    });

    // 취소 알림 숨기기
    setShowCancelNotification(false);

    // 도착 상태 해제
    setIsArrived(false);

    // 취소 메시지 전송
    if (socket && socket.readyState === WebSocket.OPEN) {
      const cancelMessage = `[약속취소] 거래 약속이 취소되었습니다.`;

      const messageData = {
        type: 'chat',
        content: cancelMessage,
        chat_id: parseInt(actualChatId, 10),
        sender_id: parseInt(realUserId, 10),
        timestamp: new Date().toISOString(),
      };

      // 메시지 추가
      const newMessage = {
        id: Date.now().toString(),
        text: cancelMessage,
        sender: realUserId,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);

      // 소켓으로 메시지 전송
      socket.send(JSON.stringify(messageData));
      logMessage('약속 취소 메시지 전송 성공', {
        메시지ID: newMessage.id,
        채팅방ID: actualChatId,
      });
    }
  };

  // 5. 취소 알림 무시 처리 함수 추가
  const handleIgnoreCancelNotification = () => {
    setShowCancelNotification(false);
    logMessage('취소 알림 무시됨', {
      상품ID: itemId,
    });
  };

  const renderMessage = ({item, index}) => {
    // 내 메시지인지 판단 (실제 사용자 ID와 비교)
    const isMyMessage = String(item.sender) === String(realUserId);

    // 디버깅용 로그 추가
    console.log('메시지 렌더링:', {
      메시지: item.text.substring(0, 30),
      타입: item.text.includes('[거래')
        ? '거래메시지'
        : item.text.includes('[알림')
        ? '알림메시지'
        : '일반메시지',
      내메시지여부: isMyMessage,
      buyerId: buyerId,
      sellerId: sellerId,
      itemId: itemId,
      chatId: actualChatId,
      realUserId: realUserId,
    });

    // 거래약속 메시지인 경우 특별한 컴포넌트 렌더링
    if (isTradeMessage(item.text)) {
      // 이 메시지에 저장된 날짜 객체가 있으면 사용, 없으면 마지막으로 저장된 날짜 사용
      const appointmentDate = item.appointmentDate || lastAppointmentDate;

      return (
        <TradeMessage
          message={item.text}
          time={formatRelativeTime(item.timestamp)}
          isSender={isMyMessage}
          onAccept={sendTradeAcceptMessage}
          onDecline={sendTradeDeclineMessage}
          buyerId={buyerId}
          sellerId={sellerId}
          itemId={itemId}
          chatId={actualChatId}
          appointmentDate={item.appointmentDate || lastAppointmentDate}
        />
      );
    }

    // 알림 메시지인 경우 NotificationMessage 컴포넌트 렌더링
    if (isNotificationMessage(item.text)) {
      return (
        <NotificationMessage
          message={item.text}
          time={formatRelativeTime(item.timestamp)}
          isSender={isMyMessage}
          onNotifyArrival={sendArrivalNotification}
          onCancel={sendNotificationCancel}
          itemId={itemId}
        />
      );
    }

    // 취소 알림 메시지 특별 처리 (수정된 부분)
    if (item.isCancelNotification || item.text.includes('[알림:취소알림]')) {
      // 이미 이전에 취소 알림이 표시되었는지 확인
      const isFirstCancelNotification = !messages
        .slice(0, index)
        .some(
          msg =>
            msg.isCancelNotification || msg.text.includes('[알림:취소알림]'),
        );

      // 첫 번째 취소 알림이고, 내가 보낸 메시지일 때만 취소 버튼이 있는 알림을 보여줌
      if (isFirstCancelNotification && isMyMessage) {
        return (
          <CancelNotification
            message="거래 장소에 도착했습니다. 약속을 취소하려면 아래 버튼을 눌러주세요."
            time={formatRelativeTime(item.timestamp)}
            onCancelAppointment={handleCancelAppointment}
            onIgnore={handleIgnoreCancelNotification}
            itemId={itemId}
            chatId={actualChatId}
          />
        );
      }
      // 상대방의 취소 알림은 일반 알림으로 표시 (버튼 없이)
      else if (isFirstCancelNotification && !isMyMessage) {
        return (
          <NotificationMessage
            message="상대방이 거래 장소에 도착했습니다."
            time={formatRelativeTime(item.timestamp)}
            isSender={false}
            itemId={itemId}
          />
        );
      }
      // 중복된 취소 알림은 표시하지 않음
      return null;
    }

    // 일반 메시지 렌더링 (기존 코드)
    return isMyMessage ? (
      <MyMessage>
        <MessageText isMyMessage={true}>{item.text}</MessageText>
        <TimeText isMyMessage={true}>
          {formatRelativeTime(item.timestamp)}
        </TimeText>
      </MyMessage>
    ) : (
      <OtherMessage>
        <MessageText isMyMessage={false}>{item.text}</MessageText>
        <TimeText isMyMessage={false}>
          {formatRelativeTime(item.timestamp)}
        </TimeText>
      </OtherMessage>
    );
  };

  const openTradeModal = () => {
    setIsModalVisible(true);
  };

  // 거래 모달 닫기 함수
  const closeTradeModal = () => {
    setIsModalVisible(false);
  };

  // 거래 약속 확인 함수
  // TradeModal의 결과를 처리하는 함수 수정
  const confirmTradeModal = info => {
    setTradeInfo(info);
    setIsModalVisible(false);

    // 선택된 날짜 객체 저장
    setLastAppointmentDate(info.date);

    // 거래 약속 정보를 메시지로 전송
    const tradeMessage = `[거래약속] 약속시간: ${info.formattedDate}, 장소: ${info.location}`;

    // 거래 약속 메시지를 채팅에 추가
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'chat',
        content: tradeMessage,
        chat_id: parseInt(actualChatId, 10),
        sender_id: parseInt(realUserId, 10),
        timestamp: new Date().toISOString(),
      };

      // 내 메시지 UI에 즉시 추가
      const newMessage = {
        id: Date.now().toString(),
        text: tradeMessage,
        sender: realUserId,
        timestamp: new Date(),
        appointmentDate: info.date, // 날짜 객체도 메시지에 저장
      };

      // 메시지 추가
      setMessages(prev => [...prev, newMessage]);

      // 소켓으로 메시지 전송
      try {
        socket.send(JSON.stringify(messageData));
        // ... 기존 코드 ...
      } catch (error) {
        // ... 기존 코드 ...
      }
    } else {
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
    }
  };

  const sendArrivalNotification = async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
      return;
    }

    // 상대방에게 보낼 도착 알림
    const arrivalMessageForOther = `[도착알림:simple] 상대방이 거래 장소에 도착했습니다.`;

    // 나에게만 표시될 취소 알림 (취소 버튼 포함)
    const cancelNotificationMessage = `[알림:취소알림] 거래 장소에 도착했습니다. 약속을 취소하려면 아래 버튼을 눌러주세요.`;

    // 메시지 객체 생성
    const otherMessageData = {
      type: 'chat',
      content: arrivalMessageForOther,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10),
      timestamp: new Date().toISOString(),
    };

    const cancelMessageData = {
      type: 'chat',
      content: cancelNotificationMessage,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10),
      timestamp: new Date().toISOString(),
    };

    try {
      // 상대방에게 알림 메시지 전송
      socket.send(JSON.stringify(otherMessageData));

      // 취소 알림 메시지를 UI에 즉시 추가 (서버에는 보내지 않음)
      const cancelNotificationMsg = {
        id: Date.now().toString() + '_cancel',
        text: cancelNotificationMessage,
        sender: realUserId,
        timestamp: new Date(),
        isCancelNotification: true,
      };

      // UI에만 추가 (로컬 상태)
      setMessages(prev => [...prev, cancelNotificationMsg]);

      // 도착 상태 저장 (AsyncStorage는 로컬 상태 추적 용도)
      await AsyncStorage.setItem(`arrival_${itemId}`, 'true');
      setIsArrived(true);

      logMessage('도착 알림 메시지 전송 성공', {
        채팅방ID: actualChatId,
      });

      Alert.alert('알림', '도착 알림을 보냈습니다.');
    } catch (error) {
      logMessage('도착 알림 메시지 전송 오류', error.message);
      Alert.alert('오류', '알림 메시지를 보낼 수 없습니다.');
    }
  };

  // 알림 취소 메시지 보내기 함수
  const sendNotificationCancel = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      Alert.alert('연결 오류', '채팅 서버에 연결되어 있지 않습니다.');
      return;
    }

    const cancelMessage = `[알림취소] 이전 알림이 취소되었습니다.`;

    const messageData = {
      type: 'chat',
      content: cancelMessage,
      chat_id: parseInt(actualChatId, 10),
      sender_id: parseInt(realUserId, 10),
      timestamp: new Date().toISOString(),
    };

    // 내 메시지 UI에 즉시 추가
    const newMessage = {
      id: Date.now().toString(),
      text: cancelMessage,
      sender: realUserId,
      timestamp: new Date(),
    };

    // 메시지 추가
    setMessages(prev => [...prev, newMessage]);

    // 소켓으로 메시지 전송
    try {
      socket.send(JSON.stringify(messageData));
      logMessage('알림취소 메시지 전송 성공', {
        메시지ID: newMessage.id,
        채팅방ID: actualChatId,
      });
    } catch (error) {
      logMessage('알림취소 메시지 전송 오류', error.message);
      Alert.alert('오류', '메시지를 전송할 수 없습니다.');
    }
  };

  const completeTransaction = async () => {
    setIsTradeButtonLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setIsTradeButtonLoading(false);
        return;
      }

      // 거래 완료 API 호출 (success 엔드포인트 사용)
      const response = await axios.post(
        'http://3.34.59.23/api/v1/transaction/success',
        {
          sale_id: parseInt(itemId, 10),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      logMessage('거래 완료 API 응답', {
        상태코드: response.status,
        응답데이터: response.data,
      });

      console.log('거래 완료 응답:', response.data);

      // 응답 값에 따른 처리
      if (response.status === 200) {
        if (response.data === -1) {
          // 응답 값이 -1인 경우: 판매중인 상품을 찾을 수 없음
          Alert.alert('오류', '판매중인 상품을 찾을 수 없습니다.');
        } else if (response.data === 0 || response.data === '0') {
          // 응답 값이 0인 경우: 성공적으로 처리됨
          // 거래 완료 상태 저장
          await AsyncStorage.setItem(`complete_${itemId}`, 'true');
          setIsTradeComplete(true);

          // 거래 완료 메시지 전송
          const completeMessage = `[거래완료] 거래가 성공적으로 완료되었습니다.`;

          const messageData = {
            type: 'chat',
            content: completeMessage,
            chat_id: parseInt(actualChatId, 10),
            sender_id: parseInt(realUserId, 10),
            timestamp: new Date().toISOString(),
          };

          // 메시지 추가
          const newMessage = {
            id: Date.now().toString(),
            text: completeMessage,
            sender: realUserId,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, newMessage]);

          // 소켓으로 메시지 전송
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(messageData));
          }

          Alert.alert('거래 완료', '거래가 성공적으로 완료되었습니다!', [
            {text: '확인', onPress: () => navigation.goBack()},
          ]);
        } else {
          // 그 외 응답 값: 일반적인 오류 메시지
          Alert.alert('오류', '거래 완료 처리에 실패했습니다.');
        }
      } else {
        Alert.alert('오류', '서버 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('거래 완료 오류:', error);
      Alert.alert('오류', '거래 완료 처리 중 문제가 발생했습니다.');
    } finally {
      setIsTradeButtonLoading(false);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <SafeContainer>
        <Header>
          <BackButton onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="black" />
          </BackButton>
          <HeaderTitle>{sellerName}</HeaderTitle>
        </Header>
        <Container>
          <EmptyView>
            <ActivityIndicator size="large" color="lightsalmon" />
            <Text style={{marginTop: 10}}>채팅방 연결 중...</Text>
          </EmptyView>
        </Container>
      </SafeContainer>
    );
  }
  return (
    <SafeContainer>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </BackButton>
        <HeaderTitle>{sellerName}</HeaderTitle>
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <Container>
          <ProductInfoContainer>
            <ProductImage
              source={{uri: productData.images[0]}}
              resizeMode="cover"
            />
            <ProductLeftFrame>
              <ProductInfo>
                <ProductTitle>{productData.title}</ProductTitle>
                <ProductPrice>{productData.value}원</ProductPrice>
              </ProductInfo>
            </ProductLeftFrame>
            <ProductLeftFrame>
              {isTradeButtonLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : isArrived ? (
                <CompleteTradeButton onPress={completeTransaction}>
                  <CompleteButtonText>거래 완료하기</CompleteButtonText>
                </CompleteTradeButton>
              ) : (
                <TradeButton onPress={openTradeModal}>
                  <Text>거래하기</Text>
                </TradeButton>
              )}
            </ProductLeftFrame>
          </ProductInfoContainer>

          <ChatContainer>
            {messages.length === 0 ? (
              <EmptyView>
                <EmptyText>메시지가 없습니다. 대화를 시작해보세요!</EmptyText>
              </EmptyView>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => {
                  return `${item.id}_${item.timestamp.getTime()}`;
                }}
                contentContainerStyle={{padding: 10}}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({animated: true})
                }
              />
            )}
          </ChatContainer>

          <InputContainer>
            <MessageInput
              placeholder="메시지를 입력하세요"
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={sendMessage}
            />
            <SendButton onPress={sendMessage} disabled={!connected}>
              <Icon name="send" size={18} color="white" />
            </SendButton>
          </InputContainer>

          <TradeModal
            visible={isModalVisible}
            onClose={closeTradeModal}
            onConfirm={confirmTradeModal}
            itemTitle={productData?.title}
            itemLocation={
              productData?.location
                ? `${productData.location.latitude}, ${productData.location.longitude}`
                : ''
            } // 위치 정보 전달
          />
        </Container>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

export default Chat;
