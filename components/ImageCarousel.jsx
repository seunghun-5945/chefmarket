import React, {useState} from 'react';
import {View, Dimensions} from 'react-native';
import styled from 'styled-components/native';
import Swiper from 'react-native-web-swiper';

const {width} = Dimensions.get('window');

const SliderContainer = styled.View`
  width: 100%;
  height: 250px;
  position: relative;
`;

const SlideImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImageCarousel = ({images}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // 이미지 데이터 가공
  const imageData = (() => {
    // 단일 이미지 URL이 문자열로 전달된 경우
    if (typeof images === 'string') {
      return [{image_url: images}];
    }

    // images가 배열인 경우
    if (Array.isArray(images) && images.length > 0) {
      return images;
    }

    // 단일 이미지 객체인 경우
    if (images && images.image_url) {
      return [images];
    }

    // 기본 이미지 반환
    return [{image_url: 'https://via.placeholder.com/500?text=No+Image'}];
  })();

  // 이미지가 없거나 빈 배열인 경우 기본 이미지 보여주기
  if (!imageData || imageData.length === 0) {
    return (
      <SliderContainer>
        <SlideImage
          source={{uri: 'https://via.placeholder.com/500?text=No+Image'}}
          resizeMode="cover"
        />
      </SliderContainer>
    );
  }

  return (
    <SliderContainer>
      <Swiper
        from={0}
        loop
        timeout={3}
        springConfig={{speed: 11}}
        minDistanceForAction={0.1}
        controlsEnabled={false}
        gestureEnabled={true}
        onIndexChanged={index => setActiveIndex(index)}
        containerStyle={{height: 250, flex: 0}}
        dotsWrapperStyle={{bottom: 10}}
        dotStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          width: 8,
          height: 8,
          borderRadius: 4,
          margin: 4,
        }}
        activeDotStyle={{
          backgroundColor: '#ff6b6b',
          width: 8,
          height: 8,
          borderRadius: 4,
          margin: 4,
        }}>
        {imageData.map((item, index) => (
          <View key={`image-${index}`} style={{height: 250}}>
            <SlideImage source={{uri: item.image_url}} resizeMode="cover" />
          </View>
        ))}
      </Swiper>
    </SliderContainer>
  );
};

export default ImageCarousel;
