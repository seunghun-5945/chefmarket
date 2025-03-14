import styled from 'styled-components/native';
import {SafeAreaView, Image, Text} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Container = styled.View`
  flex: 1;
  position: relative;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const ImageFrame = styled.View`
  width: 100%;
  aspect-ratio: 1;
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const TitleFrame = styled.View`
  padding: 20px;
  flex-direction: row;
`;

const ExplainFrame = styled.View`
  flex: 8;
`;

const LikeButtonFrame = styled.View`
  flex: 2;
  align-items: flex-end;
`;

const LikeButton = styled.TouchableOpacity`
  width: 45px;
  height: 45px;
  align-items: center;
  justify-content: center;
  border: 1px dotted lightgray;
  border-radius: 50px;
  background-color: white;
`;

const Button = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 5px;
  background-color: lightsalmon;
`;

const TitleText = styled.Text`
  font-size: 18px;
`;

const WantItemsText = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const InfoFrame = styled.View`
  padding: 0px 20px 20px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const InfoText = styled.Text`
  font-size: 12px;
  color: gray;
`;

const ShareFrame = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0px 20px 20px 20px;
`;

const IconArea = styled.View`
  flex-direction: row;
  flex: 1;
  gap: 10px;
`;

const ShareButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 10px;
  gap: 10px;
`;

const RequesterInfoFrame = styled.View`
  padding: 10px;
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
  gap: 10px;
`;

const RequesterProfileImage = styled.View`
  width: 40px;
  height: 40px;
  border: 1px solid red;
  border-radius: 50px;
`;

const ContentFrame = styled.View`
  width: 100%;
  padding: 15px;
  margin-bottom: 100px;
`;

