import React, { useLayoutEffect } from "react";
import styled from "styled-components/native";
import { View, TouchableOpacity, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/AntDesign";

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const FilterFrame = styled.View`
  flex: 1;
  border: 3px solid red;
`;

const IngredientContainer = styled.ScrollView`
  flex: 9;
  border: 3px solid red;
`;

const ImageArea = styled.View`
  flex: 4;
  border: 1px solid red;
`;

const ExplainArea = styled.View`
  flex: 6;
  border: 1px solid blue;
`;

const IngredientFrame = styled.View`
  flex-direction: row;
  width: 100%;
  height: 150px;
  border: 1px solid lightgray;
  padding: 10px;
`;

const Ingredient = () => {
  return (
    <IngredientFrame>
      <ImageArea />
      <ExplainArea/>
    </IngredientFrame>
  );
};

const Trade = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 15 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("RegistProduct")}
            style={{ marginRight: 15 }}
          >
            <Icon2 name="pluscircleo" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => Alert.alert("채팅", "채팅 화면으로 이동합니다.")}
            style={{ marginRight: 15 }}
          >
            <Icon name="chatbubble-ellipses" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <Container>
      <FilterFrame></FilterFrame>
      <IngredientContainer>
        <Ingredient />
        <Ingredient />
        <Ingredient />
        <Ingredient />
        <Ingredient />
        <Ingredient />
        <Ingredient />
        <Ingredient />
      </IngredientContainer>
    </Container>
  );
};

export default Trade;
