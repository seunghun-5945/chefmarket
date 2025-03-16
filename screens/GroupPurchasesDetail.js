import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Share,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-web-swiper';

// 화면 크기 구하기
const {width} = Dimensions.get('window');

// 스타일 컴포넌트
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const BackButton = styled.TouchableOpacity`
  padding: 5px;
`;

const ActionContainer = styled.View`
  flex-direction: row;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 5px;
  margin-left: 15px;
`;

// 수정: ImageContainer 높이와 배경색 지정
const ImageContainer = styled.View`
  width: 100%;
  height: 250px;
  background-color: #f0f0f0;
`;

// SwiperSlide 컴포넌트 정의
const SwiperSlide = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: 15px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const OriginalPrice = styled.Text`
  font-size: 16px;
  color: #999;
  text-decoration-line: line-through;
  margin-right: 10px;
`;

const DiscountPrice = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
`;

const DiscountRate = styled.Text`
  font-size: 16px;
  color: #ff6b6b;
  margin-left: 10px;
`;

const InfoSection = styled.View`
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const InfoLabel = styled.Text`
  font-size: 15px;
  color: #666;
  width: 100px;
`;

const InfoValue = styled.Text`
  font-size: 15px;
  flex: 1;
`;

const Description = styled.Text`
  font-size: 15px;
  color: #333;
  line-height: 22px;
  margin-bottom: 20px;
`;

const ParticipantContainer = styled.View`
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ProgressBarContainer = styled.View`
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressBar = styled.View`
  height: 100%;
  background-color: #ff6b6b;
  border-radius: 5px;
  width: ${props => `${props.width}%`};
`;

const ParticipantText = styled.Text`
  font-size: 15px;
  text-align: center;
  margin-top: 5px;
`;

const TimeRemainingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const TimeRemainingText = styled.Text`
  font-size: 16px;
  color: ${props => (props.urgent ? '#ff6b6b' : '#666')};
  margin-left: 5px;
  font-weight: ${props => (props.urgent ? 'bold' : 'normal')};
`;

const BottomContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  border-top-width: 1px;
  border-top-color: #eee;
  background-color: white;
`;

const ShareButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 10px;
`;

const ShareButtonText = styled.Text`
  font-size: 16px;
  color: #333;
  margin-left: 5px;
`;

const ParticipateButton = styled.TouchableOpacity`
  flex: 2;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: ${props => (props.disabled ? '#ccc' : '#ff6b6b')};
  border-radius: 8px;
`;

const ParticipateButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-left: 5px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Pagination indicator styles
const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  debugInfo: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    marginTop: 5,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
  },
  debugUrlText: {
    fontSize: 8,
    color: '#999',
  },
});

