import React, {useEffect, useState, useLayoutEffect} from 'react';
import styled from 'styled-components/native';
import {Text, Platform, Alert, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

const ResultScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const ResultContentContainer = styled.View`
  flex: 1;
  width: 100%;
  padding: 16px;
  padding-bottom: ${Platform.OS === 'ios' ? '96px' : '90px'};
`;

const ResultContainer = styled.View`
  width: 100%;
  max-width: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: white;
`;

const ResultTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const ItemContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
  padding: 12px 0;
  position: relative;
`;

const ItemRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ItemInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const ItemName = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const ItemDetail = styled.Text`
  font-size: 14px;
  color: #666;
`;

const MyIngredient = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity
            // onPress={() => Alert.alert('설정', '설정 화면으로 이동합니다.')}
            style={{marginRight: 15}}>
            <Icon name="trash" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            // onPress={() => handleLogout()}
            style={{marginRight: 15}}>
            <Icon2 name="edit" size={24} color="black" />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        // AsyncStorage에서 accessToken 가져오기
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
          // 토큰이 없으면 로그인 필요 알림
          Alert.alert('알림', '로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        // 헤더에 토큰 포함하여 요청
        const response = await axios.get(
          'http://3.34.59.23/api/v1/receipts/ingredients/my',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 응답 데이터 상태에 저장
        setIngredients(response.data);
        setLoading(false);
      } catch (error) {
        // 에러 처리
        console.error('재료 불러오기 실패:', error);
        setLoading(false);

        // 네트워크 에러나 인증 관련 에러 처리
        if (error.response) {
          // 서버 응답 있는 경우
          if (error.response.status === 401) {
            Alert.alert('오류', '인증에 실패했습니다. 다시 로그인해주세요.');
          } else {
            Alert.alert('오류', `서버 오류: ${error.response.data.message}`);
          }
        } else if (error.request) {
          // 요청은 보냈지만 응답 못 받은 경우
          Alert.alert(
            '오류',
            '서버와 연결할 수 없습니다. 네트워크를 확인해주세요.',
          );
        } else {
          // 기타 에러
          Alert.alert('오류', '알 수 없는 오류가 발생했습니다.');
        }
      }
    };

    fetchIngredients();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return (
      <ResultContentContainer>
        <Text>loading...</Text>
      </ResultContentContainer>
    );
  }

  return (
    <ResultScrollContainer showsVerticalScrollIndicator={false}>
      <ResultContentContainer>
        <ResultContainer>
          <ResultTitle>등록된 식재료</ResultTitle>
          {ingredients.length === 0 ? (
            <Text style={{textAlign: 'center', marginTop: 20}}>
              보유한 식재료가 없습니다.
            </Text>
          ) : (
            ingredients.map(ingredient => (
              <ItemContainer key={ingredient.id}>
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
      </ResultContentContainer>
    </ResultScrollContainer>
  );
};

export default MyIngredient;
