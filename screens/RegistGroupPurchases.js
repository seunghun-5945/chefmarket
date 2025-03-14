import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const FormGroup = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
`;

const TextArea = styled.TextInput`
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  height: 100px;
  text-align-vertical: top;
`;

const RowContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DatePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 10px;
`;

const DatePickerText = styled.Text`
  font-size: 16px;
  margin-left: 10px;
`;

const CategoryContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const CategoryButton = styled.TouchableOpacity`
  padding: 8px 15px;
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 20px;
  background-color: ${props => (props.selected ? '#ff6b6b' : '#f0f0f0')};
`;

const CategoryText = styled.Text`
  font-size: 14px;
  color: ${props => (props.selected ? 'white' : 'black')};
`;

const ImagePickerButton = styled.TouchableOpacity`
  height: 120px;
  border-width: 1px;
  border-style: dashed;
  border-color: #ddd;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const ImagePreview = styled.View`
  height: 120px;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #ff6b6b;
  padding: 15px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const RegistGroupPurchases = ({navigation}) => {
  // 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('5');
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ); // 기본값 1주일 후
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 카테고리 옵션
  const categories = ['육류', '채소', '과일', '주류', '기타'];

  // 이미지 선택
  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('오류', '이미지를 불러오는데 문제가 발생했습니다.');
      } else {
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      }
    });
  };

  // 날짜 선택 핸들러
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // 폼 제출 함수 수정
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('알림', '설명을 입력해주세요.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('알림', '유효한 가격을 입력해주세요.');
      return;
    }
    if (
      !maxParticipants ||
      isNaN(Number(maxParticipants)) ||
      Number(maxParticipants) <= 0
    ) {
      Alert.alert('알림', '유효한 최대 참여자 수를 입력해주세요.');
      return;
    }

    // 카테고리 선택 확인
    if (!selectedCategory) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // 현재 시간 (Z 제외)
      const now = new Date();
      const formattedNow = now.toISOString().slice(0, -1);

      // 마감 날짜 포맷팅 (Z 제외)
      const formattedEndDate = endDate.toISOString().slice(0, -1);

      // JSON 데이터 생성
      const jsonData = {
        title: title,
        description: description,
        price: Number(price),
        max_participants: Number(maxParticipants),
        end_date: formattedEndDate,
        created_at: formattedNow,
        updated_at: formattedNow,
        current_participants: 0,
        status: 'open',
        category: selectedCategory, // 카테고리 추가
      };

      console.log('요청 데이터:', jsonData);

      // API 요청 (JSON 형식)
      const response = await axios.post(
        'http://3.34.59.23/api/v1/group-purchases/',
        jsonData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('공동구매 등록 성공:', response.data);

      // 이미지가 있는 경우 별도 요청으로 업로드
      if (imageUri) {
        try {
          const imageFormData = new FormData();
          const uriParts = imageUri.split('/');
          const fileName = uriParts[uriParts.length - 1];

          imageFormData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
          });

          // 생성된 공동구매 ID를 사용하여 이미지 업로드
          const imageResponse = await axios.post(
            `http://3.34.59.23/api/v1/group-purchases/${response.data.id}/image`,
            imageFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          console.log('이미지 업로드 성공:', imageResponse.data);
        } catch (imageError) {
          console.error('이미지 업로드 실패:', imageError);
          // 이미지 업로드가 실패해도 공동구매 등록은 성공했으므로 사용자에게 알림
          Alert.alert(
            '알림',
            '공동구매는 등록되었지만 이미지 업로드에 실패했습니다.',
          );
          navigation.goBack();
          return;
        }
      }

      Alert.alert('성공', '공동구매가 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('공동구매 등록 실패:', error);
      let errorMessage = '공동구매 등록 중 오류가 발생했습니다.';

      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);

        if (error.response.data && error.response.data.detail) {
          errorMessage = `오류: ${error.response.data.detail}`;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollContainer>
          <Title>공동구매 등록</Title>

          <FormGroup>
            <Label>제목</Label>
            <Input
              placeholder="공동구매 제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
            />
          </FormGroup>

          <FormGroup>
            <Label>설명</Label>
            <TextArea
              placeholder="공동구매에 대한 상세 설명을 입력하세요"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </FormGroup>

          <FormGroup>
            <Label>가격</Label>
            <Input
              placeholder="가격을 입력하세요 (원)"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </FormGroup>

          <FormGroup>
            <Label>최대 참여자 수</Label>
            <Input
              placeholder="최대 참여자 수를 입력하세요"
              keyboardType="numeric"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
            />
          </FormGroup>

          <FormGroup>
            <Label>마감 날짜</Label>
            <DatePickerButton onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar-today" size={20} color="#666" />
              <DatePickerText>
                {endDate.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </DatePickerText>
            </DatePickerButton>
            {showDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </FormGroup>

          <FormGroup>
            <Label>카테고리</Label>
            <CategoryContainer>
              {categories.map(category => (
                <CategoryButton
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}>
                  <CategoryText selected={selectedCategory === category}>
                    {category}
                  </CategoryText>
                </CategoryButton>
              ))}
            </CategoryContainer>
          </FormGroup>

          <FormGroup>
            <Label>이미지</Label>
            {imageUri ? (
              <ImagePreview>
                <Image
                  source={{uri: imageUri}}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setImageUri(null)}>
                  <Icon name="close" size={20} color="white" />
                </TouchableOpacity>
              </ImagePreview>
            ) : (
              <ImagePickerButton onPress={handleImagePick}>
                <Icon name="add-photo-alternate" size={40} color="#999" />
                <Text style={{marginTop: 8, color: '#999'}}>이미지 추가</Text>
              </ImagePickerButton>
            )}
          </FormGroup>

          <SubmitButton onPress={handleSubmit}>
            <SubmitButtonText>등록하기</SubmitButtonText>
          </SubmitButton>
        </ScrollContainer>
      </KeyboardAvoidingView>

      {loading && (
        <LoadingOverlay>
          <ActivityIndicator size="large" color="white" />
          <Text style={{color: 'white', marginTop: 10}}>등록 중...</Text>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default RegistGroupPurchases;
