import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {
  FlatList,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: #f8f8f8;
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
`;

const NoRatingsContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const NoRatingsText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
`;

const RecipeCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 12px;
  flex-direction: row;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const RecipeImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 8px;
`;

const RecipeInfo = styled.View`
  flex: 1;
  margin-left: 12px;
  justify-content: space-between;
`;

const RecipeName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const RecipeCategory = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const NutritionInfo = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const NutritionItem = styled.Text`
  font-size: 12px;
  color: #666;
  margin-right: 8px;
  margin-bottom: 4px;
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

const RatingText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #f8a100;
  margin-left: 4px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const RatingRecipes = () => {
  const [profile, setProfile] = useState(null);
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfileAndRatedRecipes = async () => {
      try {
        // 1. 토큰 가져오기
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.replace('Landing');
          return;
        }

        // 2. 프로필 가져오기
        const profileResponse = await axios.get(
          'http://3.34.59.23/api/v1/users/me/profile',
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        setProfile(profileResponse.data);

        // 3. ratings 객체가 있고 비어있지 않은지 확인
        const ratings = profileResponse.data.ratings || {};
        if (Object.keys(ratings).length === 0) {
          setLoading(false);
          return;
        }

        // 4. 평가한 레시피 ID들 가져오기
        const ratedRecipeIds = Object.keys(ratings);

        // 5. 각 레시피 정보 가져오기
        const recipesData = await Promise.all(
          ratedRecipeIds.map(async recipeId => {
            try {
              const recipeResponse = await axios.get(
                `http://3.34.59.23/api/v1/recipes/${recipeId}`,
                {
                  headers: {Authorization: `Bearer ${token}`},
                },
              );

              // 레시피 정보와 평점 결합
              return {
                ...recipeResponse.data,
                userRating: ratings[recipeId],
              };
            } catch (error) {
              console.log(`Error fetching recipe ${recipeId}:`, error);
              return null;
            }
          }),
        );

        // null 값 필터링 및 평점 기준 내림차순 정렬
        const validRecipes = recipesData
          .filter(recipe => recipe !== null)
          .sort((a, b) => b.userRating - a.userRating);

        setRatedRecipes(validRecipes);
      } catch (err) {
        console.log('Error fetching data:', err);
        if (err.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          navigation.replace('Landing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRatedRecipes();
  }, [navigation]);

  const handleRecipePress = recipeId => {
    navigation.navigate('RecipeDetail', {recipeId});
  };

  const renderRecipeItem = ({item}) => (
    <RecipeCard onPress={() => handleRecipePress(item.id)}>
      <RecipeImage
        source={{uri: item.image_small || 'https://via.placeholder.com/100'}}
        resizeMode="cover"
      />
      <RecipeInfo>
        <RecipeName>{item.name}</RecipeName>
        <RecipeCategory>{item.category}</RecipeCategory>
        <NutritionInfo>
          <NutritionItem>칼로리: {item.calories}kcal</NutritionItem>
          <NutritionItem>탄수화물: {item.carbs}g</NutritionItem>
          <NutritionItem>단백질: {item.protein}g</NutritionItem>
          <NutritionItem>지방: {item.fat}g</NutritionItem>
        </NutritionInfo>
        <RatingContainer>
          <Text>내 평점:</Text>
          <RatingText>{item.userRating}</RatingText>
        </RatingContainer>
      </RecipeInfo>
    </RecipeCard>
  );

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#0000ff" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Title>내가 평가한 레시피</Title>

      {ratedRecipes.length > 0 ? (
        <FlatList
          data={ratedRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <NoRatingsContainer>
          <NoRatingsText>아직 평가한 레시피가 없습니다.</NoRatingsText>
        </NoRatingsContainer>
      )}
    </Container>
  );
};

export default RatingRecipes;