const DetailProduct = ({route}) => {
  // route.params에서 productData를 추출
  const product = route.params?.productData;
  const [isLiked, setIsLiked] = useState(false);
  const [address, setAddress] = useState('');
  const [isOwnProduct, setIsOwnProduct] = useState(false); // 자신의 상품인지 상태 추가
  const navigation = useNavigation();

  useEffect(() => {
    console.log(product);
  }, []);

  // 컴포넌트 마운트 시 자신의 상품인지 확인
  useEffect(() => {
    const checkIfOwnProduct = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;

        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = response.data;
        const sellerId = product.seller_id || product.user?.id;

        // 자신의 상품인지 설정
        setIsOwnProduct(currentUser.id === sellerId);
      } catch (error) {
        console.error('사용자 정보 확인 오류:', error);
      }
    };

    checkIfOwnProduct();
  }, [product]);

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
            const addressInfo = response.data.documents[0];
            const addr = addressInfo.road_address
              ? addressInfo.road_address.address_name
              : addressInfo.address.address_name;
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product.title}\n가격: ${product.value}원\n위치: ${address}`,
      });
    } catch (error) {
      console.error('공유 에러:', error);
    }
  };

  if (!product) {
    return (
      <SafeContainer>
        <Container>
          <Text>상품 정보를 불러올 수 없습니다.</Text>
        </Container>
      </SafeContainer>
    );
  }

  // 채팅하기 버튼 핸들러 수정
  const handleChatButton = async () => {
    try {
      // 액세스 토큰 가져오기
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        // 로그인되지 않은 경우 로그인 페이지로 이동
        navigation.navigate('Login', {
          returnScreen: 'DetailProduct',
          returnParams: route.params,
        });
        return;
      }

      // 현재 로그인한 사용자 정보 가져오기
      const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const currentUser = response.data;

      // 판매자 정보 확인
      const sellerId = product.seller_id || product.user?.id;
      const sellerName = product.user?.nickname || '판매자';

      // 자신의 상품인지 확인
      if (currentUser.id === sellerId) {
        Alert.alert('알림', '자신의 상품입니다.');
        return;
      }

      // 채팅방 생성에 사용될 데이터
      const chatRoomData = {
        buyer_id: currentUser.id,
        seller_id: product.seller_id,
        item_id: product.id,
      };

      // 콘솔에 보내는 정보 출력
      console.log('채팅방 생성 요청 데이터:', chatRoomData);
      console.log('현재 사용자 ID:', currentUser.id);
      console.log('판매자 ID:', sellerId); // product.id에서 sellerId로 수정
      console.log('상품 ID:', product.id);
      console.log('Authorization 토큰:', `Bearer ${token}`);

      // 여기서 채팅방 생성 API를 호출
      const chatRoomResponse = await axios.post(
        'http://3.34.59.23/api/v1/chat/chats',
        chatRoomData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 응답 데이터도 콘솔에 출력
      console.log('채팅방 생성 응답 데이터:', chatRoomResponse.data);

      // 채팅방 ID 가져오기
      const chatId = chatRoomResponse.data.id;

      // Chat 화면으로 이동하면서 필요한 정보 전달 (채팅방 ID 포함)
      navigation.navigate('Chat', {
        chatId: chatId, // 생성된 채팅방 ID
        itemId: product.id,
        productData: product,
        sellerId: sellerId,
        sellerName: sellerName,
        buyerId: currentUser.id,
        buyerName: currentUser.nickname,
        token: token, // 토큰도 함께 전달
      });
    } catch (error) {
      console.error('채팅 시작 오류:', error);
      Alert.alert('오류', '채팅을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  return (
    <SafeContainer>
      <Container>
        <ScrollContainer>
          <ImageFrame>
            <Image
              source={{uri: product.images[0]}}
              style={{width: '100%', height: '100%'}}
              resizeMode="cover"
            />
          </ImageFrame>
          <TitleFrame>
            <ExplainFrame>
              <TitleText>{product.title}</TitleText>
              <WantItemsText>{product.value}원</WantItemsText>
            </ExplainFrame>
            <LikeButtonFrame>
              <LikeButton onPress={() => setIsLiked(!isLiked)}>
                {isLiked ? (
                  <Icon2 name="heart" size={18} color="red" />
                ) : (
                  <Icon name="heart" size={18} />
                )}
              </LikeButton>
            </LikeButtonFrame>
          </TitleFrame>
          <InfoFrame>
            <InfoText>판매 시작: {product.created_at?.split('T')[0]}</InfoText>
            <InfoText>{address}</InfoText>
          </InfoFrame>
          <ShareFrame>
            <IconArea>
              <Icon name="heart" size={15} />
              <Text>0</Text>
              <Icon name="eye" size={15} />
              <Text>0</Text>
            </IconArea>
            <ShareButton onPress={handleShare}>
              <Icon name="share" size={15} />
              <Text>공유하기</Text>
            </ShareButton>
          </ShareFrame>
          <RequesterInfoFrame>
            <RequesterProfileImage>
              <Image
                source={{uri: product.user?.profile_image}}
                style={{width: '100%', height: '100%', borderRadius: 20}}
                resizeMode="cover"
              />
            </RequesterProfileImage>
            <Text>{product.user?.nickname || '판매자'}</Text>
            {product.expiry_date && (
              <Text>유통기한: {product.expiry_date.split('T')[0]}</Text>
            )}
          </RequesterInfoFrame>
          <ContentFrame>
            <Text>{product.contents}</Text>
          </ContentFrame>
        </ScrollContainer>
        <ButtonContainer>
          {isOwnProduct ? (
            // 자신의 상품일 경우 비활성화된 버튼 표시
            <Button
              style={{backgroundColor: '#cccccc'}} // 회색으로 변경
              onPress={() => Alert.alert('알림', ' 상품입니다.')}>
              <Text style={{color: 'white', fontWeight: '500'}}>
                내가 올린 상품
              </Text>
            </Button>
          ) : (
            // 타인의 상품일 경우 채팅하기 버튼 활성화
            <Button onPress={handleChatButton}>
              <Text style={{color: 'white', fontWeight: '500'}}>채팅하기</Text>
            </Button>
          )}
        </ButtonContainer>
      </Container>
    </SafeContainer>
  );
};

export default DetailProduct;
