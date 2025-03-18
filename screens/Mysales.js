import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, FlatList, View, Alert, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // 아이콘 추가

const Container = styled.View`
  flex: 1;
  padding: 16px;
`;

const SaleItem = styled.View`
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  elevation: 2;
`;

const ItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ItemTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  flex: 1;
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 5px;
`;

const ItemDetail = styled.Text`
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
`;

const PriceText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #e53935;
  margin-top: 8px;
`;

const StatusBadge = styled.View`
  background-color: ${props => (props.available ? '#4caf50' : '#9e9e9e')};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
`;

const MySales = () => {
  const [userData, setUserData] = useState(null);
  const [mySales, setMySales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async userId => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get('http://3.34.59.23/api/v1/sales', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 현재 사용자가 판매자인 항목만 필터링
      if (userId) {
        const filteredSales = response.data.filter(
          item => item.seller_id === userId,
        );
        setMySales(filteredSales);
      }
    } catch (error) {
      console.log('판매 데이터 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        return response.data.id; // 사용자 ID 반환
      } catch (error) {
        console.log('사용자 정보 조회 에러:', error);
        return null;
      }
    };

    const loadData = async () => {
      const userId = await fetchUserData();
      await fetchSalesData(userId);
    };

    loadData();
  }, []);

  // 상품 삭제 함수
  const handleDeleteSale = async saleId => {
    // 삭제 확인 다이얼로그
    Alert.alert('상품 삭제', '정말 이 상품을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.delete(`http://3.34.59.23/api/v1/sales/${saleId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // 삭제 성공 후 목록 새로고침
            setMySales(prevSales =>
              prevSales.filter(item => item.id !== saleId),
            );
            Alert.alert('성공', '상품이 삭제되었습니다.');
          } catch (error) {
            console.error('상품 삭제 에러:', error);
            Alert.alert('오류', '상품 삭제 중 문제가 발생했습니다.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderSaleItem = ({item}) => (
    <SaleItem>
      <ItemHeader>
        <ItemTitle>{item.title}</ItemTitle>
        <DeleteButton onPress={() => handleDeleteSale(item.id)}>
          <Icon name="delete" size={24} color="gray" />
        </DeleteButton>
      </ItemHeader>
      <ItemDetail>카테고리: {item.category}</ItemDetail>
      <ItemDetail>
        유통기한: {new Date(item.expiry_date).toLocaleDateString()}
      </ItemDetail>
      <PriceText>{item.value.toLocaleString()}원</PriceText>
      <StatusBadge available={item.status === 'Available'}>
        <StatusText>
          {item.status === 'Available' ? '판매중' : '판매완료'}
        </StatusText>
      </StatusBadge>
    </SaleItem>
  );

  if (loading) {
    return (
      <Container>
        <Text>데이터를 불러오는 중...</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 16}}>
        내 판매 목록 ({mySales.length})
      </Text>
      {mySales.length > 0 ? (
        <FlatList
          data={mySales}
          renderItem={renderSaleItem}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>등록한 판매 상품이 없습니다.</Text>
        </View>
      )}
    </Container>
  );
};

export default MySales;
