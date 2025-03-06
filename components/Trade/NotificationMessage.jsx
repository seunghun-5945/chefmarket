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
  itemId, // itemId 파라미터 추가
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

  // 현재 위치 가져오기 함수 개선
  const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
      setLocationLoading(true);
      try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
          Alert.alert(
            '알림',
            '현재 위치를 가져오기 위해 위치 권한이 필요합니다.',
          );
          setLocationLoading(false);
          reject('위치 권한이 없습니다.');
          return;
        }

        Geolocation.getCurrentPosition(
          position => {
            const {longitude, latitude} = position.coords;

            // 완전한 위치 정보인지 확인
            if (longitude === undefined || latitude === undefined) {
              console.error('위치 정보가 불완전합니다:', {longitude, latitude});
              setLocationLoading(false);
              reject('위치 정보가 불완전합니다.');
              return;
            }

            // 위치 데이터 배열 생성
            const locationData = [longitude, latitude];

            // 위치 데이터 검증 로그
            console.log('위치 데이터 획득 성공:', {
              경도: longitude,
              위도: latitude,
              배열: locationData,
            });

            // 상태 업데이트 및 Promise 해결
            setLocation(locationData);
            setLocationLoading(false);
            resolve(locationData);
          },
          error => {
            console.error('위치 가져오기 에러:', error);
            Alert.alert('오류', 'GPS 위치를 가져오는데 실패했습니다.');
            setLocationLoading(false);
            reject(error);
          },
          {
            enableHighAccuracy: true, // 높은 정확도 사용
            timeout: 20000, // 타임아웃 시간 증가
            maximumAge: 1000, // 캐시된 위치 사용 기간 줄임
            distanceFilter: 0, // 모든 위치 변화 감지
          },
        );
      } catch (error) {
        console.error('위치 권한 요청 중 오류:', error);
        Alert.alert('오류', '위치 정보를 가져오는데 실패했습니다.');
        setLocationLoading(false);
        reject(error);
      }
    });
  };

  // notifyArrival 함수 수정 - 위도와 경도 모두 포함
  const notifyArrival = async locationData => {
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

      // 위치 데이터 확인
      if (
        !locationData ||
        locationData.length < 2 ||
        locationData[0] === null ||
        locationData[1] === null
      ) {
        console.error('위치 데이터가 부족합니다:', locationData);
        Alert.alert('오류', '위치 정보를 완전히 가져오지 못했습니다.');
        setLoading(false);
        return false;
      }

      // 위치 데이터 로깅
      console.log('위치 데이터 확인:', {
        경도: locationData[0],
        위도: locationData[1],
      });

      // API 요청 데이터 구성 - 경도와 위도 모두 포함
      const requestData = {
        sale_id: itemId,
        id: userId,
        location: locationData, // 경도와 위도 모두 포함
      };

      // 요청 로깅
      console.log('======= 도착 알림 API 요청 데이터 =======');
      console.log('요청 URL: http://3.34.59.23/api/v1/transaction/arrive');
      console.log('요청 본문(JSON):', JSON.stringify(requestData, null, 2));
      console.log('==========================================');

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

      // 응답 로깅
      console.log('======= 도착 알림 API 응답 =======');
      console.log('응답 상태 코드:', response.status);
      console.log('응답 데이터:', response.data);
      console.log('=================================');

      // 응답 결과 처리
      const success = response.data === true || response.data === 'true';

      if (success) {
        try {
          await AsyncStorage.setItem(`arrival_${itemId}`, 'true');
          console.log(`상품 ID ${itemId}의 도착 상태가 저장되었습니다.`);

          if (onNotifyArrival) {
            console.log(`onNotifyArrival 콜백 호출: itemId=${itemId}`);
            onNotifyArrival(itemId);
          }
        } catch (error) {
          console.error('도착 상태 저장 오류:', error);
        }
      }

      setLoading(false);
      return success;
    } catch (error) {
      console.error('도착 알림 API 오류:', error.message);

      // 에러 응답 로깅
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

  // handleNotifyArrival 함수를 다음과 같이 수정합니다:
  const handleNotifyArrival = () => {
    Alert.alert('도착 알림', '도착 알림을 보내시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '알림 보내기',
        onPress: async () => {
          try {
            // 로딩 상태 표시
            setLocationLoading(true);

            // 위치 정보 가져오기
            console.log('위치 정보 요청 시작...');
            const locationData = await getCurrentLocation();

            // 위치 데이터 유효성 검증
            if (
              !locationData ||
              locationData.length < 2 ||
              locationData[0] === null ||
              locationData[1] === null
            ) {
              console.error('위치 데이터 유효성 검증 실패:', locationData);
              Alert.alert(
                '오류',
                '정확한 위치를 가져오지 못했습니다. 다시 시도해주세요.',
              );
              setLocationLoading(false);
              return;
            }

            console.log('위치 정보 획득 완료:', locationData);

            // 위치 정보 로그 기록
            logDataWithTimestamp('도착 알림 확인됨', {
              itemId,
              userId,
              location: locationData,
            });

            // API 호출
            console.log('도착 알림 API 호출 시작...');
            const success = await notifyArrival(locationData);

            console.log('도착 알림 API 호출 결과:', success);

            // 결과 로그 기록
            logDataWithTimestamp('도착 알림 결과', {
              성공여부: success,
            });

            if (success) {
              // 도착 알림 성공 후 즉시 onNotifyArrival 콜백 호출
              if (onNotifyArrival) {
                console.log('콜백 함수 호출 - 취소 알림 메시지 표시 요청');
                onNotifyArrival(itemId);
              }
            }
          } catch (error) {
            console.error('도착 알림 처리 오류:', error);
            Alert.alert(
              '오류',
              '위치 정보를 가져오거나 서버와 통신하는 중 문제가 발생했습니다.',
            );
          } finally {
            // 로딩 상태 해제
            setLocationLoading(false);
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
