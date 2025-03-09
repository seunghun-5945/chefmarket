import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-web-swiper';
import {useNavigation} from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  width: 100%;
  background-color: white;
`;

const SearchBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 16px;
  margin-right: 10px;
`;

const IconButton = styled.TouchableOpacity`
  padding: 8px;
`;

const HeaderSection = styled.View`
  padding: 20px 16px 10px 16px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
`;

const HeaderSubtitle = styled.Text`
  font-size: 14px;
  color: #777;
  text-align: center;
`;

const MainSection = styled.View`
  padding: 0 16px;
`;

const RecipeCard = styled.View`
  width: 100%;
  height: 300px;
  border-radius: 10px;
  margin-bottom: 12px;
  background-color: white;
  elevation: 3;
  border: 1px solid gray;

  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;

  overflow: hidden; /* border-radius가 제대로 적용되도록 추가 */
`;

const RecipeImage = styled.Image`
  width: 100%;
  height: 200px;
`;

const RecipeInfoBar = styled.View`
  height: 50px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: white;
`;

const RecipeTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
`;

const InfoText = styled.Text`
  font-size: 12px;
  color: #gray;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 5px;
  margin-bottom: 15px;
`;

const Dot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${props => (props.active ? '#FF6B6B' : '#E0E0E0')};
  margin: 0 3px;
`;

const CategorySection = styled.View`
  margin-top: 5px;
  border-top-width: 10px;
  border-top-color: #f5f5f5;
  padding-top: 15px;
`;

const CategoryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 15px 16px;
`;

const CategoryTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const SeeAllButton = styled.TouchableOpacity``;

const SeeAllText = styled.Text`
  font-size: 14px;
  color: #777;
`;

const CategoryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 12px;
`;

const CategoryItem = styled.TouchableOpacity`
  width: 20%;
  align-items: center;
  margin-bottom: 16px;
`;

const CategoryIcon = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #f9f9f9;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryText = styled.Text`
  font-size: 12px;
  color: #333;
  text-align: center;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: red;
  text-align: center;
  margin: 20px;
`;

// 카테고리 데이터
const categories = [
  {id: 1, name: '제철요리', icon: '🥬'},
  {id: 2, name: '메인요리', icon: '🍲'},
  {id: 3, name: '밑반찬', icon: '🍱'},
  {id: 4, name: '국/탕', icon: '🥘'},
  {id: 5, name: '디저트', icon: '🍰'},
  {id: 6, name: '음료', icon: '🥤'},
  {id: 7, name: '원팬요리', icon: '🍳'},
  {id: 8, name: '간식', icon: '🥨'},
  {id: 9, name: '야식', icon: '🍜'},
  {id: 10, name: '기타', icon: '📝'},
];

const RecipeMain = () => {
  const [recipesData, setRecipesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        console.log('현재 토큰:', token ? '토큰 있음' : '토큰 없음');

        // 토큰이 없는 경우 더미 데이터 사용
        if (!token) {
          console.log('토큰이 없어 더미 데이터를 사용합니다.');
          setRecipesData(dummyData);
          setError(null);
          setLoading(false);
          return;
        }

        const response = await axios.get(
          'http://3.34.59.23/api/v1/users/me/recommendations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('API 응답 성공');
        console.log(response.data);
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

  // 레시피 선택 핸들러 추가
  const handleRecipeSelect = recipeItem => {
    // recipeItem에서 실제 recipe 객체 추출
    const recipe = recipeItem.recipe;

    // DetailRecipe 화면으로 네비게이션하며 전체 레시피 데이터 전달
    navigation.navigate('DetailRecipe', {recipeData: recipeItem});
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <SearchBar>
        <SearchInput
          placeholder="🔍 검색해 보세요..."
          placeholderTextColor="#999"
        />
        <IconButton>
          <Text style={{fontSize: 20}}>🛒</Text>
        </IconButton>
      </SearchBar>

      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderSection>
          <HeaderTitle>이런 요리는 어떠세요?</HeaderTitle>
          <HeaderSubtitle>부엌에서 간편하고 맛있게!</HeaderSubtitle>
        </HeaderSection>

        <MainSection>
          {recipesData && recipesData.length > 0 ? (
            <TouchableOpacity
              onPress={() => handleRecipeSelect(recipesData[activeIndex])}>
              <RecipeCard>
                <Swiper
                  from={0}
                  loop
                  timeout={3}
                  springConfig={{speed: 11}}
                  minDistanceForAction={0.1}
                  controlsEnabled={false}
                  onIndexChanged={index => setActiveIndex(index)}
                  containerStyle={{height: 220}}>
                  {recipesData.map((recipeItem, index) => {
                    const recipe = recipeItem.recipe;
                    if (!recipe) return null;

                    // 대표 이미지 가져오기
                    const mainImage =
                      recipe.image_large ||
                      (Array.isArray(recipe.cooking_img) &&
                      recipe.cooking_img.length > 0
                        ? recipe.cooking_img[0]
                        : 'https://via.placeholder.com/400');

                    return (
                      <View key={`recipe-${index}`} style={{height: 280}}>
                        <RecipeImage source={{uri: mainImage}} />
                        <RecipeInfoBar>
                          <RecipeTitle>
                            {recipe.name || '레시피 이름'}
                          </RecipeTitle>
                        </RecipeInfoBar>
                        <RecipeInfoBar>
                          <InfoText>
                            칼로리 : {recipe.calories || '0'} kcal
                          </InfoText>
                          <InfoText>{recipe.category || '0'}</InfoText>
                        </RecipeInfoBar>
                      </View>
                    );
                  })}
                </Swiper>
              </RecipeCard>
            </TouchableOpacity>
          ) : (
            <RecipeCard>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>표시할 레시피가 없습니다.</Text>
              </View>
            </RecipeCard>
          )}

          <DotsContainer>
            {recipesData.map((_, index) => (
              <Dot key={index} active={index === activeIndex} />
            ))}
          </DotsContainer>
        </MainSection>

        <CategorySection>
          <CategoryHeader>
            <CategoryTitle>테마별 레시피</CategoryTitle>
            <SeeAllButton>
              <SeeAllText>전체보기</SeeAllText>
            </SeeAllButton>
          </CategoryHeader>

          <CategoryGrid>
            {categories.map(category => (
              <CategoryItem key={category.id}>
                <CategoryIcon>
                  <Text style={{fontSize: 22}}>{category.icon}</Text>
                </CategoryIcon>
                <CategoryText>{category.name}</CategoryText>
              </CategoryItem>
            ))}
          </CategoryGrid>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>
            <CategoryTitle>운동중이세요? 저칼로리 레시피</CategoryTitle>
            <SeeAllButton>
              <SeeAllText>전체보기</SeeAllText>
            </SeeAllButton>
          </CategoryHeader>
        </CategorySection>
      </ScrollView>
    </Container>
  );
};

export default RecipeMain;
