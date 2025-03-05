import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

// 알림 메시지 스타일 (중앙에 정렬, 특별한 디자인으로 표시)
const NotificationContainer = styled.View`
  width: 90%;
  align-self: center;
  background-color: #f5f5ff;
  border-width: 1px;
  border-color: #ddd;
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
  background-color: #4a90e2;
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
  background-color: ${props => (props.primary ? '#4a90e2' : '#f0f0f0')};
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

// 알림 메시지 컴포넌트
const NotificationMessage = ({
  message,
  time,
  isSender,
  onNotifyArrival,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState([null, null]); // [경도, 위도]

  // 메시지 타입 확인 (어떤 종류의 알림인지)
  const isArrivalNotification = message
    ? message.includes('[도착알림]')
    : false;
  const isGeneralNotification = message ? message.includes('[알림]') : false;
  const showArrivalButton = isGeneralNotification; // 일반 알림 메시지면 도착 알리기 버튼 표시

  // 거래 ID를 3으로 고정
  const transactionId = 3;

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          console.error('토큰이 없습니다.');
          return;
        }

        // 사용자 정보 API 호출
        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // 응답에서 사용자 ID 가져오기
        if (response.data && response.data.id) {
          setUserId(response.data.id);
          console.log('사용자 ID 가져옴:', response.data.id);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 로그 기록 함수
  const logDataWithTimestamp = (label, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${label}:`, data);
  };

  // 위치 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 필요',
            message: '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      try {
        const status = await Geolocation.requestAuthorization('whenInUse');
        return status === 'granted';
      } catch (err) {
        console.error('위치 권한 요청 에러:', err);
        return false;
      }
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          '알림',
          '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
        );
        setLocationLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const {longitude, latitude} = position.coords;
          setLocation([longitude, latitude]);
          console.log('현재 위치:', longitude, latitude);
          setLocationLoading(false);
        },
        error => {
          console.error('위치 가져오기 에러:', error);
          Alert.alert('오류', 'GPS 위치를 가져오는데 실패했습니다.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10,
        },
      );
    } catch (error) {
      console.error('위치 권한 요청 중 오류:', error);
      Alert.alert('오류', '위치 정보를 가져오는데 실패했습니다.');
      setLocationLoading(false);
    }
  };

  // 도착 알림 API 요청 함수
  const notifyArrival = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('오류', '로그인이 필요합니다.');
        setLoading(false);
        return false;
      }

      // API 요청 데이터 구성
      const requestData = {
        trans_id: transactionId,
        id: userId,
        location: location, // [경도, 위도] 형식
      };

      // 사용자 정보 가져오기
      let userRole = '알 수 없음';
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo);
          userRole = parsedInfo.isBuyer ? '구매자' : '판매자';
        }
      } catch (e) {
        console.error('사용자 역할 확인 오류:', e);
      }

      // 핵심 정보만 콘솔에 출력
      console.log('======= 도착 알림 API 정보 =======');
      console.log(`보낸 사람 ID: ${userId}`);
      console.log(`거래 ID: ${transactionId}`);
      console.log(`위치 정보: [${location[0]}, ${location[1]}]`);
      console.log(`사용자 역할: ${userRole}`);
      console.log('================================');

      // API 호출
      const response = await axios.post(
        'http://3.34.59.23/api/v1/transaction/arrive',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 여기에 응답 데이터 로깅 추가
      console.log('======= 도착 알림 API 응답 =======');
      console.log('응답 상태 코드:', response.status);
      console.log('응답 데이터:', response.data);
      console.log('=================================');

      // 응답 결과 저장
      const success = response.data === true || response.data === 'true';

      // 도착 알림 상태를 AsyncStorage에 저장 (Chat 컴포넌트에서 사용)
      if (success) {
        try {
          await AsyncStorage.setItem(`arrival_${transactionId}`, 'true');
          console.log(`거래 ID ${transactionId}의 도착 상태가 저장되었습니다.`);

          // 추가: 성공 시 거래 상태 체크 트리거
          if (onNotifyArrival) {
            onNotifyArrival(transactionId); // 거래 ID 전달
          }

          Alert.alert('성공', '도착 알림이 성공적으로 전송되었습니다.');
        } catch (error) {
          console.error('도착 상태 저장 오류:', error);
        }
      }

      setLoading(false);
      return success;
    } catch (error) {
      console.error('도착 알림 API 오류:', error.message);

      // 에러 응답이 있는 경우 해당 데이터도 출력
      if (error.response) {
        console.log('======= API 에러 응답 =======');
        console.log('에러 상태 코드:', error.response.status);
        console.log('에러 데이터:', error.response.data);
        console.log('============================');
      }

      Alert.alert('오류', '도착 알림을 보낼 수 없습니다. 다시 시도해주세요.');
      setLoading(false);
      return false;
    }
  };

  // 알림 도착 버튼 핸들러
  const handleNotifyArrival = () => {
    Alert.alert('도착 알림', '도착 알림을 보내시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '알림 보내기',
        onPress: async () => {
          // 현재 위치 정보 가져오기
          await getCurrentLocation();

          logDataWithTimestamp('도착 알림 확인됨', {
            transactionId,
            userId,
            location,
          });

          // 백엔드 API 호출
          const success = await notifyArrival();

          logDataWithTimestamp('도착 알림 결과', {
            성공여부: success,
          });

          if (success) {
            // onNotifyArrival 콜백 호출 (메시지 전송 등을 위해)
            if (onNotifyArrival) onNotifyArrival();
            Alert.alert('성공', '도착 알림이 성공적으로 전송되었습니다.');
          }
        },
      },
    ]);
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    Alert.alert('알림 취소', '이 알림을 취소하시겠습니까?', [
      {text: '아니오', style: 'cancel'},
      {
        text: '네, 취소합니다',
        onPress: () => {
          if (onCancel) onCancel();
        },
      },
    ]);
  };

  return (
    <NotificationContainer>
      <NotificationHeader>
        <NotificationIcon>
          <Text style={{fontSize: 12, color: 'white'}}>🔔</Text>
        </NotificationIcon>
        <NotificationTitle>
          {isArrivalNotification ? '도착 알림' : '알림 메시지'}
        </NotificationTitle>
      </NotificationHeader>

      {message ? (
        <NotificationContent>{message}</NotificationContent>
      ) : (
        <NotificationContent>메시지 내용이 없습니다.</NotificationContent>
      )}

      {loading || locationLoading ? (
        <ActivityIndicator size="small" color="#4a90e2" />
      ) : (
        <ButtonContainer>
          {/* 일반 알림 메시지일 때는 도착 알리기 버튼 표시 */}
          {showArrivalButton && (
            <ActionButton primary onPress={handleNotifyArrival}>
              <ButtonText primary>도착 알리기</ButtonText>
            </ActionButton>
          )}

          {/* 도착 알림인 경우에만 취소 버튼 표시 */}
          {isArrivalNotification && (
            <ActionButton onPress={handleCancel}>
              <ButtonText>취소하기</ButtonText>
            </ActionButton>
          )}
        </ButtonContainer>
      )}

      <TimeStamp>{time}</TimeStamp>
    </NotificationContainer>
  );
};

export default NotificationMessage;
