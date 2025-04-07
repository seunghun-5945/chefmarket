import React, {useEffect, useLayoutEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import {
  View,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import Icon3 from 'react-native-vector-icons/Fontisto';
import {Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// soldOut 이미지 임포트 방식 수정
// 로컬 이미지는 require로 불러와야 합니다
const soldOutImage = require('../assets/images/soldOut.png');

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const SearchBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 16px;
  margin-right: 10px;
`;

const FilterFrame = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
  padding: 10px 0;
`;

const FilterButton = styled.TouchableOpacity`
  width: auto;
  height: 50px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 20px;

  /* 입체감을 위한 스타일 추가 */
  background-color: #ffffff;
  elevation: 5; /* Android 그림자 */
  shadow-color: #000; /* iOS 그림자 */
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const FilterButtonText = styled.Text`
  font-size: 12px;
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

const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SoldOutTag = styled.View`
  background-color: #ff5a5a;
  border-radius: 4px;
  padding: 2px 6px;
  margin-left: 8px;
`;

const SoldOutText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const NoResultsContainer = styled.View`
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const NoResultsText = styled.Text`
  font-size: 16px;
  color: #888;
`;

const Ingredient = ({product}) => {
  const navigation = useNavigation();
  const [address, setAddress] = useState('');
  const isSoldOut = product.status === 'Sold Out';

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
    <View style={{position: 'relative'}}>
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
          <PriceContainer>
            <TradeProductText>{product.value}원</TradeProductText>
            {isSoldOut && (
              <SoldOutTag>
                <SoldOutText>판매완료</SoldOutText>
              </SoldOutTag>
            )}
          </PriceContainer>
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

      {isSoldOut && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.3)', // 반투명 회색 오버레이
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
};

const Trade = () => {
  const [product, setProduct] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigation = useNavigation();

  // 권한 확인용 함수
  const handleGroupPurchasePress = () => {
    if (permissions) {
      navigation.navigate('GroupPurchases');
    } else {
      Alert.alert('권한 부족', '공동구매 호스팅을 위한 권한이 없습니다.', [
        {text: '확인', style: 'default'},
      ]);
    }
  };

  const handleSearch = text => {
    setSearchText(text);
    // useEffect에서 처리하므로 setTimeout 제거
  };

  // 카테고리 필터링 기능
  const handleCategoryFilter = category => {
    if (selectedCategory === category) {
      // 이미 선택된 카테고리를 다시 클릭하면 필터 해제
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    // useEffect에서 처리하므로 setTimeout 제거
  };

  // 권한 정보 가져오기
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          'http://3.34.59.23/api/v1/permissions/check',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        console.log(response.data.permissions.can_host_bulk_purchase);
        setPermissions(response.data.permissions.can_host_bulk_purchase);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPermissions();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={handleGroupPurchasePress}
            style={{marginRight: 15}}>
            <Icon3 name="shopping-basket" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            // 빈 상품 데이터와 함께 이동하거나, 새로운 상품 등록 화면으로 이동
            onPress={() => navigation.navigate('RegistProduct')}
            style={{marginRight: 15}}>
            <Icon2 name="pluscircleo" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, permissions]);

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

  // 데이터가 변경될 때 필터링된 데이터도 업데이트
  useEffect(() => {
    // 검색어가 있으면 검색 결과를 유지
    if (searchText) {
      const filtered = product.filter(item =>
        item.title.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredProduct(filtered);
    }
    // 카테고리가 선택되어 있으면 카테고리 필터 결과 유지
    else if (selectedCategory) {
      const filtered = product.filter(
        item => item.category === selectedCategory,
      );
      setFilteredProduct(filtered);
    }
    // 둘 다 없으면 전체 데이터 표시
    else {
      setFilteredProduct(product);
    }
  }, [product, searchText, selectedCategory]);

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

      // 각 상품에 카테고리 정보 추가
      const productsWithCategory = response.data.map(item => {
        // API 응답에 카테고리가 없으면 title에서 추측
        if (!item.category) {
          return {
            ...item,
            category: getCategoryFromProduct(item),
          };
        }
        return item;
      });

      setProduct(productsWithCategory);
      setFilteredProduct(productsWithCategory);
      console.log('상품 데이터 로드 완료:', productsWithCategory);
    } catch (error) {
      console.log('에러발생:', error);
    }
  };

  const getCategoryFromProduct = product => {
    // API에서 받은 데이터에 category 필드가 있으면 그대로 사용
    if (product.category) {
      return product.category;
    }
  };

  const applyFilters = () => {
    let filtered = product;

    // 검색어 필터 적용
    if (searchText) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // 카테고리 필터 적용
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredProduct(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // 사용자 정보 다시 가져오기
      const userResponse = await axios.get(
        'http://3.34.59.23/api/v1/users/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 위치 정보 업데이트
      setUserLocation({
        lat: userResponse.data.location_lat,
        lon: userResponse.data.location_lon,
      });

      // 판매 목록 새로고침
      await fetchSalesByLocation();
    } catch (error) {
      console.log('새로고침 중 에러 발생', error);
      Alert.alert('오류', '데이터를 새로고침할 수 없습니다.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 카테고리 정의
  const categories = [
    {icon: '🥩', name: '육류', value: '육류'},
    {icon: '🥦', name: '채소', value: '채소'},
    {icon: '🍎', name: '과일', value: '과일'},
    {icon: '🍺', name: '주류', value: '주류'},
    {icon: '🍹', name: '기타', value: '기타'},
  ];

  return (
    <Container>
      <SearchBar>
        <SearchInput
          placeholder="🔍 검색어를 입력하세요..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </SearchBar>

      <FilterFrame>
        {categories.map((category, index) => (
          <FilterButton
            key={index}
            onPress={() => handleCategoryFilter(category.value)}
            style={{
              backgroundColor:
                selectedCategory === category.value ? '#f0f0f0' : '#ffffff',
              borderColor:
                selectedCategory === category.value ? '#999' : '#eee',
            }}>
            <FilterButtonText>{category.icon + category.name}</FilterButtonText>
          </FilterButton>
        ))}
      </FilterFrame>

      <IngredientContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {filteredProduct.length > 0 ? (
          filteredProduct.map(item => (
            <Ingredient key={item.id} product={item} />
          ))
        ) : (
          <NoResultsContainer>
            <NoResultsText>검색 결과가 없습니다.</NoResultsText>
          </NoResultsContainer>
        )}
      </IngredientContainer>
    </Container>
  );
};

export default Trade;
