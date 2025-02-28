import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {Modal, Platform, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Text} from 'react-native-gesture-handler';

const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ResultScrollContainer = styled.ScrollView`
  width: 100%;
  max-height: 80%;
  background-color: white;
  border-radius: 8px;
`;

const ResultContentContainer = styled.View`
  width: 100%;
  padding: 16px;
  padding-bottom: ${Platform.OS === 'ios' ? '16px' : '16px'};
`;

const ResultContainer = styled.View`
  width: 100%;
  max-width: 500px;
  background-color: white;
`;

const ResultTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const ItemContainer = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
  padding: 12px 0;
  position: relative;
  background-color: ${props => (props.selected ? '#f0f0f0' : 'white')};
`;

const ItemInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const ItemRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ItemName = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const ItemDetail = styled.Text`
  font-size: 14px;
  color: #666;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const CloseText = styled.Text`
  font-size: 16px;
  color: #666;
`;

const SelectButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 12px 24px;
  border-radius: 8px;
  margin-top: 16px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

const SelectButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const IngredientBrowseModal = ({visible, onClose, onSelect}) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchIngredients();
    }
  }, [visible]);

  const fetchIngredients = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert('알림', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://3.34.59.23/api/v1/receipts/ingredients/my',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIngredients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('재료 불러오기 실패:', error);
      setLoading(false);

      if (error.response?.status === 401) {
        Alert.alert('오류', '인증에 실패했습니다. 다시 로그인해주세요.');
      } else {
        Alert.alert('오류', '재료를 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSelect = () => {
    if (selectedIngredient) {
      onSelect(selectedIngredient);
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <ModalBackground>
        <ResultScrollContainer showsVerticalScrollIndicator={false}>
          <ResultContentContainer>
            <HeaderContainer>
              <ResultTitle>등록된 식재료</ResultTitle>
              <CloseButton onPress={onClose}>
                <CloseText>닫기</CloseText>
              </CloseButton>
            </HeaderContainer>

            <ResultContainer>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{marginTop: 20}}
                />
              ) : ingredients.length === 0 ? (
                <ItemDetail style={{textAlign: 'center', marginTop: 20}}>
                  보유한 식재료가 없습니다.
                </ItemDetail>
              ) : (
                ingredients.map(ingredient => (
                  <ItemContainer
                    key={ingredient.id}
                    onPress={() => setSelectedIngredient(ingredient)}
                    selected={selectedIngredient?.id === ingredient.id}>
                    <ItemInfo>
                      <ItemRow>
                        <ItemName>{ingredient.name}</ItemName>
                        <ItemDetail>{ingredient.amount}개</ItemDetail>
                      </ItemRow>
                      <ItemRow>
                        <ItemDetail>카테고리: {ingredient.category}</ItemDetail>
                        <ItemDetail>
                          유통기한:{' '}
                          {new Date(ingredient.expiry_date).toLocaleDateString(
                            'ko-KR',
                          )}
                        </ItemDetail>
                      </ItemRow>
                    </ItemInfo>
                  </ItemContainer>
                ))
              )}
            </ResultContainer>

            <SelectButton onPress={handleSelect} disabled={!selectedIngredient}>
              <SelectButtonText>선택하기</SelectButtonText>
            </SelectButton>
          </ResultContentContainer>
        </ResultScrollContainer>
      </ModalBackground>
    </Modal>
  );
};

export default IngredientBrowseModal;
