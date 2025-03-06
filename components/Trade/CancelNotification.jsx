import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Text, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 알림 메시지 스타일 (중앙에 정렬, 특별한 디자인으로 표시)
const NotificationContainer = styled.View`
  width: 90%;
  align-self: center;
  background-color: #fff0f0;
  border-width: 1px;
  border-color: #ffdddd;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
`;

const NotificationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #ff6347;
  margin-right: 8px;
  justify-content: center;
  align-items: center;
`;

const NotificationTitle = styled.Text`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const NotificationContent = styled.Text`
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
  background-color: ${props => (props.primary ? '#ff6347' : '#f0f0f0')};
`;

const ButtonText = styled.Text`
  font-size: 13px;
  color: ${props => (props.primary ? 'white' : '#666')};
  font-weight: ${props => (props.primary ? 'bold' : 'normal')};
`;

const TimeStamp = styled.Text`
  font-size: 10px;
  color: #999;
  align-self: flex-end;
  margin-top: 5px;
`;

// 약속 취소 알림 컴포넌트
const CancelNotification = ({
  message,
  time,
  isSender,
  onCancelAppointment,
  onIgnore,
  itemId,
  chatId,
}) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // 로그 기록 함수
  const logDataWithTimestamp = (label, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${label}:`, data);
  };

  // 약속 취소 API 호출 함수
  const cancelAppointment = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setLoading(false);
        return false;
      }

      // itemId 값 확인
      if (!itemId) {
        console.error('상품 ID가 없습니다.');
        Alert.alert('오류', '상품 정보가 없습니다.');
        setLoading(false);
        return false;
      }

      // API 요청 데이터 구성
      const requestData = {
        sale_id: itemId,
      };

      // 요청 로깅
      console.log('======= 약속 취소 API 요청 데이터 =======');
      console.log('요청 URL: http://3.34.59.23/api/v1/transaction/cancel');
      console.log('요청 본문(JSON):', JSON.stringify(requestData, null, 2));
      console.log('==========================================');

      // API 호출
      const response = await axios.post(
        'http://3.34.59.23/api/v1/transaction/cancel',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 응답 로깅
      console.log('======= 약속 취소 API 응답 =======');
      console.log('응답 상태 코드:', response.status);
      console.log('응답 데이터:', response.data);
      console.log('=================================');

      // 응답 결과 처리
      const success = response.status === 200;

      if (success) {
        try {
          // 도착 상태 제거
          await AsyncStorage.removeItem(`arrival_${itemId}`);
          console.log(`상품 ID ${itemId}의 도착 상태가 제거되었습니다.`);

          // 콜백 호출
          if (onCancelAppointment) {
            console.log(`onCancelAppointment 콜백 호출: itemId=${itemId}`);
            onCancelAppointment(itemId);
          }

          Alert.alert('알림', '약속이 취소되었습니다.');
          console.log(response.data);
        } catch (error) {
          console.error('도착 상태 제거 오류:', error);
        }
      }

      setLoading(false);
      return success;
    } catch (error) {
      console.error('약속 취소 API 오류:', error.message);

      // 에러 응답 로깅
      if (error.response) {
        console.log('======= API 에러 응답 =======');
        console.log('에러 상태 코드:', error.response.status);
        console.log('에러 데이터:', error.response.data);
        console.log('============================');
      }

      Alert.alert('오류', '약속을 취소할 수 없습니다. 다시 시도해주세요.');
      setLoading(false);
      return false;
    }
  };

  // 약속 취소 버튼 핸들러
  const handleCancelAppointment = () => {
    Alert.alert('약속 취소', '정말로 이 거래 약속을 취소하시겠습니까?', [
      {text: '아니오', style: 'cancel'},
      {
        text: '네, 취소합니다',
        onPress: async () => {
          try {
            // API 호출
            console.log('약속 취소 API 호출 시작...');
            const success = await cancelAppointment();

            console.log('약속 취소 API 호출 결과:', success);

            // 결과 로그 기록
            logDataWithTimestamp('약속 취소 결과', {
              성공여부: success,
            });

            if (success) {
              // onCancelAppointment 콜백 호출은 cancelAppointment 내부에서 수행
            }
          } catch (error) {
            console.error('약속 취소 처리 오류:', error);
            Alert.alert('오류', '서버와 통신하는 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // 무시하기 버튼 핸들러
  const handleIgnore = () => {
    if (onIgnore) onIgnore();
  };

  return (
    <NotificationContainer>
      <NotificationHeader>
        <NotificationIcon>
          <Text style={{fontSize: 12, color: 'white'}}>⚠️</Text>
        </NotificationIcon>
        <NotificationTitle>약속 관리</NotificationTitle>
      </NotificationHeader>

      {message ? (
        <NotificationContent>{message}</NotificationContent>
      ) : (
        <NotificationContent>
          거래 장소에 도착했습니다. 약속을 취소하려면 아래 버튼을 눌러주세요.
        </NotificationContent>
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#ff6347" />
      ) : (
        <ButtonContainer>
          <ActionButton primary onPress={handleCancelAppointment}>
            <ButtonText primary>약속취소하기</ButtonText>
          </ActionButton>
          <ActionButton onPress={handleIgnore}>
            <ButtonText>무시하기</ButtonText>
          </ActionButton>
        </ButtonContainer>
      )}

      <TimeStamp>{time}</TimeStamp>
    </NotificationContainer>
  );
};

export default CancelNotification;
