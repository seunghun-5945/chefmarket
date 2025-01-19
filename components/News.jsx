import React from "react";
import styled from "styled-components/native";
import { TouchableOpacity, Linking } from "react-native";

const NewsContainer = styled.View`
  width: 100%;
  height: 150px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: lightgray;
`;

const ImageFrame = styled.Image`
  width: 40%;
  height: 100%;
`;

const ArticleFrame = styled.View`
  width: 60%;
  height: 100%;
`;

const ArticleTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin: 10px;
`;

const ArticleDescription = styled.Text`
  font-size: 14px;
  margin: 0 10px;
  color: #666;
`;

const ArticleDate = styled.Text`
  font-size: 12px;
  color: #999;
  margin: 10px;
  position: absolute;
  bottom: 0;
`;

const News = ({ article }) => {
  const handlePress = () => {
    if (article.url) {
      Linking.openURL(article.url).catch((err) => {
        console.error("Failed to open URL:", err);
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <NewsContainer>
        <ImageFrame 
          source={{ uri: article.urlToImage || "https://via.placeholder.com/150" }} 
          resizeMode="cover"
        />
        <ArticleFrame>
          <ArticleTitle numberOfLines={2}>{article.title}</ArticleTitle>
          <ArticleDescription numberOfLines={3}>{article.description}</ArticleDescription>
          <ArticleDate>{new Date(article.publishedAt).toLocaleDateString()}</ArticleDate>
        </ArticleFrame>
      </NewsContainer>
    </TouchableOpacity>
  );
};

export default News;