// TakePhoto.js
import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Alert} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RenderImageScreen from '../components/\bUploadIngredient/RenderImageScreen';
import RenderInitialScreen from '../components/\bUploadIngredient/RenderInitialScreen';
import RenderResultScreen from '../components/\bUploadIngredient/RenderResultScreen';

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const TakePhoto = () => {
  const [imageUri, setImageUri] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [itemDetails, setItemDetails] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const categories = ['육류', '채소', '과일', '주류', '음료', '양념', '기타'];

  const formatDateTime = (year, month, day, hour, minute) => {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0',
    )}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00.000Z`;
  };

  const handleImagePick = async type => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    try {
      const launch = type === 'camera' ? launchCamera : launchImageLibrary;
      const response = await new Promise(resolve => {
        launch(options, resolve);
      });

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log(`${type} Error: `, response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri);
        setImageInfo(response.assets[0]);
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('에러', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const uploadImage = async () => {
    if (!imageInfo) {
      Alert.alert('에러', '이미지를 선택해주세요');
      return;
    }

    try {
      setIsLoading(true); // 로티 로딩
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('에러', '로그인이 필요합니다');
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageInfo.uri,
        type: imageInfo.type || 'image/jpeg',
        name: imageInfo.fileName || 'receipt.jpg',
      });

      const API_URL = 'http://3.34.59.23/api/v1/receipts/upload';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        Alert.alert('에러', '서버 응답을 처리할 수 없습니다');
        setIsLoading(false);
        return;
      }

      setResponseData(data);

      if (response.ok) {
        Alert.alert('성공', '영수증이 성공적으로 업로드되었습니다.');
      } else {
        Alert.alert('실패', `업로드 실패: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      Alert.alert('에러', `서버 통신 오류: ${e.message}`);
      console.error('Upload error:', e);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const resetImage = () => {
    setImageUri(null);
    setImageInfo(null);
  };

  const handleComplete = () => {
    setImageUri(null);
    setImageInfo(null);
    setResponseData(null);
    setSelectedItems({});
    setItemDetails({});
  };

  return (
    <Container>
      {!imageUri && !responseData?.items && (
        <RenderInitialScreen handleImagePick={handleImagePick} />
      )}
      {imageUri && !responseData?.items && (
        <RenderImageScreen
          imageUri={imageUri}
          uploadImage={uploadImage}
          resetImage={resetImage}
          isProcessing={isLoading} // 로딩 상태 전달
        />
      )}
      {responseData?.items && (
        <RenderResultScreen
          responseData={responseData}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          itemDetails={itemDetails}
          setItemDetails={setItemDetails}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          categories={categories}
          formatDateTime={formatDateTime}
          onComplete={handleComplete}
          isLoading={isLoading} // 로딩 상태 전달
        />
      )}
    </Container>
  );
};

export default TakePhoto;
