import React, {useState} from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 거래약속 메시지 스타일 (중앙에 정렬, 특별한 디자인으로 표시)
const TradeMessageContainer = styled.View`
  width: 90%;
  align-self: center;
  background-color: white;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
`;

const TradeHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const TradeIcon = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: lightsalmon;
  margin-right: 8px;
  justify-content: center;
  align-items: center;
`;

const TradeTitle = styled.Text`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const TradeContent = styled.Text`
  font-size: 14px;
  color: #444;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  padding: 8px;
  border-radius: 5px;
  margin: 0 5px;
  align-items: center;
  background-color: ${props => (props.accept ? 'lightsalmon' : '#f0f0f0')};
`;

const ButtonText = styled.Text`
  font-size: 13px;
  color: ${props => (props.accept ? 'white' : '#666')};
  font-weight: ${props => (props.accept ? 'bold' : 'normal')};
`;

const TimeStamp = styled.Text`
  font-size: 10px;
  color: #999;
  align-self: flex-end;
  margin-top: 5px;
`;

// 거래약속 메시지 컴포넌트
const TradeMessage = ({
  message,
  time,
  isSender,
  onAccept,
  onDecline,
  buyerId,
  sellerId,
  itemId,
  chatId, // 채팅방 ID 추가
  appointmentDate,
}) => {
  const [loading, setLoading] = useState(false);
  // 거래약속 메시지 내용 파싱
  const parseTradeMessage = text => {
    // '[거래약속] 약속시간: YYYY년 MM월 DD일 오전/오후 H:MM, 장소: 위치' 형식에서 정보 추출
    const timeMatch = text.match(/약속시간: ([^,]+)/);
    const locationMatch = text.match(/장소: (.+)$/);

    return {
      time: timeMatch ? timeMatch[1] : '시간 정보 없음',
      location: locationMatch ? locationMatch[1] : '장소 정보 없음',
    };
  };

  const tradeInfo = parseTradeMessage(message);

  // 메시지 타입 확인
  const isTradeProposal = message.includes('[거래약속]');
  const isTradeAccepted = message.includes('[거래수락]');
  const isTradeDeclined = message.includes('[거래거절]');

  const logDataWithTimestamp = (label, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${label}:`, data);
  };

  // 거래 수락 API 요청 함수
  const makeTransaction = async info => {
    setLoading(true);
    logDataWithTimestamp('거래 수락 시작', {
      tradeInfo: info,
      buyerId: buyerId,
      sellerId: sellerId,
      itemId: itemId,
    });

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setLoading(false);
        return false;
      }

      // 약속 시간을 ISO 형식으로 변환
      const appointmentTime = parseAppointmentTimeToISO(info.time);
      logDataWithTimestamp('파싱된 약속 시간', {
        원본: info.time,
        ISO변환: appointmentTime,
      });

      const requestData = {
        buyer_id: parseInt(buyerId, 10),
        sale_id: parseInt(itemId, 10), // 여기는 그대로 itemId 사용
        appointment_time: appointmentTime,
      };

      logDataWithTimestamp('거래 생성 API 요청 데이터', requestData);

      console.log('===========================================');
      console.log('make_trans API 요청 시작:');
      console.log(
        '요청 URL:',
        'http://3.34.59.23/api/v1/transaction/make_trans',
      );
      console.log('요청 데이터:', JSON.stringify(requestData, null, 2));
      console.log('===========================================');

      const response = await axios.post(
        'http://3.34.59.23/api/v1/transaction/make_trans',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 응답 데이터 상세 출력
      console.log('===========================================');
      console.log('make_trans API 응답 성공:');
      console.log('상태 코드:', response.status);
      console.log('응답 헤더:', JSON.stringify(response.headers, null, 2));
      console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
      console.log('===========================================');

      // 트랜잭션 ID 확인 (있을 경우)
      if (response.data && response.data.id) {
        console.log('✅ 생성된 트랜잭션 ID:', response.data.id);
      }

      if (response.data && response.data.transaction_id) {
        console.log('✅ 생성된 트랜잭션 ID:', response.data.transaction_id);
      }

      // 기존 로깅도 유지
      logDataWithTimestamp('거래 생성 API 응답', {
        상태: response.status,
        데이터: response.data,
      });

      setLoading(false);
      return true;
    } catch (error) {
      // 에러 발생 시 상세 정보 출력
      console.log('===========================================');
      console.log('❌ make_trans API 오류 발생:');
      console.log('오류 메시지:', error.message);

      // 서버 응답이 있는 경우
      if (error.response) {
        console.log('상태 코드:', error.response.status);
        console.log(
          '응답 데이터:',
          JSON.stringify(error.response.data, null, 2),
        );
      } else if (error.request) {
        console.log('요청은 전송되었으나 응답이 없음');
        console.log('요청 객체:', error.request);
      } else {
        console.log('요청 설정 과정에서 오류 발생');
      }
      console.log('오류 세부정보:', error.stack);
      console.log('===========================================');

      // 기존 로깅도 유지
      logDataWithTimestamp('거래 생성 오류', {
        메시지: error.message,
        스택: error.stack,
      });

      // 에러 세부 정보 로깅
      if (error.response) {
        logDataWithTimestamp('서버 응답 오류', {
          상태: error.response.status,
          헤더: error.response.headers,
          데이터: error.response.data,
        });
      } else if (error.request) {
        logDataWithTimestamp('요청 오류', {
          요청객체: error.request,
          메시지: '서버로부터 응답이 없습니다',
        });
      } else {
        logDataWithTimestamp('요청 설정 오류', {
          메시지: error.message,
        });
      }

      Alert.alert('오류', '거래를 생성할 수 없습니다. 다시 시도해주세요.');
      setLoading(false);
      return false;
    }
  };

  const parseAppointmentTimeToISO = dateTimeString => {
    try {
      // "2023년 12월 25일 오후 3:30" 형식을 파싱
      const dateRegex =
        /(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일\s+(오전|오후)\s+(\d{1,2}):(\d{2})/;
      const match = dateTimeString.match(dateRegex);

      if (!match) {
        console.error('날짜 형식 파싱 실패:', dateTimeString);
        return new Date().toISOString();
      }

      const [_, year, month, day, ampm, hours, minutes] = match;

      // 12시간제를 24시간제로 변환
      let hour = parseInt(hours, 10);
      if (ampm === '오후' && hour < 12) hour += 12;
      if (ampm === '오전' && hour === 12) hour = 0;

      // 원하는 형식으로 변환 (YYYY-MM-DD HH:MM:SS)
      const formattedMonth = String(parseInt(month, 10)).padStart(2, '0');
      const formattedDay = String(parseInt(day, 10)).padStart(2, '0');
      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinutes = String(parseInt(minutes, 10)).padStart(2, '0');

      return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinutes}:00`;
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      // 오류 시 현재 시간을 원하는 형식으로 반환
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    }
  };

  // 거래 수락 버튼 핸들러
  const handleAccept = () => {
    logDataWithTimestamp('수락 버튼 클릭', {
      거래정보: tradeInfo,
      메시지: message,
      isSender: isSender,
    });

    Alert.alert('거래약속 수락', '이 거래약속을 수락하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '수락',
        onPress: async () => {
          logDataWithTimestamp('수락 확인됨', {
            거래정보: tradeInfo,
          });

          // 백엔드 API 호출
          const success = await makeTransaction(tradeInfo);

          logDataWithTimestamp('거래 생성 결과', {
            성공여부: success,
          });

          if (success) {
            // 채팅 메시지 전송을 위해 onAccept 콜백 호출
            logDataWithTimestamp('onAccept 콜백 호출', {
              콜백존재여부: !!onAccept,
            });

            if (onAccept) onAccept(tradeInfo);
            Alert.alert('성공', '거래가 성공적으로 생성되었습니다.');
          }
        },
      },
    ]);
  };

  // 거래 거절 버튼 핸들러
  const handleDecline = () => {
    Alert.alert('거래약속 거절', '이 거래약속을 거절하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '거절',
        onPress: () => {
          if (onDecline) onDecline(tradeInfo);
        },
      },
    ]);
  };

  let title = '거래약속';
  if (isTradeAccepted) title = '거래수락';
  if (isTradeDeclined) title = '거래거절';

  return (
    <TradeMessageContainer>
      <TradeHeader>
        <TradeIcon>
          <Text style={{fontSize: 12, color: 'white'}}>💬</Text>
        </TradeIcon>
        <TradeTitle>{title}</TradeTitle>
      </TradeHeader>

      <TradeContent>약속시간: {tradeInfo.time}</TradeContent>

      {/* 거래약속 메시지이고, 내가 보낸 메시지가 아닐 경우에만 버튼 표시 */}
      {isTradeProposal && !isSender && (
        <ButtonContainer>
          <ActionButton accept onPress={handleAccept}>
            <ButtonText accept>수락하기</ButtonText>
          </ActionButton>
          <ActionButton onPress={handleDecline}>
            <ButtonText>거절하기</ButtonText>
          </ActionButton>
        </ButtonContainer>
      )}

      {/* 내가 보낸 거래약속 메시지일 경우 */}
      {isTradeProposal && isSender && (
        <TradeContent style={{fontStyle: 'italic', color: '#888'}}>
          상대방의 응답을 기다리는 중입니다.
        </TradeContent>
      )}

      {/* 수락/거절된 거래약속일 경우 */}
      {(isTradeAccepted || isTradeDeclined) && (
        <TradeContent
          style={{
            fontStyle: 'italic',
            color: isTradeAccepted ? '#4CAF50' : '#F44336',
            fontWeight: 'bold',
          }}>
          {isTradeAccepted
            ? '거래가 수락되었습니다.'
            : '거래가 거절되었습니다.'}
        </TradeContent>
      )}

      <TimeStamp>{time}</TimeStamp>
    </TradeMessageContainer>
  );
};

export default TradeMessage;
