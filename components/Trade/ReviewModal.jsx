import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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

const RatingContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: 15px;
`;

const RatingText = styled.Text`
  font-size: 14px;
  margin-top: 5px;
  color: #666;
`;

const ReviewInput = styled.TextInput`
  width: 100%;
  height: 120px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
  text-align-vertical: top;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ButtonBase = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
`;

const CancelButton = styled(ButtonBase)`
  background-color: #f0f0f0;
`;

const ConfirmButton = styled(ButtonBase)`
  background-color: lightsalmon;
`;

const ButtonText = styled.Text`
  font-size: 14px;
  color: ${props => (props.isConfirm ? 'white' : 'black')};
  font-weight: ${props => (props.isConfirm ? 'bold' : 'normal')};
`;

// 리뷰 모달 컴포넌트
const ReviewModal = ({visible, onClose, onSubmit}) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return '매우 불만족';
      case 2:
        return '불만족';
      case 3:
        return '보통';
      case 4:
        return '만족';
      case 5:
        return '매우 만족';
      default:
        return '';
    }
  };

  const handleSubmit = () => {
    if (review.trim().length < 5) {
      Alert.alert('알림', '후기를 5자 이상 작성해주세요.');
      return;
    }

    onSubmit({rating, review});

    // 상태 초기화
    setRating(5);
    setReview('');
  };

  const handleCancel = () => {
    // 상태 초기화
    setRating(5);
    setReview('');
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
          <ModalTitle>거래 후기 작성</ModalTitle>

          <RatingContainer>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={30}
                  color={star <= rating ? 'gold' : '#ccc'}
                />
              </TouchableOpacity>
            ))}
          </RatingContainer>

          <RatingText>{getRatingText()}</RatingText>

          <ReviewInput
            placeholder="거래 경험은 어떠셨나요? 상대방과의 거래에 대한 솔직한 후기를 남겨주세요."
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
            maxLength={200}
          />

          <ButtonContainer>
            <CancelButton onPress={handleCancel}>
              <ButtonText>취소</ButtonText>
            </CancelButton>
            <ConfirmButton onPress={handleSubmit}>
              <ButtonText isConfirm>제출</ButtonText>
            </ConfirmButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ReviewModal;
