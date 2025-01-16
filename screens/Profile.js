import React, { useLayoutEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const Profile = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => Alert.alert("설정", "설정 화면으로 이동합니다.")}
          style={{ marginRight: 15 }}
        >
          <Icon name="settings" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View>
      {/* 프로필 화면 내용 */}
    </View>
  );
};

export default Profile;
