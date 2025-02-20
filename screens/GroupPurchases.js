import React, { useState } from 'react';
import { TouchableOpacity, Platform, PermissionsAndroid, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import styled from "styled-components/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import Postcode from '@actbase/react-daum-postcode';
import Address from '../components/Address';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Container = styled.View`
  flex: 1;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: 10px;
  margin-bottom: ${props => props.keyboardOpen ? '0px' : '80px'};
`;

const GroupPurchases = () => {

  return (
    <SafeContainer>
    </SafeContainer>
  );
};

export default GroupPurchases;