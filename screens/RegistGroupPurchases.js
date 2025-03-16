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
  FlatList,
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

const ImagePreviewContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const ImagePreview = styled.View`
  width: 48%;
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
  const [originalPrice, setOriginalPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('5');
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState([]); // 이미지 파일들
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 카테고리 옵션
  const categories = ['육류', '채소', '과일', '주류', '기타'];

  // 여러 이미지 선택
  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      selectionLimit: 0, // 0은 제한 없음을 의미
    };

    console.log('===== 이미지 선택 시작 =====');
    console.log('이미지 피커 옵션:', options);

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('사용자가 이미지 선택을 취소했습니다.');
      } else if (response.error) {
        console.error('이미지 피커 에러:', response.error);
        Alert.alert('오류', '이미지를 불러오는데 문제가 발생했습니다.');
      } else {
        console.log('이미지 피커 응답:', JSON.stringify(response, null, 2));

        if (response.assets && response.assets.length > 0) {
          // 새 이미지를 기존 이미지 배열에 추가
          const newFiles = response.assets.map(asset => {
            // 이미지 메타데이터 로깅
            console.log('===== 선택한 이미지 메타데이터 =====');
            console.log('원본 asset 정보:', JSON.stringify(asset, null, 2));
            console.log(`파일 URI: ${asset.uri}`);
            console.log(`파일 타입: ${asset.type || '타입 없음'}`);
            console.log(`파일 이름: ${asset.fileName || '이름 없음'}`);
            console.log(
              `파일 크기: ${asset.fileSize || '크기 정보 없음'} 바이트`,
            );

            return {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || `image_${Date.now()}.jpg`,
            };
          });

          // 최대 5개 파일로 제한
          const updatedFiles = [...files, ...newFiles].slice(0, 5);
          console.log(
            `파일 ${files.length}개에서 ${updatedFiles.length}개로 업데이트`,
          );
          setFiles(updatedFiles);
        }
      }
    });
  };

  // 이미지 제거 함수
  const removeImage = index => {
    console.log(`파일 ${index + 1} 제거`);
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
      !originalPrice ||
      isNaN(Number(originalPrice)) ||
      Number(originalPrice) <= 0
    ) {
      Alert.alert('알림', '유효한 원가를 입력해주세요.');
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

      // FormData 생성
      const formData = new FormData();

      // 텍스트 데이터 추가
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('original_price', originalPrice);
      formData.append('max_participants', maxParticipants);
      formData.append('end_date', formattedEndDate);
      formData.append('created_at', formattedNow);
      formData.append('updated_at', formattedNow);
      formData.append('current_participants', 0);
      formData.append('status', 'open');
      formData.append('category', selectedCategory);

      // 파일 데이터 추가
      if (files.length > 0) {
        files.forEach((file, index) => {
          console.log(`FormData에 파일 추가 ${index + 1}:`, file);
          formData.append('files', file);
        });
      }

      // 요청 정보 로깅
      console.log('===== 요청 정보 =====');
      console.log('요청 URL:', 'http://3.34.59.23/api/v1/group-purchases/');
      console.log('요청 메소드:', 'POST');
      console.log('요청 헤더:', {
        Authorization:
          'Bearer ' + (token ? token.substring(0, 10) + '...' : 'null'),
        'Content-Type': 'multipart/form-data',
      });

      // 비파일 필드 로깅 - FormData는 직접 로깅이 어려워 데이터만 출력
      console.log('FormData에 추가된 텍스트 필드:');
      console.log('title:', title);
      console.log('description:', description);
      console.log('price:', price);
      console.log('original_price:', originalPrice);
      console.log('max_participants:', maxParticipants);
      console.log('end_date:', formattedEndDate);
      console.log('category:', selectedCategory);

      // 파일 정보 로깅
      console.log(`첨부 파일 수: ${files.length}`);
      files.forEach((file, index) => {
        console.log(
          `파일 ${index + 1} - 이름: ${file.name}, 타입: ${file.type}`,
        );
      });

      // API 요청
      const response = await axios.post(
        'http://3.34.59.23/api/v1/group-purchases/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // 응답 정보 로깅
      console.log('===== 응답 정보 =====');
      console.log('응답 상태:', response.status, response.statusText);
      console.log('응답 데이터:', JSON.stringify(response.data, null, 2));

      Alert.alert('성공', '공동구매가 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('===== 오류 정보 =====');
      console.error('오류 타입:', error.name);
      console.error('오류 메시지:', error.message);

      let errorMessage = '공동구매 등록 중 오류가 발생했습니다.';

      if (error.response) {
        // 서버 응답이 있는 경우
        console.error('오류 상태:', error.response.status);
        console.error(
          '오류 데이터:',
          JSON.stringify(error.response.data, null, 2),
        );

        if (error.response.data && error.response.data.detail) {
          errorMessage = `오류: ${error.response.data.detail}`;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우
        console.error('요청만 전송됨:', error.request);
        errorMessage =
          '서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.';
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
            <Label>원가</Label>
            <Input
              placeholder="공구로 아낄 수 있는 금액을 제공하기 위해 원가를 입력해 주세요 (원)"
              keyboardType="numeric"
              value={originalPrice}
              onChangeText={setOriginalPrice}
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
            <Label>이미지 ({files.length}/5)</Label>
            {files.length < 5 && (
              <ImagePickerButton onPress={handleImagePick}>
                <Icon name="add-photo-alternate" size={40} color="#999" />
                <Text style={{marginTop: 8, color: '#999'}}>이미지 추가</Text>
              </ImagePickerButton>
            )}

            {files.length > 0 && (
              <ImagePreviewContainer>
                {files.map((file, index) => (
                  <ImagePreview key={index}>
                    <Image
                      source={{uri: file.uri}}
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
                      onPress={() => removeImage(index)}>
                      <Icon name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </ImagePreview>
                ))}
              </ImagePreviewContainer>
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
