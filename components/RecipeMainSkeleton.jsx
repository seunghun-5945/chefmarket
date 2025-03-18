import React, {useEffect} from 'react';
import {View, Animated, Dimensions, StyleSheet} from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  width: 100%;
  background-color: white;
`;

const SearchBarSkeleton = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const SearchInputSkeleton = styled.View`
  flex: 1;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  margin-right: 10px;
`;

const IconButtonSkeleton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #f5f5f5;
`;

const HeaderSectionSkeleton = styled.View`
  padding: 20px 16px 10px 16px;
  align-items: center;
`;

const HeaderTitleSkeleton = styled.View`
  width: 200px;
  height: 24px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
  border-radius: 4px;
`;

const HeaderSubtitleSkeleton = styled.View`
  width: 160px;
  height: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const MainSectionSkeleton = styled.View`
  padding: 0 16px;
`;

const RecipeCardSkeleton = styled.View`
  width: 100%;
  height: 300px;
  border-radius: 10px;
  margin-bottom: 12px;
  background-color: #f5f5f5;
  overflow: hidden;
`;

const DotsSkeleton = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const DotSkeleton = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #e0e0e0;
  margin: 0 3px;
`;

const CategorySectionSkeleton = styled.View`
  margin-top: 5px;
  border-top-width: 10px;
  border-top-color: #f5f5f5;
  padding-top: 15px;
`;

const CategoryHeaderSkeleton = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 15px 16px;
`;

const CategoryTitleSkeleton = styled.View`
  width: 140px;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const SeeAllSkeleton = styled.View`
  width: 60px;
  height: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const CategoryGridSkeleton = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 12px;
`;

const CategoryItemSkeleton = styled.View`
  width: 20%;
  align-items: center;
  margin-bottom: 16px;
`;

const CategoryIconSkeleton = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
`;

const CategoryTextSkeleton = styled.View`
  width: 40px;
  height: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const LowCalSectionSkeleton = styled.View`
  height: 220px;
  margin-bottom: 20px;
`;

const LowCalRowSkeleton = styled.View`
  flex-direction: row;
  padding: 0 10px;
`;

const LowCalCardSkeleton = styled.View`
  width: 160px;
  height: 200px;
  margin-right: 12px;
  border-radius: 10px;
  background-color: #f5f5f5;
  overflow: hidden;
`;

const RecipeMainSkeleton = () => {
  // 애니메이션 값 생성
  const shimmerAnim = new Animated.Value(0);

  // 화면 너비
  const {width} = Dimensions.get('window');

  // 애니메이션 효과
  useEffect(() => {
    const startShimmerAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ).start();
    };

    startShimmerAnimation();

    return () => {
      shimmerAnim.stopAnimation();
    };
  }, []);

  // 반짝이는 선의 위치와 색상 보간
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // 애니메이션 스타일
  const shimmerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    transform: [{translateX: shimmerTranslate}],
  };

  // 그라데이션 색상
  const linearGradient = {
    backgroundColor: 'transparent',
    opacity: 0.5,
    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)`,
  };

  return (
    <Container>
      <Animated.View
        style={[StyleSheet.absoluteFill, shimmerStyle, linearGradient]}
      />

      <SearchBarSkeleton>
        <SearchInputSkeleton />
        <IconButtonSkeleton />
      </SearchBarSkeleton>

      <HeaderSectionSkeleton>
        <HeaderTitleSkeleton />
        <HeaderSubtitleSkeleton />
      </HeaderSectionSkeleton>

      <MainSectionSkeleton>
        <RecipeCardSkeleton />
        <DotsSkeleton>
          <DotSkeleton />
          <DotSkeleton />
          <DotSkeleton />
        </DotsSkeleton>
      </MainSectionSkeleton>

      <CategorySectionSkeleton>
        <CategoryHeaderSkeleton>
          <CategoryTitleSkeleton />
          <SeeAllSkeleton />
        </CategoryHeaderSkeleton>

        <CategoryGridSkeleton>
          {[1, 2, 3, 4].map(item => (
            <CategoryItemSkeleton key={item}>
              <CategoryIconSkeleton />
              <CategoryTextSkeleton />
            </CategoryItemSkeleton>
          ))}
        </CategoryGridSkeleton>
      </CategorySectionSkeleton>

      <CategorySectionSkeleton>
        <CategoryHeaderSkeleton>
          <CategoryTitleSkeleton />
          <SeeAllSkeleton />
        </CategoryHeaderSkeleton>

        <LowCalSectionSkeleton>
          <LowCalRowSkeleton>
            {[1, 2, 3].map(item => (
              <LowCalCardSkeleton key={item} />
            ))}
          </LowCalRowSkeleton>
        </LowCalSectionSkeleton>
      </CategorySectionSkeleton>
    </Container>
  );
};

export default RecipeMainSkeleton;
