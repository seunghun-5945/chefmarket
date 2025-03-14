import {useEffect} from 'react';
import {Text, Image, View, ScrollView} from 'react-native';
import styled from 'styled-components/native';

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

const DetailRecipe = ({route}) => {
  const {recipeData} = route.params;
  const recipe = recipeData.recipe;

  useEffect(() => {
    console.log(recipeData);
  }, [recipeData]);

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
      </ContentWrapper>
    </Container>
  );
};

export default DetailRecipe;
