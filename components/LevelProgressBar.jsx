import React from 'react';
import styled from 'styled-components/native';
import {View, Text} from 'react-native';

// 등급별 정보 (색상 추가)
const LEVELS = [
  {
    name: '새댁/새싹',
    emoji: '🌱',
    minPoints: 0,
    maxPoints: 49,
    color: '#FEE500', // 녹색
  },
  {
    name: '집밥달인',
    emoji: '🍴',
    minPoints: 50,
    maxPoints: 69,
    color: '#9C27B0', // 보라색
  },
  {
    name: '요리마스터',
    emoji: '👨🏻‍🍳',
    minPoints: 70,
    maxPoints: 89,
    color: '#64C964', // 주황색
  },
  {
    name: '셰프',
    emoji: '🏆',
    minPoints: 90,
    maxPoints: Infinity,
    color: '#D9534F', // 파란색
  },
];

const LevelProgressBar = ({trustScore}) => {
  // trustScore 기반으로 현재 등급 찾기
  const currentLevel =
    LEVELS.find(
      level =>
        trustScore >= level.minPoints &&
        (trustScore <= level.maxPoints || level.maxPoints === Infinity),
    ) || LEVELS[0];

  // 현재 등급의 인덱스
  const currentLevelIndex = LEVELS.indexOf(currentLevel);

  // 다음 등급 계산
  const nextLevel = LEVELS[currentLevelIndex + 1];

  // 현재 레벨 내에서의 진행 비율 계산
  const calculateProgress = () => {
    if (currentLevelIndex === LEVELS.length - 1) return 1; // 최고 레벨일 경우

    const levelRange = currentLevel.maxPoints - currentLevel.minPoints + 1;
    const currentProgress = trustScore - currentLevel.minPoints;
    return Math.min(currentProgress / levelRange, 1);
  };

  // 프로그레스 바 렌더링을 위한 데이터 준비
  const renderProgressBar = () => {
    return LEVELS.map((level, index) => {
      // 이미 완전히 채워진 구간 (이전 레벨)
      if (index < currentLevelIndex) {
        return (
          <LevelSegment
            key={level.name}
            color={level.color}
            completed={true}
            width="25%"
          />
        );
      }

      // 현재 진행 중인 구간 (현재 레벨)
      if (index === currentLevelIndex) {
        return (
          <LevelSegment
            key={level.name}
            color={level.color}
            completed={true}
            width={`${calculateProgress() * 25}%`}
          />
        );
      }

      // 아직 도달하지 않은 구간 (미래 레벨)
      return (
        <LevelSegment
          key={level.name}
          color={level.color}
          completed={false}
          width="25%"
        />
      );
    });
  };

  return (
    <Container>
      <LevelInfoContainer>
        {LEVELS.map((level, index) => (
          <LevelInfo
            key={level.name}
            active={
              index <= currentLevelIndex || trustScore >= level.minPoints
            }>
            <LevelEmoji>{level.emoji}</LevelEmoji>
            <LevelName active={index === currentLevelIndex}>
              {level.name}
            </LevelName>
          </LevelInfo>
        ))}
      </LevelInfoContainer>

      <ProgressBarContainer>
        <ProgressBarWrapper>{renderProgressBar()}</ProgressBarWrapper>
        <PointsText>
          {trustScore} / {nextLevel ? nextLevel.minPoints : '최고 레벨'}
        </PointsText>
      </ProgressBarContainer>
    </Container>
  );
};

// 스타일 정의
const Container = styled.View`
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  margin: 10px;
`;

const LevelInfoContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const LevelInfo = styled.View`
  align-items: center;
  opacity: ${props => (props.active ? 1 : 0.3)};
`;

const LevelEmoji = styled.Text`
  font-size: 24px;
`;

const LevelName = styled.Text`
  font-size: 12px;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  color: ${props => (props.active ? '#FF6B6B' : 'gray')};
`;

const ProgressBarContainer = styled.View`
  margin-top: 5px;
`;

const ProgressBarWrapper = styled.View`
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  flex-direction: row;
`;

const LevelSegment = styled.View`
  height: 100%;
  background-color: ${props => (props.completed ? props.color : '#e0e0e0')};
  width: ${props => props.width};
`;

const PointsText = styled.Text`
  text-align: right;
  color: gray;
  font-size: 12px;
  margin-top: 5px;
`;

export default LevelProgressBar;
