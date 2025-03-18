import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
`;

const ChatItemContainer = styled.TouchableOpacity`
  width: 100%;
  height: 100px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
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
  background-color: #f0f0f0;
`;

const ExplainFrame = styled.View`
  flex: 7;
  justify-content: center;
`;

const NickNameFrame = styled.View`
  flex-direction: row;
  align-items: flex-end;
  padding: 2%;
`;

const NickName = styled.Text`
  font-weight: bold;
  font-size: 16px;
`;

const DateText = styled.Text`
  font-size: 12px;
  margin-left: 10px;
  color: gray;
`;

const LastChatFrame = styled.View`
  padding: 2%;
`;

const LastChat = styled.Text`
  color: gray;
`;

const ProductInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

const ProductThumbnail = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 5px;
  margin-right: 8px;
  background-color: #f0f0f0;
`;

const ProductTitle = styled.Text`
  font-size: 12px;
  color: #666;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #999;
  margin-top: 10px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const userProfileCache = {};

// ChatItem 컴포넌트 분리 (각 채팅방 항목)
const ChatItem = ({item, currentUserId, onPress}) => {
  const [otherUserDetails, setOtherUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // 현재 사용자가 구매자인지 판매자인지 확인
  const isBuyer = item.buyer.id === currentUserId;
  const otherUser = isBuyer ? item.seller : item.buyer;

  // 안전하게 메시지와 날짜 정보 추출
  let lastMessage = '메시지가 없습니다.';
  let lastMessageDate = formatDate(item.created_at);

  if (
    item.messages &&
    Array.isArray(item.messages) &&
    item.messages.length > 0
  ) {
    lastMessage = item.messages[0].content || '내용 없음';
    lastMessageDate = formatDate(item.messages[0].created_at);
  }

  // 날짜 변환 함수
  function formatDate(dateString) {
    try {
      if (!dateString) return '날짜 정보 없음';

      // Date 생성자를 직접 사용하고, 지역 변수로 Date를 선언하지 않음
      const dateObj = new Date(dateString);

      // 유효한 날짜인지 확인
      if (isNaN(dateObj.getTime())) {
        console.log('유효하지 않은 날짜:', dateString);
        return '날짜 정보 없음';
      }

      const now = new Date();
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // 오늘
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (diffDays < 7) {
        // 일주일 이내
        return `${diffDays}일 전`;
      } else if (diffDays < 30) {
        // 한 달 이내
        return `${Math.floor(diffDays / 7)}주 전`;
      } else if (diffDays < 365) {
        // 1년 이내
        return `${Math.floor(diffDays / 30)}달 전`;
      } else {
        // 1년 이상
        return `${Math.floor(diffDays / 365)}년 전`;
      }
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '날짜 정보 없음';
    }
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      // 캐시에 사용자 정보가 있으면 사용
      if (userProfileCache[otherUser.id]) {
        setOtherUserDetails(userProfileCache[otherUser.id]);
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          `http://3.34.59.23/api/v1/users/${otherUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );

        // 응답 데이터 캐싱 및 상태 업데이트
        userProfileCache[otherUser.id] = response.data;
        setOtherUserDetails(response.data);
      } catch (error) {
        console.error('사용자 상세 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [otherUser.id]);

  // 프로필 이미지 URL 결정
  const profileImageUrl = otherUserDetails?.profile_image_url || null;

  // 이미지 소스 설정 - 프로필 이미지가 있으면 사용, 없으면 기본 이미지
  const imageSource = profileImageUrl
    ? {uri: profileImageUrl}
    : require('../assets/testImage/chefLogo.png'); // 기본 이미지 경로

  return (
    <ChatItemContainer onPress={() => onPress(item)}>
      <IconFrame>
        {loading ? (
          <ActivityIndicator size="small" color="lightgray" />
        ) : (
          <ProfileImage
            source={imageSource}
            defaultSource={require('../assets/testImage/chefLogo.png')}
          />
        )}
      </IconFrame>
      <ExplainFrame>
        <NickNameFrame>
          <NickName>
            {otherUserDetails?.nickname || otherUser.name || '사용자'}
          </NickName>
          <DateText>{lastMessageDate}</DateText>
        </NickNameFrame>
        <LastChatFrame>
          <LastChat>{lastMessage}</LastChat>
          <ProductInfo>{/* 상품 정보 표시 (주석 처리) */}</ProductInfo>
        </LastChatFrame>
      </ExplainFrame>
    </ChatItemContainer>
  );
};

const ChatListBox = ({
  refreshing: externalRefreshing,
  onRefresh: externalOnRefresh,
}) => {
  const navigation = useNavigation();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const fetchChatRooms = async () => {
    try {
      let token;
      try {
        token = await AsyncStorage.getItem('accessToken');
      } catch (asyncError) {
        console.error('AsyncStorage 오류:', asyncError);
        setLoading(false);
        return;
      }

      if (!token) {
        console.log('토큰이 없습니다. 로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 현재 사용자 정보 조회
      try {
        const userResponse = await axios.get(
          'http://3.34.59.23/api/v1/users/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000, // 10초 타임아웃 설정
          },
        );

        if (userResponse.data && userResponse.data.id) {
          const userId = userResponse.data.id;
          setCurrentUserId(userId);
          console.log('현재 사용자 ID:', userId);

          // 채팅방 목록 조회
          const chatResponse = await axios.get(
            `http://3.34.59.23/api/v1/chat/chats?user_id=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
              timeout: 10000, // 10초 타임아웃 설정
            },
          );

          console.log('채팅방 조회 결과:', chatResponse.data);

          if (Array.isArray(chatResponse.data)) {
            setChatRooms(chatResponse.data);
          } else {
            console.error('잘못된 채팅방 데이터 형식:', chatResponse.data);
            setChatRooms([]);
          }
        } else {
          console.error('사용자 정보 없음:', userResponse.data);
        }
      } catch (apiError) {
        console.error('API 호출 오류:', apiError);
        // 네트워크 오류 처리
        if (apiError.response) {
          // 서버가 응답했으나 2xx 범위가 아닌 상태 코드
          console.error(
            '응답 오류:',
            apiError.response.status,
            apiError.response.data,
          );
        } else if (apiError.request) {
          // 요청이 만들어졌으나 응답을 받지 못함
          console.error('네트워크 오류: 응답 없음');
        } else {
          // 요청 설정 중 문제 발생
          console.error('요청 설정 오류:', apiError.message);
        }
      }
    } catch (error) {
      console.error('채팅방 목록 조회 중 예상치 못한 오류:', error);
    } finally {
      setLoading(false);
      setInternalRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  // 내부 새로고침 함수
  const handleRefresh = async () => {
    setInternalRefreshing(true);
    await fetchChatRooms();
  };

  // 외부와 내부 새로고침 함수를 결합
  const onRefresh = useCallback(async () => {
    if (externalOnRefresh) {
      await externalOnRefresh();
    }
    await handleRefresh();
  }, [externalOnRefresh]);

  const handleChatRoomPress = chatRoom => {
    try {
      // 데이터 유효성 검사
      if (!chatRoom || !chatRoom.buyer || !chatRoom.seller || !chatRoom.item) {
        console.error('채팅방 데이터가 불완전합니다:', chatRoom);
        return;
      }

      const isBuyer = chatRoom.buyer.id === currentUserId;
      const otherUser = isBuyer ? chatRoom.seller : chatRoom.buyer;

      // 채팅 화면으로 이동
      navigation.navigate('Chat', {
        chatId: chatRoom.id,
        itemId: chatRoom.item.id,
        productData: {
          id: chatRoom.item.id,
          title: chatRoom.item.title || '상품명 없음',
          value: chatRoom.item.value || 0,
          images: ['https://via.placeholder.com/150'], // 기본 이미지 사용
          user: {
            id: chatRoom.seller.id,
            nickname: chatRoom.seller.name || '판매자',
          },
        },
        sellerId: chatRoom.seller.id,
        sellerName: chatRoom.seller.name || '판매자',
        buyerId: chatRoom.buyer.id,
        buyerName: chatRoom.buyer.name || '구매자',
      });

      console.log('채팅방으로 이동:', chatRoom.id);
    } catch (error) {
      console.error('채팅방 이동 오류:', error);
      Alert.alert('오류', '채팅방을 열 수 없습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="lightsalmon" />
      </LoadingContainer>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <EmptyContainer>
        <EmptyText>아직 대화 중인 채팅방이 없습니다.</EmptyText>
      </EmptyContainer>
    );
  }

  return (
    <Container>
      <FlatList
        data={chatRooms}
        renderItem={({item}) => (
          <ChatItem
            item={item}
            currentUserId={currentUserId}
            onPress={handleChatRoomPress}
          />
        )}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={externalRefreshing || internalRefreshing}
            onRefresh={onRefresh}
            colors={['lightsalmon']}
          />
        }
      />
    </Container>
  );
};

export default ChatListBox;
