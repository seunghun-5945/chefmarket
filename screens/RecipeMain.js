import React, {useEffect, useState, useLayoutEffect, useCallback} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-web-swiper';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import Icon3 from 'react-native-vector-icons/Fontisto';
import RecipeMainSkeleton from '../components/RecipeMainSkeleton';

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

const categories = [
  {id: 1, name: '국&찌개', icon: '🥘'},
  {id: 2, name: '반찬', icon: '🍲'},
  {id: 3, name: '일품', icon: '🍱'},
  {id: 4, name: '후식', icon: '🍰'},
];

const RecipeMain = () => {
  const [recipesData, setRecipesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);
  const [categorizedRecipes, setCategorizedRecipes] = useState({});
  const [lowCalorieRecipes, setLowCalorieRecipes] = useState({});
  // 새로운 상태 - 스켈레톤 표시를 위한 초기 로딩 상태
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);

  const navigation = useNavigation();

  // 레시피 등록 버튼 클릭 핸들러
  const handleRegistPress = useCallback(() => {
    if (permissions) {
      navigation.navigate('RegistRecipes');
    } else {
      Alert.alert('권한 부족', '레시피 등록을 위한 권한이 없습니다.', [
        {text: '확인', style: 'default'},
      ]);
    }
  }, [permissions, navigation]);

  // handleRecipeSelect 함수를 수정합니다
  const handleRecipeSelect = useCallback(
    recipeItem => {
      // recipeItem이 recipe 속성을 가지고 있는지 확인
      const recipeData = recipeItem.recipe ? recipeItem.recipe : recipeItem;
      navigation.navigate('DetailRecipe', {recipeData: recipeData});
    },
    [navigation],
  );

  useEffect(() => {
    console.log('recipesData 변경됨:', recipesData);
    // 필요하다면 추가 로직 수행
  }, [recipesData]);

  const onRefresh = useCallback(() => {
    console.log('새로고침 시작'); // 새로고침 시작 로그
    setRefreshing(true);

    const fetchData = async () => {
      try {
        console.log('토큰 가져오는 중...');
        const token = await AsyncStorage.getItem('accessToken');
        console.log('토큰:', token ? '토큰 있음' : '토큰 없음');

        if (!token) {
          console.log('토큰 없음: 새로고침 불가');
          setRefreshing(false);
          return;
        }

        console.log('추천 레시피 API 호출 중...');
        const recommendationsResponse = await axios.get(
          'http://3.34.59.23/api/v1/users/me/recommendations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('추천 레시피 응답:', recommendationsResponse.data);

        console.log('전체 레시피 API 호출 중...');
        const recipesResponse = await axios.get(
          'http://3.34.59.23/api/v1/recipes/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('전체 레시피 응답:', recipesResponse.data);

        // 상태 업데이트
        setRecipesData(recommendationsResponse.data);

        const allRecipes = Object.values(recipesResponse.data).flat();
        const lowCalorieRecipes = allRecipes.filter(
          recipe => recipe.calories >= 10 && recipe.calories <= 100,
        );

        setAllRecipes(recipesResponse.data);
        categorizeRecipes(recipesResponse.data);
        setLowCalorieRecipes(lowCalorieRecipes);

        // 활성 인덱스 초기화
        setActiveIndex(0);

        console.log('새로고침 완료');
        setRefreshing(false);
      } catch (error) {
        console.error('새로고침 중 오류:', error);
        setRefreshing(false);

        Alert.alert('새로고침 실패', '데이터를 불러오는 데 실패했습니다.');
      }
    };

    fetchData();
  }, [categorizeRecipes]);

  // 검색 함수
  const SearchRecipe = useCallback(
    async searchText => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          'http://3.34.59.23/api/v1/recipes/search',
          {
            params: {
              query: searchText,
              threshold: 0.4,
              limit: 10,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log(response.data);
        navigation.navigate('SearchRecipes', {
          searchResults: response.data,
          searchQuery: searchText,
        });
        return response.data;
      } catch (error) {
        console.log(error);
        Alert.alert('검색 오류', '검색 중 오류가 발생했습니다.');
        return [];
      }
    },
    [navigation],
  );

  // 레시피를 카테고리별로 분류하는 함수
  const categorizeRecipes = useCallback(recipes => {
    const categorized = {};

    if (Array.isArray(recipes)) {
      recipes.forEach(recipe => {
        const category = recipe.category || '기타';

        if (!categorized[category]) {
          categorized[category] = [];
        }

        categorized[category].push(recipe);
      });
    } else if (typeof recipes === 'object') {
      Object.keys(recipes).forEach(category => {
        if (Array.isArray(recipes[category])) {
          categorized[category] = recipes[category];
        }
      });
    }

    setCategorizedRecipes(categorized);
  }, []);

  // 모든 레시피 데이터 로드 함수
  const fetchAllRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.get('http://3.34.59.23/api/v1/recipes/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const allRecipes = Object.values(response.data).flat();

      const lowCalorieRecipes = allRecipes.filter(
        recipe => recipe.calories >= 10 && recipe.calories <= 100,
      );

      setAllRecipes(response.data);
      categorizeRecipes(response.data);
      setLowCalorieRecipes(lowCalorieRecipes); // 저칼로리 섹션을 위한 상태 추가
      console.log(lowCalorieRecipes);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.log('레시피 불러오기 오류:', error);
      setLoading(false);
      return [];
    }
  }, [categorizeRecipes]);

  // 카테고리 버튼 클릭 핸들러
  const handleCategoryPress = useCallback(
    categoryName => {
      if (
        categorizedRecipes[categoryName] &&
        categorizedRecipes[categoryName].length > 0
      ) {
        navigation.navigate('SearchRecipes', {
          searchResults: categorizedRecipes[categoryName],
          searchQuery: categoryName,
        });
      } else {
        Alert.alert('알림', `${categoryName} 카테고리의 레시피가 없습니다.`);
      }
    },
    [categorizedRecipes, navigation],
  );

  // 권한 체크
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          'http://3.34.59.23/api/v1/permissions/check',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log(response.data.permissions.can_create_recipe_class);
        setPermissions(response.data.permissions.can_create_recipe_class);
      } catch (error) {
        console.log(error);
      }
    };
    checkPermissions();
  }, []);

  // 헤더 설정
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={{marginRight: 15}}>
            <Icon2 name="star" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRegistPress}
            style={{marginRight: 15}}>
            <Icon2 name="pluscircleo" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, permissions, handleRegistPress]);

  // 레시피 추천 데이터 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        console.log('현재 토큰:', token ? '토큰 있음' : '토큰 없음');

        // 토큰이 없는 경우 더미 데이터 사용
        if (!token) {
          console.log('토큰이 없어 더미 데이터를 사용합니다.');
          setRecipesData([]); // 더미 데이터가 정의되지 않았으므로 빈 배열 사용
          setError(null);
          setLoading(false);
          setInitialLoading(false); // 초기 로딩 완료
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
        setInitialLoading(false); // 초기 로딩 완료
      }
    };

    fetchRecommendations();
  }, []);

  // 모든 레시피 데이터 로드
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  // 초기 로딩 중이면 스켈레톤 UI 표시
  if (initialLoading) {
    return <RecipeMainSkeleton />;
  }

  // 로딩 중에는 스켈레톤 렌더링 대신 실제 UI 렌더링
  return (
    <Container key={key}>
      <SearchBar>
        <SearchInput
          onChangeText={text => setSearchText(text)}
          onSubmitEditing={() => (searchText ? SearchRecipe(searchText) : null)}
          value={searchText}
          placeholder="🔍 검색해 보세요..."
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        <IconButton
          onPress={() => (searchText ? SearchRecipe(searchText) : null)}>
          <Text style={{fontSize: 20}}>🔍</Text>
        </IconButton>
      </SearchBar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']}
            tintColor="#ff0000"
            title="새로고침 중..."
          />
        }>
        <HeaderSection>
          <HeaderTitle>이런 요리는 어떠세요?</HeaderTitle>
          <HeaderSubtitle>부엌에서 간편하고 맛있게!</HeaderSubtitle>
        </HeaderSection>

        <MainSection>
          {loading ? (
            // 데이터 로딩 중에는 레시피 카드 영역 스켈레톤 표시
            <RecipeCard style={{backgroundColor: '#f5f5f5'}}>
              <View style={{height: 280}} />
            </RecipeCard>
          ) : recipesData && recipesData.length > 0 ? (
            <RecipeCard>
              <Swiper
                key={`swiper-${JSON.stringify(recipesData)}`} // 데이터 내용 자체로 key 생성
                from={0}
                loop
                timeout={3}
                springConfig={{speed: 11}}
                minDistanceForAction={0.1}
                controlsEnabled={false}
                gestureEnabled={true}
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
                      <TouchableWithoutFeedback
                        onPress={() => handleRecipeSelect(recipeItem)}>
                        <>
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
                        </>
                      </TouchableWithoutFeedback>
                    </View>
                  );
                })}
              </Swiper>
            </RecipeCard>
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
              <CategoryItem
                key={category.id}
                onPress={() => handleCategoryPress(category.name)}>
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

          {/* 스크롤 가능한 영역 높이 확보 */}
          <View style={{height: 220, marginBottom: 20}}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 10}}>
              {loading ? (
                // 로딩 중이면 스켈레톤 카드 표시
                [1, 2, 3].map(item => (
                  <View
                    key={item}
                    style={{
                      width: 160,
                      height: 200,
                      marginRight: 12,
                      borderRadius: 10,
                      backgroundColor: '#f5f5f5',
                    }}
                  />
                ))
              ) : lowCalorieRecipes.length > 0 ? (
                lowCalorieRecipes.map(recipe => (
                  <TouchableOpacity
                    key={recipe.id}
                    onPress={() => handleRecipeSelect(recipe)}
                    style={{
                      width: 160,
                      height: 200,
                      marginRight: 12,
                      borderRadius: 10,
                      backgroundColor: 'white',
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: '#eee',
                    }}>
                    <Image
                      source={{
                        uri:
                          recipe.image_large ||
                          'https://via.placeholder.com/400',
                      }}
                      style={{
                        width: '100%',
                        height: 120,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{padding: 10}}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: 4,
                        }}>
                        {recipe.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={{fontSize: 12, color: '#777'}}>
                          {recipe.calories} kcal
                        </Text>
                        <Text style={{fontSize: 12, color: '#777'}}>
                          {recipe.category}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{textAlign: 'center'}}>
                    해당 조건의 레시피가 없습니다.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </CategorySection>
      </ScrollView>
    </Container>
  );
};

export default RecipeMain;
