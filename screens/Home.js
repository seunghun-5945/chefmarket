import React, { useLayoutEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const Home = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 15 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("HomeModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("MapModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="search" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("ProfileModal")} 
            style={{ marginHorizontal: 10 }}
          >
            <Icon name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View>
      {/* 홈 화면 콘텐츠 */}
    </View>
  );
};

export default Home;
