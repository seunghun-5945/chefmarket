import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { Animated, Easing } from 'react-native';

const SkeletonContainer = styled.View`
  width: 100%;
  height: 100px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: lightgray;
  background-color: white;
  padding: 10px;
`;

const ImageSkeleton = styled(Animated.View)`
  width: 30%;
  height: 100%;
  background-color: #E8E8E8;
  border-radius: 4px;
`;

const ContentContainer = styled.View`
  width: 70%;
  height: 100%;
  padding-left: 10px;
`;

const TitleSkeleton = styled(Animated.View)`
  width: 90%;
  height: 16px;
  background-color: #E8E8E8;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const DescriptionSkeleton = styled(Animated.View)`
  width: 95%;
  height: 12px;
  background-color: #E8E8E8;
  border-radius: 4px;
  margin-bottom: 6px;
`;

const DateSkeleton = styled(Animated.View)`
  width: 40%;
  height: 12px;
  background-color: #E8E8E8;
  border-radius: 4px;
  margin-top: 10px;
`;

const SkeletonNews = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <SkeletonContainer>
      <ImageSkeleton style={{ opacity }} />
      <ContentContainer>
        <TitleSkeleton style={{ opacity }} />
        <DescriptionSkeleton style={{ opacity }} />
        <DescriptionSkeleton style={{ opacity, width: '75%' }} />
        <DateSkeleton style={{ opacity }} />
      </ContentContainer>
    </SkeletonContainer>
  );
};

// NewsSkeletonList - 여러 개의 스켈레톤을 보여주기 위한 컴포넌트
const NewsSkeletonList = ({ count = 5 }) => {
  return Array(count)
    .fill(0)
    .map((_, index) => <NewsSkeleton key={index} />);
};

export default SkeletonNews;