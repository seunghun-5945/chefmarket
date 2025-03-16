import {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlatList, Image, Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  background-color: #eee;
`;

const RecipeContainer = styled.TouchableOpacity`
  flex-direction: row;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  elevation: 2;
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

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin: 16px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const RecipeFrame = ({item, onPress}) => {
  // 이미지 URL을 확인 (첫 번째 이미지가 있으면 사용, 없으면 빈 View 표시)
  const imageUrl =
    item.cooking_img && item.cooking_img.length > 0
      ? item.cooking_img[0]
      : null;

  return (
    <RecipeContainer onPress={onPress}>
      <ImageFrame>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            style={{width: '100%', height: '100%', borderRadius: 5}}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ddd',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 5,
            }}>
            <Text>No Image</Text>
          </View>
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

const MyRecipes = () => {
  const navigation = useNavigation();
  const [myRecipesData, setMyRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');

        const response = await axios.get(
          'http://3.34.59.23/api/v1/recipes/my',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log('내 레시피 로드 성공:', response.data.length);
        setMyRecipesData(response.data);
        setError(null);
      } catch (error) {
        console.log(
          '내 레시피 불러오기 에러:',
          error.response?.status || error.message,
        );
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRecipePress = recipe => {
    // DetailRecipe 화면으로 이동하면서 레시피 데이터 전달
    navigation.navigate('DetailRecipe', {
      recipeData: {
        recipe: recipe,
      },
    });
  };

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
      <HeaderTitle>내가 올린 레시피 ({myRecipesData.length})</HeaderTitle>

      {myRecipesData.length > 0 ? (
        <FlatList
          data={myRecipesData}
          renderItem={({item}) => (
            <RecipeFrame item={item} onPress={() => handleRecipePress(item)} />
          )}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={{
            padding: 10,
          }}
        />
      ) : (
        <EmptyContainer>
          <Text>내가 등록한 레시피가 없습니다.</Text>
        </EmptyContainer>
      )}
    </Container>
  );
};

export default MyRecipes;
