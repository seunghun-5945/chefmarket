import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';

// 스타일 컴포넌트 정의
const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  margin-bottom: 5px;
  align-self: flex-start;
  margin-left: 10px;
`;

const DateDisplayContainer = styled.TouchableOpacity`
  width: 90%;
  height: 40px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 0 10px;
  justify-content: center;
`;

const DateDisplayText = styled.Text`
  font-size: 14px;
  color: ${props => (props.placeholder ? '#999' : '#000')};
`;

const LocationInput = styled.TextInput`
  width: 90%;
  height: 40px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
  padding: 0 10px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
`;

const ModalButton = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
`;

const CancelButton = styled(ModalButton)`
  background-color: #f0f0f0;
`;

const ConfirmButton = styled(ModalButton)`
  background-color: lightsalmon;
`;

const ButtonText = styled.Text`
  font-size: 14px;
  color: ${props => (props.isConfirm ? 'white' : 'black')};
  font-weight: ${props => (props.isConfirm ? 'bold' : 'normal')};
`;

// 거래약속 모달 컴포넌트
const TransactionModal = ({visible, onClose, onConfirm, itemTitle}) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');

  // 날짜 형식 변환 함수 (2023년 12월 25일 오후 3:30)
  const formatDate = date => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${year}년 ${month}월 ${day}일 ${ampm} ${formattedHours}:${
      minutes < 10 ? '0' + minutes : minutes
    }`;
  };

  // 날짜 선택 핸들러
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    if (!location.trim()) {
      Alert.alert('알림', '만남 장소를 입력해주세요.');
      return;
    }

    onConfirm({
      date: date,
      location: location,
      formattedDate: formatDate(date),
    });

    // 입력값 초기화
    setDate(new Date());
    setLocation('');
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    // 입력값 초기화
    setDate(new Date());
    setLocation('');
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}>
      <ModalContainer>
        <ModalContent>
          <ModalTitle>거래 약속 잡기</ModalTitle>

          <InputLabel>상품명</InputLabel>
          <DateDisplayContainer style={{backgroundColor: '#f5f5f5'}}>
            <DateDisplayText>{itemTitle || '상품명 없음'}</DateDisplayText>
          </DateDisplayContainer>

          <InputLabel>약속 날짜 및 시간</InputLabel>
          <DateDisplayContainer onPress={() => setShowDatePicker(true)}>
            <DateDisplayText>{formatDate(date)}</DateDisplayText>
          </DateDisplayContainer>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              locale="ko-KR"
            />
          )}

          <InputLabel>만남 장소</InputLabel>
          <LocationInput
            placeholder="만남 장소를 입력해주세요"
            value={location}
            onChangeText={setLocation}
          />

          <ButtonContainer>
            <CancelButton onPress={handleCancel}>
              <ButtonText>취소</ButtonText>
            </CancelButton>
            <ConfirmButton onPress={handleConfirm}>
              <ButtonText isConfirm>확인</ButtonText>
            </ConfirmButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default TransactionModal;
