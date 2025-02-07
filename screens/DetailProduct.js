import { Text } from "react-native-gesture-handler";
import styled from "styled-components/native"; 
import { SafeAreaView, Image } from 'react-native'; 
import Icon from "react-native-vector-icons/SimpleLineIcons";
import Icon2 from "react-native-vector-icons/AntDesign";
import { useState } from "react";

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



const DetailProduct = ({ route }) => {
  // route.params에서 productData를 추출
  const product = route.params?.productData;
  const [isLiked, setIsLiked] = useState(false);

  // product가 없는 경우 처리
  if (!product) {
    return (
      <SafeContainer>
        <Container>
          <Text>상품 정보를 불러올 수 없습니다.</Text>
        </Container>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <Container>
        <ScrollContainer>
          <ImageFrame>
            <Image 
              source={{ uri: product.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </ImageFrame>
          <TitleFrame>
            <ExplainFrame>
              <TitleText>{product.title}</TitleText>
              <WantItemsText>희망 품목: {product.wantItems.join(', ')}</WantItemsText>
            </ExplainFrame>
            <LikeButtonFrame>
              <LikeButton onPress={() => setIsLiked(!isLiked)}>
                {isLiked ?
                  <Icon name="heart" size={18} />
                  :
                  <Icon2 name="heart" size={18} color="red"/>
                }
              </LikeButton>
            </LikeButtonFrame>
          </TitleFrame>
          <InfoFrame>
            <InfoText>{product.uploadTime}</InfoText>
            <InfoText>{product.distance} {product.location}</InfoText>
          </InfoFrame>
          <ShareFrame>
            <IconArea>
              <Icon name="heart" size={15} /><Text>15</Text>
              <Icon name="eye" size={15} /><Text>1,230</Text>
            </IconArea>
            <ShareButton>
              <Icon name="share" size={15} /><Text>공유하기</Text>
            </ShareButton>
          </ShareFrame>
          <RequesterInfoFrame>
            <RequesterProfileImage></RequesterProfileImage>
            <Text>왕따새끼</Text>
            <Text>왕따새끼</Text>
          </RequesterInfoFrame>
        </ScrollContainer>
        <ButtonContainer>
          <Button>
            <Text style={{fontWeight:500}}>채팅하기</Text>
          </Button>
        </ButtonContainer>
      </Container>
    </SafeContainer>
  );
};

export default DetailProduct;