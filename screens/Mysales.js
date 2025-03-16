import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, FlatList, View} from 'react-native';

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

const ItemTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
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

const MyRecipes = () => {
  const [userData, setUserData] = useState(null);
  const [mySales, setMySales] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const loadData = async () => {
      const userId = await fetchUserData();
      await fetchSalesData(userId);
    };

    loadData();
  }, []);

  const renderSaleItem = ({item}) => (
    <SaleItem>
      <ItemTitle>{item.title}</ItemTitle>
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

export default MyRecipes;
