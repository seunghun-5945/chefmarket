import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: white;
  padding: 16px;
`;

const TitleText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const NoResultContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const NoResultText = styled.Text`
  font-size: 16px;
  color: #888;
  text-align: center;
  margin-top: 10px;
`;

const RecipeCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  border: 1px solid #eee;
`;

const RecipeImage = styled.Image`
  width: 100%;
  height: 180px;
`;

const RecipeInfo = styled.View`
  padding: 12px;
`;

const RecipeName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const RecipeDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const RecipeDetailRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const RecipeDetailText = styled.Text`
  font-size: 12px;
  color: #888;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SearchRecipes = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // route.params에서 데이터 추출
    if (route.params?.searchResults) {
      setSearchResults(route.params.searchResults);
      setLoading(false);
    }

    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  const renderRecipeItem = ({item}) => (
    <RecipeCard
      onPress={() =>
        navigation.navigate('DetailRecipe', {recipeData: {recipe: item}})
      }>
      <RecipeImage
        source={{
          uri:
            item.image_large ||
            item.cooking_img?.[0] ||
            'https://via.placeholder.com/400',
        }}
        resizeMode="cover"
      />
      <RecipeInfo>
        <RecipeName>{item.name}</RecipeName>
        <RecipeDescription numberOfLines={2}>
          {item.description || '레시피 설명이 없습니다.'}
        </RecipeDescription>
        <RecipeDetailRow>
          <RecipeDetailText>
            카테고리: {item.category || '일반'}
          </RecipeDetailText>
          <RecipeDetailText>
            칼로리: {item.calories || '0'} kcal
          </RecipeDetailText>
        </RecipeDetailRow>
      </RecipeInfo>
    </RecipeCard>
  );

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <TitleText>'{searchQuery}' 레시피 검색 결과입니다</TitleText>

      {searchResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `recipe-${item.id || index}`}
          renderItem={renderRecipeItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <NoResultContainer>
          <NoResultText>검색 결과가 없습니다.</NoResultText>
          <NoResultText>다른 검색어로 다시 시도해 보세요.</NoResultText>
        </NoResultContainer>
      )}
    </Container>
  );
};

export default SearchRecipes;
