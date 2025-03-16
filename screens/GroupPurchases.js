import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Postcode from '@actbase/react-daum-postcode';
import Address from '../components/Address';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {useNavigation} from '@react-navigation/native';

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
  margin-bottom: ${props => (props.keyboardOpen ? '0px' : '80px')};
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  height: 40px;
  font-size: 16px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const FilterButton = styled.TouchableOpacity`
  padding: 8px 13px;
  margin-right: 10px;
  margin-bottom: 8px;
  border-radius: 20px;
  background-color: ${props => (props.selected ? '#ff6b6b' : '#f0f0f0')};
`;

const FilterText = styled.Text`
  font-size: 14px;
  color: ${props => (props.selected ? 'white' : 'black')};
`;

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const SortText = styled.Text`
  font-size: 14px;
  margin-left: 5px;
`;

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const ItemImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 8px;
`;

const ItemInfo = styled.View`
  flex: 1;
  margin-left: 15px;
  justify-content: space-between;
`;

const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const ItemDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const OriginalPrice = styled.Text`
  font-size: 14px;
  color: #999;
  text-decoration-line: line-through;
  margin-right: 5px;
`;

const DiscountPrice = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
`;

const ParticipantContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const ParticipantText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-left: 5px;
`;

const StatusContainer = styled.View`
  position: absolute;
  top: 30px;
  right: 10px;
  background-color: ${props =>
    props.status === '모집중'
      ? '#4caf50'
      : props.status === '마감임박'
      ? '#ff9800'
      : '#f44336'};
  padding: 5px 10px;
  border-radius: 5px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 50px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #999;
  text-align: center;
`;

const TimeRemainingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

const TimeRemainingText = styled.Text`
  font-size: 14px;
  color: ${props => (props.urgent ? '#ff6b6b' : '#666')};
  margin-left: 5px;
  font-weight: ${props => (props.urgent ? 'bold' : 'normal')};
