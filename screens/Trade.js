import React, { useLayoutEffect } from "react";
import styled from "styled-components/native";
import { View, TouchableOpacity, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/AntDesign";
import { Text } from "react-native-gesture-handler";
import { TradeList } from "../jsons/TradeList.json";

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const FilterFrame = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const FilterButton = styled.TouchableOpacity`
  width: auto;
  height: 50px;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 50px;
  
  /* 입체감을 위한 스타일 추가 */
  background-color: #ffffff;
  elevation: 5; /* Android 그림자 */
  shadow-color: #000; /* iOS 그림자 */
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const IngredientContainer = styled.ScrollView`
  flex: 9;
`;

const ImageArea = styled.View`
  aspect-ratio: 1;  /* width height 를 같게 해주는 태그인데 개신기함! */
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const ExplainArea = styled.View`
  flex: 8;
  padding: 10px;
`;

const ButtonArea = styled.View`
  flex: 2;
  align-items: flex-end;
  justify-content: space-between;
`;

const IngredientFrame = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
  height: 150px;
  border: 1px solid #eee;
  padding: 10px;
`;

const TitleText = styled.Text`
  font-size: 16px;
`;

const EtcText = styled.Text`
  font-size: 12px;
  color: gray;
`;

const TradeProductText = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const Ingredient = ({ product }) => {  
  const navigation = useNavigation(); // navigation 추가

  return (
    <IngredientFrame 
      onPress={() => navigation.navigate("DetailProduct", { 
        productData: product // 선택된 상품의 전체 데이터를 전달
      })}
    >
      <ImageArea>
        <Image 
          source={{ uri: product.imageUrl }} 
          style={{ width: '100%', height: '100%', borderRadius: 10 }} 
          resizeMode="cover"
        />
      </ImageArea>
      <ExplainArea>
        <TitleText>{product.title}</TitleText>
        <EtcText>{product.distance} {product.location} {product.uploadTime}</EtcText>
        <TradeProductText>{product.wantItems.join(', ')}</TradeProductText>
      </ExplainArea>
      <ButtonArea>
        <TouchableOpacity onPress={() => Alert.alert("신고하기", "해당 게시물을 신고하시겠습니까?")}>
          <Icon name="ellipsis-vertical" size={20} />   
        </TouchableOpacity>
      </ButtonArea>
    </IngredientFrame>
  );
};

const Trade = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity 
            // 빈 상품 데이터와 함께 이동하거나, 새로운 상품 등록 화면으로 이동
            onPress={() => navigation.navigate("RegistProduct")}
            style={{ marginRight: 15 }}
          >
            <Icon2 name="pluscircleo" size={24} color="black" />
          </TouchableOpacity>
          {/* ... 나머지 코드 ... */}
        </View>
      ),
    });
  }, [navigation]);

  return (
    <Container>
      <FilterFrame>
        <FilterButton>
          <Text>🥕농산물</Text>
        </FilterButton>
        <FilterButton>
          <Text>🐟수산물</Text>
        </FilterButton>
        <FilterButton>
          <Text>🐂축산물</Text>
        </FilterButton>
      </FilterFrame>
      <IngredientContainer>
        {TradeList.map((item) => (
          <Ingredient 
            key={item.id} 
            product={item} 
          />
        ))}
      </IngredientContainer>
    </Container>
  );
};

export default Trade;
