import {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatList, Image, Text} from 'react-native';

const Container = styled.View`
  flex: 1;
  background-color: #eee;
`;

const RecipeContainer = styled.View`
  flex-direction: row;
  border: 1px solid gray;
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
`;

const ImageFrame = styled.View`
  aspect-ratio: 1;
  height: 100px;
`;

const TextFrame = styled.View`
  flex: 8;
  padding: 10px;
`;

const RecipeText = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const CaloriesText = styled.Text`
  font-size: 14px;
  margin-top: 5px;
`;

const CategoryText = styled.Text`
  font-size: 14px;
  color: #888;
  margin-top: 5px;
`;

const RecipeFrame = ({item}) => {
  // 이미지 URL을 확인 (첫 번째 이미지가 있으면 사용, 없으면 빈 View 표시)
  const imageUrl =
    item.cooking_img && item.cooking_img.length > 0
      ? item.cooking_img[0]
      : null;

  return (
    <RecipeContainer>
      <ImageFrame>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            style={{width: '100%', height: '100%', borderRadius: 5}}
            resizeMode="cover"
          />
        ) : (
          <Text>No Image</Text>
        )}
      </ImageFrame>
      <TextFrame>
        <RecipeText>{item.name || '제목 없음'}</RecipeText>
        <CaloriesText>칼로리: {item.calories || '정보 없음'}</CaloriesText>
        <CategoryText>카테고리: {item.category || '정보 없음'}</CategoryText>
      </TextFrame>
    </RecipeContainer>
  );
};

const Recipe = () => {
  const [recipesData, setRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        console.log('현재 토큰:', token ? '토큰 있음' : '토큰 없음');

        const response = await axios.get(`http://3.34.59.23/api/v1/recipes/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('API 응답 성공');
        setRecipesData(response.data);
        setError(null);
      } catch (error) {
        console.log('API 에러 발생:', error.response?.status || error.message);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 로딩 중이거나 에러 발생 시 처리
  if (loading) {
    return (
      <Container>
        <Text style={{textAlign: 'center', marginTop: 20}}>로딩 중...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text style={{textAlign: 'center', marginTop: 20, color: 'red'}}>
          오류 발생:{' '}
          {error.response?.status === 401 ? '인증 실패 (401)' : error.message}
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={recipesData}
        renderItem={({item}) => <RecipeFrame item={item} />}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={{
          padding: 10,
        }}
      />
    </Container>
  );
};

export default Recipe;
