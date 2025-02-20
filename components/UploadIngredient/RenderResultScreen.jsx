// RenderResultScreen.jsx
import React from 'react';
import styled from 'styled-components/native';
import {Text, Platform, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 스크롤 관련 컴포넌트
const ResultScrollContainer = styled.ScrollView`
  flex: 1;
  position: relative;
`;

const ResultContentContainer = styled.View`
  padding: 16px;
  padding-bottom: ${Platform.OS === 'ios' ? '96px' : '90px'};
  position: relative;
`;

// 결과 표시 컴포넌트
const ResultContainer = styled.View`
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const ResultTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

// 아이템 관련 컴포넌트
const ItemContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
  padding: 12px 0;
  position: relative;
`;

const ItemRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const CheckboxContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const ItemInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const ItemName = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const ItemDetail = styled.Text`
  font-size: 14px;
  color: #666;
`;

// 카테고리 드롭다운 컴포넌트
const CategoryDropdown = styled.View`
  margin-top: 8px;
  width: 100%;
  position: relative;
  margin-bottom: 16px;
`;

const DateDropdownContainer = styled.View`
  margin-bottom: 16px;
  position: relative;
  z-index: ${props => props.zIndex || 1};
`;

const Dropdown = styled.TouchableOpacity`
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: white;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DropdownText = styled.Text`
  font-size: 14px;
  color: ${props => (props.placeholder ? '#999' : '#333')};
`;

const DropdownList = styled.ScrollView`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  z-index: 999;
  elevation: 5;
  max-height: 200px;
`;

const DropdownItemContainer = styled.View`
  border-bottom-width: ${props => (props.last ? '0' : '1px')};
  border-bottom-color: #ddd;
  background-color: white;
`;

const DropdownItem = styled.TouchableOpacity`
  padding: 12px;
  border-bottom-width: ${props => (props.last ? '0' : '1px')};
  border-bottom-color: #ddd;
  background-color: white;
`;

// 하단 고정 버튼 컴포넌트
const BottomButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px;
  border-top-width: 1px;
  border-top-color: #e0e0e0;
  ${Platform.OS === 'ios' ? 'padding-bottom: 30px;' : ''}
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 12px 24px;
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;

const ConfirmButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const ExpiryDateContainer = styled.View`
  margin-top: 10px;
`;

const RenderResultScreen = ({
  responseData,
  selectedItems,
  setSelectedItems,
  itemDetails,
  setItemDetails,
  openDropdown,
  setOpenDropdown,
  categories,
  formatDateTime,
  onComplete,
}) => {
  const handleConfirm = async () => {
    const selectedTempIds = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([tempId]) => Number(tempId));

    if (selectedTempIds.length === 0) {
      Alert.alert('알림', '선택된 품목이 없습니다.');
      return;
    }

    const missingCategories = selectedTempIds.some(
      id => !itemDetails[id]?.category,
    );
    if (missingCategories) {
      Alert.alert('알림', '모든 선택된 품목의 카테고리를 선택해주세요.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('에러', '로그인이 필요합니다');
        return;
      }

      const requestBody = selectedTempIds.map(temp_id => {
        const details = itemDetails[temp_id];
        const expiry_date = formatDateTime(
          details.year,
          details.month,
          details.day,
          details.hour,
          details.minute,
        );

        return {
          temp_id,
          category: details.category,
          expiry_date,
        };
      });

      const response = await fetch(
        'http://3.34.59.23/api/v1/receipts/confirm-batch',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        Alert.alert('성공', '선택한 품목이 등록되었습니다.');
        onComplete();
      } else {
        const errorData = await response.json();
        Alert.alert('실패', `품목 등록 실패: ${JSON.stringify(errorData)}`);
      }
    } catch (e) {
      Alert.alert('에러', `서버 통신 오류: ${e.message}`);
      console.error('Confirmation error:', e);
    }
  };

  return (
    <>
      <ResultScrollContainer>
        <ResultContentContainer>
          <ResultContainer>
            <ResultTitle>인식된 품목</ResultTitle>
            {responseData.items.map(item => (
              <ItemContainer key={item.temp_id}>
                <CheckboxContainer
                  onPress={() => {
                    const newSelectedState = !selectedItems[item.temp_id];
                    setSelectedItems(prev => ({
                      ...prev,
                      [item.temp_id]: newSelectedState,
                    }));

                    if (newSelectedState && !itemDetails[item.temp_id]) {
                      setItemDetails(prev => ({
                        ...prev,
                        [item.temp_id]: {
                          year: new Date().getFullYear().toString(),
                          month: (new Date().getMonth() + 1).toString(),
                          day: new Date().getDate().toString(),
                          hour: '23',
                          minute: '59',
                          category: '',
                        },
                      }));
                    }
                  }}>
                  <Icon
                    name={
                      selectedItems[item.temp_id]
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={selectedItems[item.temp_id] ? '#4CAF50' : '#999'}
                  />
                  <ItemInfo>
                    <ItemRow>
                      <ItemName>{item.name}</ItemName>
                      <ItemDetail>{item.amount.toLocaleString()}원</ItemDetail>
                    </ItemRow>
                    <ItemRow>
                      <ItemDetail>수량: {item.quantity}개</ItemDetail>
                      <ItemDetail>
                        {new Date(item.purchase_date).toLocaleDateString(
                          'ko-KR',
                        )}
                      </ItemDetail>
                    </ItemRow>
                  </ItemInfo>
                </CheckboxContainer>

                {selectedItems[item.temp_id] && (
                  <>
                    <CategoryDropdown>
                      <ResultTitle>카테고리</ResultTitle>
                      <Dropdown
                        onPress={() =>
                          setOpenDropdown(
                            openDropdown === item.temp_id ? null : item.temp_id,
                          )
                        }>
                        <DropdownText
                          placeholder={!itemDetails[item.temp_id]?.category}>
                          {itemDetails[item.temp_id]?.category ||
                            '카테고리 선택'}
                        </DropdownText>
                        <Icon
                          name={
                            openDropdown === item.temp_id
                              ? 'keyboard-arrow-up'
                              : 'keyboard-arrow-down'
                          }
                          size={24}
                          color="#666"
                        />
                      </Dropdown>

                      {openDropdown === item.temp_id && (
                        <DropdownList nestedScrollEnabled={true}>
                          {categories.map((category, idx) => (
                            <DropdownItemContainer
                              key={category}
                              last={idx === categories.length - 1}>
                              <DropdownItem
                                onPress={() => {
                                  setItemDetails(prev => ({
                                    ...prev,
                                    [item.temp_id]: {
                                      ...prev[item.temp_id],
                                      category,
                                    },
                                  }));
                                  setOpenDropdown(null);
                                }}>
                                <Text>{category}</Text>
                              </DropdownItem>
                            </DropdownItemContainer>
                          ))}
                        </DropdownList>
                      )}
                    </CategoryDropdown>

                    <ExpiryDateContainer>
                      <ResultTitle>유통기한 기입</ResultTitle>

                      {/* 년도 선택 */}
                      <DateDropdownContainer zIndex={5}>
                        <Dropdown
                          onPress={() =>
                            setOpenDropdown(
                              openDropdown === `year-${item.temp_id}`
                                ? null
                                : `year-${item.temp_id}`,
                            )
                          }>
                          <DropdownText
                            placeholder={!itemDetails[item.temp_id]?.year}>
                            {itemDetails[item.temp_id]?.year || '연도 선택'}
                          </DropdownText>
                          <Icon
                            name={
                              openDropdown === `year-${item.temp_id}`
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#666"
                          />
                        </Dropdown>
                        {openDropdown === `year-${item.temp_id}` && (
                          <DropdownList nestedScrollEnabled={true}>
                            {Array.from({length: 50}, (_, offset) => {
                              const year = new Date().getFullYear() + offset;
                              return (
                                <DropdownItemContainer
                                  key={year}
                                  last={offset === 49}>
                                  <DropdownItem
                                    onPress={() => {
                                      setItemDetails(prev => ({
                                        ...prev,
                                        [item.temp_id]: {
                                          ...prev[item.temp_id],
                                          year: year.toString(),
                                        },
                                      }));
                                      setOpenDropdown(null);
                                    }}>
                                    <Text>{year}년</Text>
                                  </DropdownItem>
                                </DropdownItemContainer>
                              );
                            })}
                          </DropdownList>
                        )}
                      </DateDropdownContainer>

                      {/* 월 선택 */}
                      <DateDropdownContainer zIndex={4}>
                        <Dropdown
                          onPress={() =>
                            setOpenDropdown(
                              openDropdown === `month-${item.temp_id}`
                                ? null
                                : `month-${item.temp_id}`,
                            )
                          }>
                          <DropdownText
                            placeholder={!itemDetails[item.temp_id]?.month}>
                            {itemDetails[item.temp_id]?.month
                              ? `${itemDetails[item.temp_id]?.month}월`
                              : '월 선택'}
                          </DropdownText>
                          <Icon
                            name={
                              openDropdown === `month-${item.temp_id}`
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#666"
                          />
                        </Dropdown>
                        {openDropdown === `month-${item.temp_id}` && (
                          <DropdownList nestedScrollEnabled={true}>
                            {Array.from({length: 12}, (_, i) => i + 1).map(
                              (month, idx) => (
                                <DropdownItemContainer
                                  key={month}
                                  last={idx === 11}>
                                  <DropdownItem
                                    onPress={() => {
                                      setItemDetails(prev => ({
                                        ...prev,
                                        [item.temp_id]: {
                                          ...prev[item.temp_id],
                                          month: month
                                            .toString()
                                            .padStart(2, '0'),
                                        },
                                      }));
                                      setOpenDropdown(null);
                                    }}>
                                    <Text>{month}월</Text>
                                  </DropdownItem>
                                </DropdownItemContainer>
                              ),
                            )}
                          </DropdownList>
                        )}
                      </DateDropdownContainer>

                      {/* 일 선택 */}
                      <DateDropdownContainer zIndex={3}>
                        <Dropdown
                          onPress={() =>
                            setOpenDropdown(
                              openDropdown === `day-${item.temp_id}`
                                ? null
                                : `day-${item.temp_id}`,
                            )
                          }>
                          <DropdownText
                            placeholder={!itemDetails[item.temp_id]?.day}>
                            {itemDetails[item.temp_id]?.day
                              ? `${itemDetails[item.temp_id]?.day}일`
                              : '일 선택'}
                          </DropdownText>
                          <Icon
                            name={
                              openDropdown === `day-${item.temp_id}`
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#666"
                          />
                        </Dropdown>
                        {openDropdown === `day-${item.temp_id}` && (
                          <DropdownList nestedScrollEnabled={true}>
                            {Array.from({length: 31}, (_, i) => i + 1).map(
                              (day, idx) => (
                                <DropdownItemContainer
                                  key={day}
                                  last={idx === 30}>
                                  <DropdownItem
                                    onPress={() => {
                                      setItemDetails(prev => ({
                                        ...prev,
                                        [item.temp_id]: {
                                          ...prev[item.temp_id],
                                          day: day.toString().padStart(2, '0'),
                                        },
                                      }));
                                      setOpenDropdown(null);
                                    }}>
                                    <Text>{day}일</Text>
                                  </DropdownItem>
                                </DropdownItemContainer>
                              ),
                            )}
                          </DropdownList>
                        )}
                      </DateDropdownContainer>

                      {/* 시간 선택 */}
                      <DateDropdownContainer zIndex={2}>
                        <Dropdown
                          onPress={() =>
                            setOpenDropdown(
                              openDropdown === `hour-${item.temp_id}`
                                ? null
                                : `hour-${item.temp_id}`,
                            )
                          }>
                          <DropdownText
                            placeholder={!itemDetails[item.temp_id]?.hour}>
                            {itemDetails[item.temp_id]?.hour
                              ? `${itemDetails[item.temp_id]?.hour}시`
                              : '시간 선택'}
                          </DropdownText>
                          <Icon
                            name={
                              openDropdown === `hour-${item.temp_id}`
                                ? 'keyboard-arrow-up'
                                : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#666"
                          />
                        </Dropdown>
                        {openDropdown === `hour-${item.temp_id}` && (
                          <DropdownList nestedScrollEnabled={true}>
                            {Array.from({length: 24}, (_, i) => i).map(
                              (hour, idx) => (
                                <DropdownItemContainer
                                  key={hour}
                                  last={idx === 23}>
                                  <DropdownItem
                                    onPress={() => {
                                      setItemDetails(prev => ({
                                        ...prev,
                                        [item.temp_id]: {
                                          ...prev[item.temp_id],
                                          hour: hour
                                            .toString()
                                            .padStart(2, '0'),
                                          minute: '00', // 분은 00으로 고정
                                        },
                                      }));
                                      setOpenDropdown(null);
                                    }}>
                                    <Text>{hour}시</Text>
                                  </DropdownItem>
                                </DropdownItemContainer>
                              ),
                            )}
                          </DropdownList>
                        )}
                      </DateDropdownContainer>
                    </ExpiryDateContainer>
                  </>
                )}
              </ItemContainer>
            ))}
          </ResultContainer>
        </ResultContentContainer>
      </ResultScrollContainer>

      <BottomButtonContainer>
        <ConfirmButton onPress={handleConfirm}>
          <ConfirmButtonText>선택한 품목 등록하기</ConfirmButtonText>
        </ConfirmButton>
      </BottomButtonContainer>
    </>
  );
};

export default RenderResultScreen;
