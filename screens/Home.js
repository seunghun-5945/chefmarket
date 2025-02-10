import React, { useLayoutEffect, useEffect,useState } from "react";
import styled from "styled-components/native";
import { View, TouchableOpacity, Image, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Swiper from "react-native-web-swiper";
import kimchistew from "../assets/testImage/kimchistew.jpg";
import armystew from "../assets/testImage/armyStew.jpg";
import steak from "../assets/testImage/steak.jpg";
import News from "../components/News";
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
        const response = await axios.get(
          'https://newsapi.org/v2/everything?' +
          'q=음식' +
          '&language=ko' +  // 한국어 기사
          '&sortBy=publishedAt' + // 최신순 정렬
          '&pageSize=10' + // 한 페이지당 결과 수
          '&apiKey=49311f06c6254f7f96cb4fb2d9c64431'
        );
        setNewsData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
  
    fetchNews();
  }, []);

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
        {newsData?.articles?.map((article, index) => (
          <News
            key={index}
            article={article}
          />
        ))}
      </BottomFrame>
    </Container>
  );
};

export default Home;