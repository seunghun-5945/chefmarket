import React, {useLayoutEffect, useEffect, useState, useCallback} from 'react';
import styled from 'styled-components/native';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-web-swiper';
import News from '../components/News';
import SkeletonNews from '../components/SkeletonNews';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const TopFrame = styled.View`
  height: 270px;
`;

const BottomFrame = styled.ScrollView.attrs({
  contentContainerStyle: {
    gap: 15,
    paddingBottom: 15, // 안드로이드의 하단 공백 문제 해결
  },
})`
  flex: 1;
`;

const StyledText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0px 10px 10px;
`;

const RecipeCard = styled.View`
  width: 100%;
  height: 220px;
  margin-bottom: 12px;
  background-color: white;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  overflow: hidden;
`;

const RecipeImage = styled.Image`
  width: 100%;
  height: 220px;
`;

const RecipeInfoBar = styled.View`
  height: 40px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: white;
`;

const RecipeTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const RecipeDifficulty = styled.Text`
  font-size: 14px;
  color: #777;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Home = () => {
  const navigation = useNavigation();
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipesData, setRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (__DEV__) {
      console.log('디버그 모드로 실행 중');
    } else {
      console.log('릴리즈 모드로 실행 중');
    }
  }, []);

  // 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          '앱 종료',
          '앱을 종료하시겠습니까?',
          [
            {
              text: '취소',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          {cancelable: false},
        );
        return true; // 기본 뒤로가기 동작을 방지
      };

      // Android에서는 BackHandler 이벤트 등록
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }

      return () => {
        if (Platform.OS === 'android') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, []),
  );

  // iOS에서는 네비게이션 이벤트를 통해 처리
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // 이 화면에서 뒤로가기 제스처를 비활성화
      const unsubscribe = navigation.addListener('beforeRemove', e => {
        // 홈 화면에서 뒤로가기 시도 시 기본 동작 방지
        if (e.data.action.type === 'GO_BACK') {
          e.preventDefault();

          // 종료 확인 대화상자 표시
          Alert.alert(
            '앱 종료',
            '앱을 종료하시겠습니까?',
            [
              {
                text: '취소',
                style: 'cancel',
                onPress: () => {},
              },
              {
                text: '확인',
                style: 'destructive',
                // iOS에서는 BackHandler.exitApp()이 작동하지 않기 때문에,
                // 앱을 백그라운드로 보내는 방식 사용 (완전 종료는 아님)
                onPress: () => {
                  // iOS에서는 완전히 앱을 종료할 수 없음
                  // 홈 화면으로 이동하는 효과를 위해 navigate를 사용
                  navigation.dispatch(e.data.action);
                },
              },
            ],
            {cancelable: false},
          );
        }
      });

      return unsubscribe;
    }
  }, [navigation]);

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          'https://newsapi.org/v2/everything?' +
            'q=음식' +
            '&language=ko' +
            '&sortBy=publishedAt' +
            '&pageSize=10' +
            '&apiKey=49311f06c6254f7f96cb4fb2d9c64431',
        );

        // 중복 제거 로직
        const articles = response.data.articles;
        const uniqueArticles = articles.filter(
          (article, index, self) =>
            index ===
            self.findIndex(
              a =>
                a.title === article.title || // 제목이 같거나
                a.url === article.url, // URL이 같은 경우 중복으로 간주
            ),
        );

        setNewsData({...response.data, articles: uniqueArticles});
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

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
          // 더미 데이터 생성
          const dummyData = [
            {
              recipe: {
                id: 'dummy1',
                name: '더미 레시피 1',
                difficulty: '쉬움',
                image_large:
                  'https://via.placeholder.com/400x300/87CEEB/FFFFFF?text=더미+레시피+1',
              },
            },
            {
              recipe: {
                id: 'dummy2',
                name: '더미 레시피 2',
                difficulty: '보통',
                image_large:
                  'https://via.placeholder.com/400x300/90EE90/FFFFFF?text=더미+레시피+2',
              },
            },
          ];
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
        if (response.data && response.data.length > 0) {
          console.log(response.data[0].recipe.image_large);
          console.log(
            response.data.length > 1
              ? response.data[1].recipe.image_large
              : '두 번째 항목 없음',
          );
          console.log(
            response.data.length > 2
              ? response.data[2].recipe.image_large
              : '세 번째 항목 없음',
          );
          console.log(
            response.data.length > 3
              ? response.data[3].recipe.image_large
              : '네 번째 항목 없음',
          );
        }
        setRecipesData(response.data);
        setError(null);
      } catch (error) {
        console.log('API 에러 발생:', error.response?.status || error.message);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const renderNewsContent = () => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => <SkeletonNews key={index} />);
    }

    return newsData?.articles?.map((article, index) => (
      <News
        key={article.url || index} // URL을 key로 사용하여 중복 방지
        article={article}
      />
    ));
  };

  // 레시피로 이동하는 함수
  const handleRecipePress = recipeData => {
    // RecipeMain에서 사용하는 방식으로 완전한 recipeData 객체를 전달
    if (recipeData) {
      // 직접 전체 recipeData 객체를 전달
      navigation.navigate('DetailRecipe', {recipeData});
    } else {
      // SearchRecipes로 이동
      navigation.navigate('SearchRecipes', {searchQuery: '추천'});
    }
  };

  // 전체 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <TopFrame>
        <StyledText>🍳오늘의 추천 레시피</StyledText>
        {recipesData && recipesData.length > 0 ? (
          <RecipeCard>
            <Swiper
              from={0}
              loop
              timeout={3}
              springConfig={{speed: 11}}
              minDistanceForAction={0.1}
              controlsEnabled={false}
              gestureEnabled={true}
              onIndexChanged={index => setActiveIndex(index)}
              containerStyle={{height: 220, flex: 0}}>
              {recipesData.map((recipeItem, index) => {
                const recipe = recipeItem.recipe;
                if (!recipe) return null;

                // 대표 이미지 가져오기 (fallback 처리)
                const mainImage =
                  recipe.image_large ||
                  'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=이미지+없음';

                return (
                  <TouchableWithoutFeedback
                    key={`recipe-${index}`}
                    onPress={() => handleRecipePress(recipeItem)}>
                    <View style={{height: 220}}>
                      <RecipeImage
                        source={{uri: mainImage}}
                        resizeMode="cover"
                      />
                      {/* InfoBar 삭제 */}
                    </View>
                  </TouchableWithoutFeedback>
                );
              })}
            </Swiper>
          </RecipeCard>
        ) : (
          <RecipeCard>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>표시할 레시피가 없습니다.</Text>
            </View>
          </RecipeCard>
        )}
      </TopFrame>
      <StyledText>📰Food News!</StyledText>
      <BottomFrame>{renderNewsContent()}</BottomFrame>
    </Container>
  );
};

export default Home;
