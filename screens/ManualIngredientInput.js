import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const FormContainer = styled.View`
  background-color: white;
  margin: 15px;
  border-radius: 10px;
  padding: 15px;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const FormTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
`;

const InputGroup = styled.View`
  margin-bottom: 15px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const StyledInput = styled.TextInput`
  height: 45px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 0 10px;
  background-color: #fff;
  font-size: 16px;
`;

const DatePickerButton = styled.TouchableOpacity`
  height: 45px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 0 10px;
  background-color: #fff;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DateText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 12px 15px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 5px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
`;

const AddedIngredientsContainer = styled.View`
  background-color: white;
  margin: 0 15px 15px;
  border-radius: 10px;
  padding: 15px;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const IngredientItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const IngredientInfo = styled.View`
  flex: 1;
`;

const IngredientName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const IngredientDetails = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 8px;
`;

const SubmitButtonContainer = styled.View`
  padding: 15px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #d9534f;
  border-radius: 8px;
  padding: 15px;
  align-items: center;
  justify-content: center;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

// 카테고리 옵션
const categories = ['육류', '채소', '과일', '주류', '기타'];

const CategorySelector = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const CategoryOption = styled.TouchableOpacity`
  padding: 8px 12px;
  margin: 5px;
  border-radius: 20px;
  background-color: ${props => (props.selected ? '#D9534F' : '#f0f0f0')};
`;

const CategoryText = styled.Text`
  font-size: 14px;
  color: ${props => (props.selected ? 'white' : '#666')};
`;

const ManualIngredientInput = () => {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 날짜 포맷팅 함수
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // API 형식에 맞게 날짜 포맷팅 (ISO 8601, Z 제외)
  const formatDateForAPI = date => {
    const iso = date.toISOString();
    return iso.substring(0, iso.length - 1); // 맨 끝의 'Z' 제거
  };

  // 날짜 변경 핸들러
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  // 재료 추가 핸들러
  const handleAddIngredient = () => {
    if (!name) {
      Alert.alert('알림', '재료명을 입력해주세요.');
      return;
    }
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }
    if (!amount || isNaN(parseInt(amount))) {
      Alert.alert('알림', '수량을 올바르게 입력해주세요.');
      return;
    }

    const newIngredient = {
      name,
      category,
      amount: parseInt(amount),
      expiry_date: formatDateForAPI(expiryDate),
    };

    setIngredients([...ingredients, newIngredient]);
    // 입력 필드 초기화
    setName('');
    setCategory('');
    setAmount('');
    setExpiryDate(new Date());
  };

  // 재료 삭제 핸들러
  const handleDeleteIngredient = index => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  // 재료 제출 핸들러
  const handleSubmit = async () => {
    if (ingredients.length === 0) {
      Alert.alert('알림', '최소 한 개 이상의 재료를 추가해주세요.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(
        'http://3.34.59.23/api/v1/ingredients/ingredients/multiple',
        ingredients,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      Alert.alert('성공', '재료가 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('재료 등록 오류:', error);
      Alert.alert('오류', '재료 등록 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (ingredients.length > 0) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          {text: '계속 작성하기', style: 'cancel'},
          {text: '취소하기', onPress: () => navigation.goBack()},
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <Header>
          <TouchableOpacity onPress={handleCancel}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <HeaderTitle>식재료 직접 입력</HeaderTitle>
          <View style={{width: 24}} />
        </Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          <FormContainer>
            <FormTitle>새 식재료 입력</FormTitle>

            <InputGroup>
              <InputLabel>재료명</InputLabel>
              <StyledInput
                placeholder="재료명을 입력하세요"
                value={name}
                onChangeText={setName}
              />
            </InputGroup>

            <InputGroup>
              <InputLabel>카테고리</InputLabel>
              <CategorySelector>
                {categories.map(item => (
                  <CategoryOption
                    key={item}
                    selected={category === item}
                    onPress={() => setCategory(item)}>
                    <CategoryText selected={category === item}>
                      {item}
                    </CategoryText>
                  </CategoryOption>
                ))}
              </CategorySelector>
            </InputGroup>

            <InputGroup>
              <InputLabel>수량</InputLabel>
              <StyledInput
                placeholder="수량을 입력하세요 (예: 1, 2, 3...)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </InputGroup>

            <InputGroup>
              <InputLabel>유통기한</InputLabel>
              <DatePickerButton onPress={() => setShowDatePicker(true)}>
                <DateText>{formatDate(expiryDate)}</DateText>
                <Icon name="calendar-outline" size={20} color="#666" />
              </DatePickerButton>
              {showDatePicker && (
                <DateTimePicker
                  value={expiryDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </InputGroup>

            <ButtonContainer>
              <ActionButton
                style={{backgroundColor: '#f0f0f0'}}
                onPress={() => {
                  setName('');
                  setCategory('');
                  setAmount('');
                  setExpiryDate(new Date());
                }}>
                <Icon name="refresh" size={18} color="#666" />
                <ButtonText style={{color: '#666'}}>초기화</ButtonText>
              </ActionButton>

              <ActionButton
                style={{backgroundColor: '#D9534F'}}
                onPress={handleAddIngredient}>
                <Icon name="add-circle" size={18} color="white" />
                <ButtonText style={{color: 'white'}}>추가하기</ButtonText>
              </ActionButton>
            </ButtonContainer>
          </FormContainer>

          {ingredients.length > 0 && (
            <AddedIngredientsContainer>
              <FormTitle>추가된 식재료 ({ingredients.length})</FormTitle>

              {ingredients.map((ingredient, index) => (
                <IngredientItem key={index}>
                  <IngredientInfo>
                    <IngredientName>{ingredient.name}</IngredientName>
                    <IngredientDetails>
                      {ingredient.category} • {ingredient.amount}개 • 유통기한:{' '}
                      {formatDate(new Date(ingredient.expiry_date))}
                    </IngredientDetails>
                  </IngredientInfo>
                  <DeleteButton onPress={() => handleDeleteIngredient(index)}>
                    <Icon2 name="delete" size={20} color="#D9534F" />
                  </DeleteButton>
                </IngredientItem>
              ))}
            </AddedIngredientsContainer>
          )}
        </ScrollView>

        <SubmitButtonContainer>
          <SubmitButton onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <SubmitButtonText>저장하기</SubmitButtonText>
            )}
          </SubmitButton>
        </SubmitButtonContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default ManualIngredientInput;
