import React, {useEffect, useLayoutEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import {
  View,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import Icon3 from 'react-native-vector-icons/Fontisto';
import {Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  aspect-ratio: 1; /* width height 를 같게 해주는 태그인데 개신기함! */
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const ExplainArea = styled.View`
  flex: 8;
  padding: 10px;
  justify-content: space-around;
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

const Ingredient = ({product}) => {
  const navigation = useNavigation();
  const [address, setAddress] = useState('');

  useEffect(() => {
    const getAddress = async () => {
      if (
        product.location?.latitude !== undefined &&
        product.location?.longitude !== undefined
      ) {
        try {
          const response = await axios.get(
            `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${product.location.longitude}&y=${product.location.latitude}`,
            {
              headers: {
                Authorization: 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99',
              },
            },
          );

          if (response.data.documents && response.data.documents.length > 0) {
            // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용
            const addressInfo = response.data.documents[0];
            const addr = addressInfo.road_address
              ? addressInfo.road_address.address_name
              : addressInfo.address.address_name;

            // 동까지만 표시
            const shortAddr = addr.split(' ').slice(0, 3).join(' ');
            setAddress(shortAddr);
          }
        } catch (error) {
          console.error('주소 변환 에러:', error);
        }
      }
    };

    getAddress();
  }, [product.location]);

  return (
    <IngredientFrame
      onPress={() =>
        navigation.navigate('DetailProduct', {
          productData: product,
        })
      }>
      <ImageArea>
        <Image
          source={{uri: product.images[0]}}
          style={{width: '100%', height: '100%', borderRadius: 10}}
          resizeMode="cover"
        />
      </ImageArea>
      <ExplainArea>
        <TitleText>{product.title}</TitleText>
        <EtcText>{address && `${address}`} </EtcText>
        <EtcText>
          {product.expiry_date &&
            `유통기한: ${product.expiry_date.split('T')[0]}`}
        </EtcText>
        <TradeProductText>{product.value}원</TradeProductText>
      </ExplainArea>
      <ButtonArea>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('신고하기', '해당 게시물을 신고하시겠습니까?')
          }>
          <Icon name="ellipsis-vertical" size={20} />
        </TouchableOpacity>
      </ButtonArea>
    </IngredientFrame>
  );
};

const Trade = () => {
  const [product, setProduct] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupPurchases')}
            style={{marginRight: 15}}>
            <Icon3 name="shopping-basket" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            // 빈 상품 데이터와 함께 이동하거나, 새로운 상품 등록 화면으로 이동
            onPress={() => navigation.navigate('RegistProduct')}
            style={{marginRight: 15}}>
            <Icon2 name="pluscircleo" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setUserLocation({
          lat: response.data.location_lat,
          lon: response.data.location_lon,
        });
      } catch (error) {
        console.log('에러 발생', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchSalesByLocation();
    }
  }, [userLocation]);

  const fetchSalesByLocation = async () => {
    if (!userLocation) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `http://3.34.59.23/api/v1/sales/location?user_lat=${userLocation.lat}&user_lon=${userLocation.lon}&radius=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setProduct(response.data);
      console.log(response.data);
    } catch (error) {
      console.log('에러발생:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSalesByLocation();
    } finally {
      setRefreshing(false);
    }
  }, [userLocation]);

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
      <IngredientContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {product.map(item => (
          <Ingredient key={item.id} product={item} />
        ))}
      </IngredientContainer>
    </Container>
  );
};

export default Trade;
