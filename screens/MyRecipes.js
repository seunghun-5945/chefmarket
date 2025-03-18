import {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FlatList,
  Image,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  flex: 7;
  padding: 10px;
`;

const ButtonArea = styled.View`
  flex: 1;
  align-items: flex-end;
  justify-content: space-between;
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

const RecipeFrame = ({item, onPress, onDelete}) => {
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
      <ButtonArea>
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Icon name="trash-outline" size={20} color="gray" />
        </TouchableOpacity>
      </ButtonArea>
    </RecipeContainer>
  );
};

const MyRecipes = () => {
  const navigation = useNavigation();
  const [myRecipesData, setMyRecipesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.get('http://3.34.59.23/api/v1/recipes/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  useEffect(() => {
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

  const handleDeleteRecipe = async recipe => {
    // 삭제 확인 알림
    Alert.alert(
      '레시피 삭제',
      '정말로 이 레시피를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');

              // 레시피 삭제 API 요청
              await axios.delete(
                `http://3.34.59.23/api/v1/recipes/${recipe.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              console.log('레시피 삭제 성공:', recipe.id);

              // 삭제 후 리스트 새로고침
              fetchData();

              // 성공 메시지
              Alert.alert('삭제 완료', '레시피가 성공적으로 삭제되었습니다.');
            } catch (error) {
              console.log('레시피 삭제 오류:', error.response || error);
              Alert.alert(
                '삭제 실패',
                `오류가 발생했습니다: ${
                  error.response?.data?.message || error.message
                }`,
              );
            }
          },
        },
      ],
      {cancelable: true},
    );
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
            <RecipeFrame
              item={item}
              onPress={() => handleRecipePress(item)}
              onDelete={handleDeleteRecipe}
            />
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