const GroupPurchaseDetail = ({route, navigation}) => {
  const {itemId, item} = route.params;
  const [detailData, setDetailData] = useState(item || null);
  const [loading, setLoading] = useState(!item);
  const [timeRemaining, setTimeRemaining] = useState({text: '', urgent: false});

  // 디버깅 상태 추가
  const [debugMode, setDebugMode] = useState(__DEV__); // 개발 모드에서만 디버깅 정보 표시

  useEffect(() => {
    if (!item) {
      loadDetailData();
    } else {
      // 기존 아이템이 있을 경우 이미지 URL 처리
      const processedItem = processItemImages(item);
      setDetailData(processedItem);
      calculateTimeRemaining();
    }

    // 시간 업데이트를 위한 인터벌 설정
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 이미지 URL 처리하는 별도의 함수
  const processItemImages = data => {
    let imageUrls = [];

    // API 응답의 images 배열에서 image_url 추출
    if (data.images && data.images.length > 0) {
      imageUrls = data.images.map(img => img.image_url);
    }
    // 없으면 기본 이미지 URL 사용
    else if (data.image_url) {
      imageUrls.push(data.image_url);
    }
    // 둘 다 없으면 플레이스홀더 이미지
    else {
      imageUrls.push('https://via.placeholder.com/500?text=No+Image');
    }

    return {
      ...data,
      imageUrls,
    };
  };

  const loadDetailData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `http://3.34.59.23/api/v1/group-purchases/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // API 응답을 앱에서 사용하는 형식으로 변환
      const formattedData = formatApiData(response.data);
      setDetailData(formattedData);
    } catch (error) {
      console.log('상세 정보 로드 실패:', error);
      Alert.alert(
        '데이터 로드 실패',
        '정보를 불러오는데 실패했습니다. 다시 시도해주세요.',
        [{text: '확인', onPress: () => navigation.goBack()}],
      );
    } finally {
      setLoading(false);
    }
  };

  // formatApiData 함수 수정 - images 배열에서 image_url 추출
  const formatApiData = apiResponse => {
    // API 응답 구조에 맞게 매핑
    const now = new Date();
    const endDate = new Date(apiResponse.end_date);
    const remainingTime = endDate - now;

    // 상태 결정 (마감 시간 기반)
    let status;
    if (apiResponse.status === 'closed' || remainingTime <= 0) {
      status = '마감';
    } else if (remainingTime <= 24 * 60 * 60 * 1000) {
      // 24시간 이내
      status = '마감임박';
    } else {
      status = '모집중';
    }

    // 할인율 계산
    const originalPrice = apiResponse.original_price;
    const discountPrice = apiResponse.price;
    // 원가가 있고 할인가격보다 크면 할인율 계산, 아니면 0%
    const discountRate =
      originalPrice && originalPrice > discountPrice
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    // 모든 이미지 URL 배열 생성
    let imageUrls = [];

    // 이미지 배열이 있으면 그 URL들을 사용 (각 객체의 image_url 속성을 추출)
    if (apiResponse.images && apiResponse.images.length > 0) {
      imageUrls = apiResponse.images.map(img => img.image_url);
      console.log('이미지 URL 배열:', imageUrls); // 디버깅용 로그
    }
    // 없으면 기본 이미지 URL을 배열에 추가
    else if (apiResponse.image_url) {
      imageUrls.push(apiResponse.image_url);
    }
    // 둘 다 없으면 플레이스홀더 이미지
    else {
      imageUrls.push('https://via.placeholder.com/500?text=No+Image');
    }

    // 기본 이미지 URL (첫 번째 이미지 또는 대체 이미지)
    const imageUrl =
      imageUrls.length > 0
        ? imageUrls[0]
        : 'https://via.placeholder.com/500?text=No+Image';

    return {
      id: apiResponse.id.toString(),
      title: apiResponse.title,
      description: apiResponse.description || '',
      originalPrice: originalPrice,
      discountPrice: discountPrice,
      discountRate: discountRate,
      image: imageUrl,
      imageUrls: imageUrls, // 모든 이미지 URL 배열
      participants: apiResponse.current_participants || 0,
      maxParticipants: apiResponse.max_participants || 5,
      status: status,
      distance: apiResponse.distance || 0,
      location: apiResponse.location || '정보 없음',
      category: apiResponse.category || '기타', // API에서 제공하는 카테고리 사용
      endDate: apiResponse.end_date,
      organizer: apiResponse.organizer_name || '익명',
    };
  };

  const calculateTimeRemaining = () => {
    if (!detailData) return;

    const now = new Date();
    const end = new Date(detailData.endDate);
    const totalSeconds = Math.floor((end - now) / 1000);

    if (totalSeconds < 0) {
      setTimeRemaining({text: '마감됨', urgent: false});
      return;
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

    setTimeRemaining({text, urgent});
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${
          detailData.title
        } - ${detailData.discountPrice.toLocaleString()}원 공동구매! ${
          detailData.participants
        }/${detailData.maxParticipants}명 참여중. 같이 참여해요!`,
        title: detailData.title,
      });
    } catch (error) {
      Alert.alert('공유 실패', '공유하는 중 오류가 발생했습니다.');
    }
  };

  const handleParticipate = async () => {
    if (detailData.status === '마감') {
      Alert.alert('안내', '이미 마감된 공동구매입니다.');
      return;
    }

    Alert.alert(
      '공동구매 참여',
      `${detailData.title} 공동구매에 참여하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '참여하기',
          onPress: async () => {
            try {
              // 참여 로직 구현
              setLoading(true);
              const token = await AsyncStorage.getItem('accessToken');

              // API 요청으로 참여 처리
              await axios.post(
                `http://3.34.59.23/api/v1/group-purchases/${detailData.id}/participate`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                },
              );

              // 참여 성공 시 데이터 리로드
              await loadDetailData();
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
      ],
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={{marginTop: 10}}>상세 정보를 로딩 중입니다...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  // 커스텀 페이지네이션 렌더링 함수
  const renderPagination = (index, total) => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.pagination}>
          {Array.from({length: total}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                index === i
                  ? styles.paginationDotActive
                  : styles.paginationDotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // 이미지 URL 배열이 있는지와 길이가 0보다 큰지 확인
  const hasImages = detailData.imageUrls && detailData.imageUrls.length > 0;

  return (
    <Container>
      {/* 헤더 */}
      <HeaderContainer>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </BackButton>
        <ActionContainer>
          <ActionButton onPress={handleShare}>
            <Icon name="share" size={24} color="#333" />
          </ActionButton>
        </ActionContainer>
      </HeaderContainer>

      {/* 콘텐츠 */}
      <ContentContainer>
        {/* 이미지 캐러셀 */}
        <ImageContainer>
          {hasImages ? (
            <Swiper
              from={0}
              loop
              timeout={5}
              controlsEnabled={true}
              controlsProps={{
                dotsTouchable: true,
                prevPos: false,
                nextPos: false,
                dotActiveStyle: {backgroundColor: 'white'},
              }}
              key={`swiper-${detailData.imageUrls.length}`}
              renderPagination={renderPagination}>
              {detailData.imageUrls.map((imageUrl, index) => (
                <SwiperSlide key={`slide-${index}`}>
                  <ProductImage source={{uri: imageUrl}} resizeMode="cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <ProductImage source={{uri: detailData.image}} resizeMode="cover" />
          )}
        </ImageContainer>

        {/* 상태 표시 */}
        <View
          style={{
            position: 'absolute',
            top: 260 + (debugMode ? 30 : 0), // 디버깅 모드일 때 위치 조정
            right: 15,
            backgroundColor:
              detailData.status === '모집중'
                ? '#4caf50'
                : detailData.status === '마감임박'
                ? '#ff9800'
                : '#f44336',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            {detailData.status}
          </Text>
        </View>

        {/* 제목 및 가격 */}
        <Title>{detailData.title}</Title>
        <PriceContainer>
          {detailData.originalPrice > detailData.discountPrice && (
            <OriginalPrice>
              {detailData.originalPrice.toLocaleString()}원
            </OriginalPrice>
          )}
          <DiscountPrice>
            {detailData.discountPrice.toLocaleString()}원
          </DiscountPrice>
          {detailData.discountRate > 0 && (
            <DiscountRate>{detailData.discountRate}% 할인</DiscountRate>
          )}
        </PriceContainer>

        {/* 참여 정보 */}
        <ParticipantContainer>
          <SectionTitle>참여 현황</SectionTitle>
          <ProgressBarContainer>
            <ProgressBar
              width={
                (detailData.participants / detailData.maxParticipants) * 100
              }
            />
          </ProgressBarContainer>
          <ParticipantText>
            {detailData.participants}/{detailData.maxParticipants}명 참여중
          </ParticipantText>
          <TimeRemainingContainer>
            <Icon
              name="timer"
              size={18}
              color={timeRemaining.urgent ? '#ff6b6b' : '#666'}
            />
            <TimeRemainingText urgent={timeRemaining.urgent}>
              {timeRemaining.text}
            </TimeRemainingText>
          </TimeRemainingContainer>
        </ParticipantContainer>

        {/* 상품 정보 */}
        <InfoSection>
          <SectionTitle>상품 정보</SectionTitle>
          <InfoRow>
            <InfoLabel>카테고리</InfoLabel>
            <InfoValue>{detailData.category}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>주최자</InfoLabel>
            <InfoValue>{detailData.organizer}</InfoValue>
          </InfoRow>
        </InfoSection>

        {/* 상품 설명 */}
        <InfoSection>
          <SectionTitle>상품 설명</SectionTitle>
          <Description>{detailData.description}</Description>
        </InfoSection>
      </ContentContainer>

      {/* 하단 버튼 */}
      <BottomContainer>
        <ShareButton onPress={handleShare}>
          <Icon name="share" size={20} color="#333" />
          <ShareButtonText>공유하기</ShareButtonText>
        </ShareButton>
        <ParticipateButton
          disabled={detailData.status === '마감'}
          onPress={handleParticipate}>
          <Icon name="shopping-cart" size={20} color="white" />
          <ParticipateButtonText>
            {detailData.status === '마감' ? '마감됨' : '참여하기'}
          </ParticipateButtonText>
        </ParticipateButton>
      </BottomContainer>
    </Container>
  );
};

export default GroupPurchaseDetail;
