import {useEffect, useState} from 'react';
import {
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled(ScrollView)`
  flex: 1;
  background-color: white;
  padding-bottom: 30px;
`;

const ImageFrame = styled.Image`
  width: 100%;
  height: 350px;
`;

const ContentWrapper = styled.View`
  padding: 15px;
`;

const TitleText = styled.Text`
  font-size: 25px;
  font-weight: bold;
`;

const EtcView = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
  padding-bottom: 10px;
`;

const EtcText = styled.Text`
  font-size: 15px;
  color: gray;
  margin-top: 10px;
`;

const SectionText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
`;

const Divider = styled.View`
  height: 1px;
  width: 100%;
  background-color: #e0e0e0;
  margin-vertical: 10px;
`;

const StepWrapper = styled.View`
  margin-top: 15px;
  margin-bottom: 15px;
  align-items: center;
`;

const StepText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const RatingFrame = styled.View`
  width: 100%;
  align-items: center;
  padding: 20px 0;
`;

const RatingTitle = styled.Text`
  color: black;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
`;

const StarsContainer = styled.View`
  flex-direction: row;
  margin-top: 15px;
`;

const StarButton = styled.TouchableOpacity`
  padding: 5px;
`;

const ThankYouMessage = styled.Text`
  margin-top: 15px;
  font-size: 16px;
  color: #4caf50;
  font-weight: bold;
`;

const DetailRecipe = ({route}) => {
  const {recipeData} = route.params || {};

  // recipe 객체가 없는 경우 처리
  if (!recipeData) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>레시피 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  // 확실한 recipe 객체 추출하기
  const recipe = recipeData.recipe || recipeData;
  const [rating, setRating] = useState(0);
  const [previousRating, setPreviousRating] = useState(0); // 이전 평가 저장
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 상태 추가

  useEffect(() => {
    console.log(recipeData);
    checkUserRatingHistory();
  }, []);

  // 사용자의 레시피 평가 이력 확인
  const checkUserRatingHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(
        'http://3.34.59.23/api/v1/users/me/profile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      console.log('프로필 데이터:', response.data);

      // 레시피 평가 이력에서 현재 레시피 ID에 해당하는 평가 확인
      const userRatings = response.data.ratings || {};
      const recipeId = recipe.id.toString();

      if (userRatings[recipeId]) {
        const userRating = parseInt(userRatings[recipeId]);
        console.log(
          `사용자가 레시피 ${recipeId}에 ${userRating}점을 평가했습니다.`,
        );

        setPreviousRating(userRating);
        setRating(userRating);
        setHasRated(true);
      } else {
        console.log(`사용자가 레시피 ${recipeId}를 아직 평가하지 않았습니다.`);
      }
    } catch (error) {
      console.error('사용자 평가 이력 확인 중 오류:', error);
    }
  };

  // 메인 이미지 처리
  const mainImage =
    recipe.image_large ||
    (Array.isArray(recipe.cooking_img) && recipe.cooking_img.length > 0
      ? recipe.cooking_img[0]
      : 'https://via.placeholder.com/400'); // 기본 이미지

  // 조리 과정과 설명을 순서대로 매칭하고 숫자 및 온점 제거
  const cookingSteps = (recipe.cooking_img || []).map((img, index) => {
    // 숫자와 온점 패턴 제거 (예: "1. ", "2. ", "10. " 등)
    const instructions = recipe.instructions?.[index] || '설명이 없습니다.';
    const cleanedInstructions = instructions.replace(/^\d+\.\s*/, '');

    return {
      img,
      instructions: cleanedInstructions,
    };
  });

  // 별점 선택 핸들러
  const handleRating = selectedRating => {
    if (isSubmitting) return;
    setRating(selectedRating);

    // 수정 모드가 아닌 경우, 별점 선택시 자동으로 수정 모드로 전환
    if (hasRated && !isEditMode) {
      setIsEditMode(true);
    }
  };

  // 평가 제출 함수
  const submitRating = async () => {
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('로그인 필요', '평가를 위해 로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      // 레시피 ID가 숫자인지 확인하고 정수로 변환
      const recipeId = parseInt(recipe.id);

      if (isNaN(recipeId)) {
        console.error('유효하지 않은 레시피 ID:', recipe.id);
        Alert.alert('오류', '유효하지 않은 레시피 ID입니다.');
        setIsSubmitting(false);
        return;
      }

      // rating이 1~5 사이의 정수인지 확인
      const scoreValue = parseInt(rating);
      if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 5) {
        console.error('유효하지 않은 평점:', rating);
        Alert.alert('오류', '평점은 1에서 5 사이의 정수여야 합니다.');
        setIsSubmitting(false);
        return;
      }

      // API 요청 로그 추가
      console.log('레시피 ID:', recipeId);
      console.log('제출할 평점:', scoreValue);
      console.log('이전 평점:', previousRating);
      console.log('수정 모드:', isEditMode);

      // 숫자 값만 보내는 요청 본문
      const requestBody = scoreValue;

      // API 요청 실행
      const response = await axios.post(
        `http://3.34.59.23/api/v1/recipes/recommendations/${recipeId}/rate`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      console.log('평가 결과:', response.data);
      setHasRated(true);
      setIsEditMode(false);
      setPreviousRating(scoreValue);

      if (isEditMode) {
        Alert.alert('성공', '레시피 평가가 수정되었습니다.');
      } else {
        Alert.alert('성공', '레시피 평가가 완료되었습니다. 감사합니다!');
      }
    } catch (error) {
      console.error('평가 제출 에러:', error);

      // 에러 응답 상세 정보 로깅
      if (error.response) {
        console.log('에러 상태:', error.response.status);
        console.log('에러 데이터:', error.response.data);

        // 에러 메시지가 있으면 표시
        const errorMessage =
          error.response.data.message || '평가 제출 중 오류가 발생했습니다.';
        Alert.alert('오류', errorMessage);
      } else {
        Alert.alert(
          '오류',
          '평가 제출 중 오류가 발생했습니다. 다시 시도해 주세요.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 평가 수정 취소
  const cancelEdit = () => {
    setRating(previousRating);
    setIsEditMode(false);
  };

  return (
    <Container>
      {/* 메인 이미지 */}
      <ImageFrame source={{uri: mainImage}} />

      <ContentWrapper>
        <TitleText>{recipe.name}</TitleText>

        <EtcView>
          <EtcText>칼로리: {recipe.calories}kcal</EtcText>
          <EtcText>카테고리: {recipe.category}</EtcText>
        </EtcView>

        {/* 필요 식재료 */}
        <SectionText>🥕필요 식재료</SectionText>
        <View>
          <Divider />
          {Object.entries(recipe.ingredients).map(
            ([ingredient, amount], index) => (
              <View key={index}>
                <Text
                  style={{
                    fontSize: 15,
                    padding: 5,
                  }}>
                  {ingredient}: {amount}
                </Text>
                <Divider />
              </View>
            ),
          )}
        </View>

        {/* 조리 순서 */}
        <SectionText>🧂조리 순서</SectionText>
        {cookingSteps.map((step, index) => (
          <StepWrapper key={index}>
            <StepText>Step {index + 1}</StepText>
            <Image
              source={{uri: step.img}}
              style={{width: '100%', height: 250, borderRadius: 10}}
            />
            <Text
              style={{
                fontSize: 16,
                marginTop: 25,
                marginBottom: 20,
                paddingHorizontal: 10,
                textAlign: 'center',
                lineHeight: 22,
              }}>
              {step.instructions}
            </Text>
            <Divider style={{marginBottom: 10}} />
          </StepWrapper>
        ))}

        {/* 레시피 평가 섹션 */}
        <RatingFrame>
          <RatingTitle>
            {hasRated && !isEditMode
              ? '이 레시피를 이미 평가하셨습니다'
              : isEditMode
              ? '평가를 수정해 주세요'
              : '맛있게 드셨다면? 레시피를 평가해 주세요'}
          </RatingTitle>

          <StarsContainer>
            {[1, 2, 3, 4, 5].map(star => (
              <StarButton
                key={star}
                onPress={() => handleRating(star)}
                disabled={isSubmitting}>
                <Icon
                  name={rating >= star ? 'star' : 'staro'}
                  size={35}
                  color={rating >= star ? '#FFD700' : '#CCCCCC'}
                />
              </StarButton>
            ))}
          </StarsContainer>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              justifyContent: 'center',
            }}>
            {/* 이미 평가한 레시피인 경우 수정 관련 버튼 표시 */}
            {hasRated && !isEditMode ? (
              <TouchableOpacity
                style={{
                  backgroundColor: '#2196F3',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
                onPress={() => setIsEditMode(true)}>
                <Text
                  style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                  평가 수정하기
                </Text>
              </TouchableOpacity>
            ) : isEditMode ? (
              // 수정 모드일 때 '수정 완료'와 '취소' 버튼 표시
              <>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#4CAF50',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                  onPress={submitRating}
                  disabled={isSubmitting || rating === 0}>
                  <Text
                    style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                    {isSubmitting ? '수정 중...' : '수정 완료'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F44336',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                  onPress={cancelEdit}
                  disabled={isSubmitting}>
                  <Text
                    style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                    취소
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // 평가한 적 없는 경우 '평가하기' 버튼 표시
              <TouchableOpacity
                style={{
                  backgroundColor: '#4CAF50',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  opacity: rating === 0 || isSubmitting ? 0.5 : 1,
                }}
                onPress={submitRating}
                disabled={rating === 0 || isSubmitting}>
                <Text
                  style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                  {isSubmitting ? '평가 중...' : '평가하기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {hasRated && !isEditMode && (
            <ThankYouMessage>평가해 주셔서 감사합니다!</ThankYouMessage>
          )}
        </RatingFrame>
      </ContentWrapper>
    </Container>
  );
};

export default DetailRecipe;
