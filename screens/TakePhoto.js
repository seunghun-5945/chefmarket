import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text, Alert } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TakePhoto = () => {
  const [imageUri, setImageUri] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [responseData, setResponseData] = useState([]);

  const uploadImage = async () => {
    if (!imageInfo) {
      Alert.alert('에러', '이미지를 선택해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageInfo.uri,
      type: imageInfo.type || 'image/jpeg',
      name: imageInfo.fileName || 'receipt.jpg',
    });

    try {
      // AsyncStorage에서 토큰 가져오기 추가
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('에러', '로그인이 필요합니다');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', {
        uri: imageInfo.uri,
        type: imageInfo.type || 'image/jpeg',
        name: imageInfo.fileName || 'receipt.jpg',
      });
  
      const API_URL = 'http://3.38.165.247/api/v1/receipts/upload';
      console.log('Uploading to:', API_URL);
      console.log('FormData:', formData);
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      setResponseData(data);
      
      if (response.ok) {
        Alert.alert('성공', '영수증이 성공적으로 업로드되었습니다.');
      } else {
        Alert.alert('실패', `업로드 실패: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      Alert.alert('에러', `서버 통신 오류: ${e.message}`);
      console.error('Upload error details:', {
        message: e.message,
        stack: e.stack,
        formData: formData._parts
      });
    }
};

  const pickImageFromLibrary = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri);
        setImageInfo(response.assets[0]);  // 전체 이미지 정보 저장
      }
    });
  };

  const captureImageWithCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri);
        setImageInfo(response.assets[0]);  // 전체 이미지 정보 저장
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image from Library" onPress={pickImageFromLibrary} />
      <Button title="Take a Photo with Camera" onPress={captureImageWithCamera} />
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Button title="영수증 업로드" onPress={uploadImage} />
        </>
      )}
      {!imageUri && <Text>No image selected</Text>}
      <View>
        {responseData && typeof responseData === 'object' && (
          <Text>
            {JSON.stringify(responseData, null, 2)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default TakePhoto;