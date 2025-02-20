import React, { useLayoutEffect, useEffect, useState } from "react";
import styled from "styled-components/native";
import { View, TouchableOpacity, Image, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Swiper from "react-native-web-swiper";
import kimchistew from "../assets/testImage/kimchistew.jpg";
import armystew from "../assets/testImage/armyStew.jpg";
import steak from "../assets/testImage/steak.jpg";
import News from "../components/News";
import SkeletonNews from "../components/SkeletonNews";
import axios from "axios";

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const TopFrame = styled.View`
  flex: 4;
`;

const BottomFrame = styled.ScrollView.attrs({
  contentContainerStyle: {
    gap: 15
  }
})`
  flex: 4;
`;

const StyledText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin: 10px 0px 10px 10px;
`;

const Home = () => {
  const navigation = useNavigation();
  const images = [kimchistew, armystew, steak];
  const name = ["김치찌개", "부대찌개", "스테이크"];
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row"}}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Chat")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="chatbubble-ellipses-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("MapModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="search" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("TakePhoto")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

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
          '&apiKey=49311f06c6254f7f96cb4fb2d9c64431'
        );
        
        // 중복 제거 로직
        const articles = response.data.articles;
        const uniqueArticles = articles.filter((article, index, self) =>
          index === self.findIndex((a) => (
            a.title === article.title || // 제목이 같거나
            a.url === article.url // URL이 같은 경우 중복으로 간주
          ))
        );
        
        setNewsData({ ...response.data, articles: uniqueArticles });
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchNews();
  }, []);

  const renderNewsContent = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <SkeletonNews key={index} />
      ));
    }

    return newsData?.articles?.map((article, index) => (
      <News
        key={article.url || index} // URL을 key로 사용하여 중복 방지
        article={article}
      />
    ));
  };

  return (
    <Container>
      <TopFrame>
        <StyledText>🍳오늘의 추천 레시피</StyledText>
        <Swiper 
          from={0}
          loop 
          timeout={3}
          springConfig={{ speed: 11 }}
          minDistanceForAction={0.1}
          controlsEnabled={false}
          containerStyle={{ flex: 1 }}
        >
          {images.map((image, index) => (
            <View key={index} style={{ flex: 1 }}>
              <Image 
                source={image}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </View>
          ))}
        </Swiper>
      </TopFrame>
      <StyledText>📰Food News!</StyledText>
      <BottomFrame>
        {renderNewsContent()}
      </BottomFrame>
    </Container>
  );
};

export default Home;