`;

const GroupPurchases = ({navigation}) => {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortOption, setSortOption] = useState('마감임박순');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // 카테고리 옵션 - API의 카테고리와 일치하게 수정
  const categories = ['전체', '육류', '채소', '과일', '주류', '기타'];

  // 정렬 옵션
  const sortOptions = [
    '마감임박순',
    '인기순',
    '가격낮은순',
    '가격높은순',
    '거리순',
  ];

  useEffect(() => {
    // 위치 정보 권한 요청 및 데이터 로드
    requestLocationPermission();
    loadData();
  }, []);

  // 위치 권한 요청
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 요청',
            message: '주변 공동구매 정보를 보기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // 현재 위치 가져오기
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // 수정된 데이터 로드 함수
  const loadData = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const response = await axios.get(
        'http://3.34.59.23/api/v1/group-purchases/',
        {
          params: {
            skip: 0,
            limit: 100,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('API 응답 데이터:', response.data);

      // API 응답을 앱에서 사용하는 형식으로 변환
      const formattedData = formatApiData(response.data);
      setData(formattedData);
    } catch (error) {
      console.log('공동구매 데이터 로드 실패:', error);

      Alert.alert(
        '데이터 로드 실패',
        '공동구매 정보를 불러오는데 실패했습니다. 다시 시도해주세요.',
        [{text: '확인'}],
      );
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터링
  const filterByCategory = items => {
    if (selectedCategory === '전체') {
      return items;
    }

    return items.filter(item => item.category === selectedCategory);
  };

  // 정렬 처리
  const sortItems = items => {
    switch (sortOption) {
      case '마감임박순':
        return [...items].sort(
          (a, b) => new Date(a.endDate) - new Date(b.endDate),
        );
      case '인기순':
        return [...items].sort(
          (a, b) =>
            b.participants / b.maxParticipants -
            a.participants / a.maxParticipants,
        );
      case '가격낮은순':
        return [...items].sort((a, b) => a.discountPrice - b.discountPrice);
      case '가격높은순':
        return [...items].sort((a, b) => b.discountPrice - a.discountPrice);
      case '거리순':
        return [...items].sort((a, b) => a.distance - b.distance);
      default:
        return items;
    }
  };

  const formatApiData = apiResponse => {
    // API 응답 구조에 맞게 매핑
    return apiResponse.map(item => {
      // 남은 시간 기반 상태 결정
      const now = new Date();
      const endDate = new Date(item.end_date);
      const remainingTime = endDate - now;

      // 상태 결정 (마감 시간 기반)
      let status;
      if (item.status === 'closed' || remainingTime <= 0) {
        status = '마감';
      } else if (remainingTime <= 24 * 60 * 60 * 1000) {
        // 24시간 이내
        status = '마감임박';
      } else {
        status = '모집중';
      }

      // 할인율 계산
      const originalPrice = item.original_price;
      const discountPrice = item.price;
      const discountRate =
        originalPrice && originalPrice > discountPrice
          ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
          : 0;

      // 이미지 URL 처리 - images 배열이 있고 첫 번째 이미지가 있으면 그 URL을 사용
      const imageUrl =
        item.images && item.images.length > 0 && item.images[0].image_url
          ? item.images[0].image_url
          : item.image_url || 'https://via.placeholder.com/500?text=No+Image';

      return {
        id: item.id.toString(),
        title: item.title,
        description: item.description || '',
        originalPrice: item.original_price, // API에서 제공하는 원가 사용
        discountPrice: item.price,
        discountRate: discountRate, // 할인율 계산 추가
        image: imageUrl,
        images: item.images || [], // 전체 이미지 배열도 저장
        participants: item.current_participants || 0,
        maxParticipants: item.max_participants || 5,
        status: status,
        distance: item.distance || 0,
        category: item.category, // API에서 제공하는 카테고리 사용
        endDate: item.end_date,
        organizer: item.organizer_name || '익명',
      };
    });
  };

  // 공동구매 참여 처리
  const handleParticipate = async item => {
    if (item.status === '마감') {
      Alert.alert('안내', '이미 마감된 공동구매입니다.');
      return;
    }

    Alert.alert('공동구매 참여', `${item.title} 공동구매에 참여하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '참여하기',
        onPress: async () => {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');

            // API 요청으로 참여 처리
            await axios.post(
              `http://3.34.59.23/api/v1/group-purchases/${item.id}/participate`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            // 참여 성공 시 데이터 리로드
            await loadData();
            Alert.alert('성공', '공동구매 참여가 완료되었습니다.');
          } catch (error) {
            console.error('참여 실패:', error);
            let errorMessage = '참여 처리 중 오류가 발생했습니다.';

            if (error.response && error.response.data) {
              if (error.response.data.detail) {
                errorMessage = error.response.data.detail;
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              }
            }

            Alert.alert('오류', errorMessage);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSearch = () => {
    // 검색 로직 구현
    if (!searchText.trim()) {
      return data;
    }

    return data.filter(
      item =>
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchText.toLowerCase())),
    );
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.log('새로고침 오류:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 새 공동구매 등록으로 이동
  const handleCreateNewGroupPurchase = () => {
    navigation.navigate('RegistGroupPurchases');
  };

  const getTimeRemaining = endDate => {
    const now = new Date();
    const end = new Date(endDate);
    const totalSeconds = Math.floor((end - now) / 1000);

    if (totalSeconds < 0) {
      return {text: '마감됨', urgent: false};
    }

    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let text = '';
    let urgent = false;

    if (days > 0) {
      text = `${days}일 ${hours}시간 남음`;
      urgent = days < 1;
    } else if (hours > 0) {
      text = `${hours}시간 ${minutes}분 남음`;
      urgent = true;
    } else if (minutes > 0) {
      text = `${minutes}분 ${seconds}초 남음`;
      urgent = true;
    } else {
      text = `${seconds}초 남음`;
      urgent = true;
    }

    return {text, urgent};
  };

  const TimeRemaining = ({endDate}) => {
    const [timeRemaining, setTimeRemaining] = useState(
      getTimeRemaining(endDate),
    );

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(endDate));
      }, 1000);

      return () => clearInterval(interval);
    }, [endDate]);

    return (
      <TimeRemainingContainer>
        <Icon
          name="timer"
          size={16}
          color={timeRemaining.urgent ? '#ff6b6b' : '#666'}
        />
        <TimeRemainingText urgent={timeRemaining.urgent}>
          {timeRemaining.text}
        </TimeRemainingText>
      </TimeRemainingContainer>
    );
  };

  // 데이터 처리 및 렌더링
  const processedData = sortItems(filterByCategory(handleSearch()));

  // 로딩 화면
  if (loading) {
    return (
      <SafeContainer>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={{marginTop: 10}}>공동구매 정보를 로딩 중입니다...</Text>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  const navigateToDetailPage = item => {
    navigation.navigate('GroupPurchaseDetail', {
      itemId: item.id,
      item: item, // 전체 아이템 정보도 함께 전달
    });
  };

  return (
    <SafeContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        onKeyboardDidShow={() => setKeyboardOpen(true)}
        onKeyboardDidHide={() => setKeyboardOpen(false)}>
        <Container>
          <ContentContainer
            keyboardOpen={keyboardOpen}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#ff6b6b']}
                tintColor="#ff6b6b"
                title="새로고침 중..."
                titleColor="#ff6b6b"
              />
            }>
            <HeaderTitle>공동구매</HeaderTitle>

            {/* 검색 영역 */}
            <SearchContainer>
              <Icon name="search" size={20} color="#999" />
              <SearchInput
                placeholder="검색어를 입력하세요"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="cancel" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </SearchContainer>

            {/* 카테고리 필터 */}
            <FilterContainer>
              {categories.map(category => (
                <FilterButton
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}>
                  <FilterText selected={selectedCategory === category}>
                    {category}
                  </FilterText>
                </FilterButton>
              ))}
            </FilterContainer>

            {/* 정렬 옵션 */}
            <SortButton
              onPress={() => {
                Alert.alert(
                  '정렬 방식 선택',
                  '',
                  sortOptions.map(option => ({
                    text: option,
                    onPress: () => setSortOption(option),
                  })),
                );
              }}>
              <Icon name="sort" size={20} color="#666" />
              <SortText>{sortOption}</SortText>
            </SortButton>

            {/* 공동구매 목록 */}
            {processedData.length === 0 ? (
              <EmptyContainer>
                <Icon name="search-off" size={60} color="#ddd" />
                <EmptyText>검색 결과가 없습니다.</EmptyText>
                <EmptyText>다른 검색어나 필터를 사용해보세요.</EmptyText>
              </EmptyContainer>
            ) : (
              processedData.map(item => (
                <ItemContainer
                  key={item.id}
                  onPress={() => navigateToDetailPage(item)}>
                  <ItemImage source={{uri: item.image}} resizeMode="cover" />
                  <ItemInfo>
                    <View>
                      <ItemTitle>{item.title}</ItemTitle>
                      <ItemDescription numberOfLines={2}>
                        {item.description}
                      </ItemDescription>
                      <PriceContainer>
                        {item.originalPrice > item.discountPrice && (
                          <OriginalPrice>
                            {item.originalPrice.toLocaleString()}원
                          </OriginalPrice>
                        )}
                        <DiscountPrice>
                          {item.discountPrice.toLocaleString()}원
                        </DiscountPrice>
                        {item.discountRate > 0 && (
                          <Text
                            style={{
                              color: '#ff6b6b',
                              fontSize: 14,
                              marginLeft: 5,
                            }}>
                            {item.discountRate}% 할인
                          </Text>
                        )}
                      </PriceContainer>
                      <ParticipantContainer>
                        <Icon2 name="account-group" size={16} color="#666" />
                        <ParticipantText>
                          {item.participants}/{item.maxParticipants}명 참여중
                        </ParticipantText>
                      </ParticipantContainer>
                      <TimeRemaining endDate={item.endDate} />
                    </View>
                    <StatusContainer status={item.status}>
                      <StatusText>{item.status}</StatusText>
                    </StatusContainer>
                  </ItemInfo>
                </ItemContainer>
              ))
            )}
          </ContentContainer>

          {/* 공동구매 등록 버튼 */}
          <FloatingButton onPress={handleCreateNewGroupPurchase}>
            <Icon name="add" size={30} color="white" />
          </FloatingButton>
        </Container>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

export default GroupPurchases;
