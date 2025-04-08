import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon5 from 'react-native-vector-icons/Fontisto';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LevelProgressBar from '../components/LevelProgressBar';
import EditProfileModal from '../components/EditProfileModal';

// 영양 제한 모달 컴포넌트를 내부에 정의
const NutritionLimitsModal = ({
  visible,
  onClose,
  nutritionLimits,
  onUpdate,
}) => {
  const [limits, setLimits] = useState({
    max_calories: '0',
    max_carbs: '0',
    max_protein: '0',
    max_fat: '0',
    max_sodium: '0',
  });

  // 모달이 열릴 때마다 현재 값으로 초기화
  useEffect(() => {
    if (visible && nutritionLimits) {
      console.log('모달 열림, 영양 제한 정보:', nutritionLimits);
      setLimits({
        max_calories: (nutritionLimits.max_calories || 0).toString(),
        max_carbs: (nutritionLimits.max_carbs || 0).toString(),
        max_protein: (nutritionLimits.max_protein || 0).toString(),
        max_fat: (nutritionLimits.max_fat || 0).toString(),
        max_sodium: (nutritionLimits.max_sodium || 0).toString(),
      });
    }
  }, [visible, nutritionLimits]);

  const handleSave = () => {
    // 문자열을 숫자로 변환 (입력값이 없으면 0으로 설정)
    const updatedLimits = {
      max_calories: parseInt(limits.max_calories) || 0,
      max_carbs: parseInt(limits.max_carbs) || 0,
      max_protein: parseInt(limits.max_protein) || 0,
      max_fat: parseInt(limits.max_fat) || 0,
      max_sodium: parseInt(limits.max_sodium) || 0,
    };

    console.log('업데이트할 영양 제한:', updatedLimits);
    onUpdate(updatedLimits);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>영양 제한 설정</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              <Text style={styles.description}>
                레시피 추천을 위한 일일 영양소 제한을 설정하세요. 0으로 설정하면
                제한 없음을 의미합니다.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>칼로리 제한 (kcal)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={limits.max_calories}
                  onChangeText={value =>
                    setLimits({...limits, max_calories: value})
                  }
                  placeholder="0"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>탄수화물 제한 (g)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={limits.max_carbs}
                  onChangeText={value =>
                    setLimits({...limits, max_carbs: value})
                  }
                  placeholder="0"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>단백질 제한 (g)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={limits.max_protein}
                  onChangeText={value =>
                    setLimits({...limits, max_protein: value})
                  }
                  placeholder="0"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>지방 제한 (g)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={limits.max_fat}
                  onChangeText={value => setLimits({...limits, max_fat: value})}
                  placeholder="0"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>나트륨 제한 (mg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={limits.max_sodium}
                  onChangeText={value =>
                    setLimits({...limits, max_sodium: value})
                  }
                  placeholder="0"
                />
              </View>

              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>💡 도움말</Text>
                <Text style={styles.tipText}>
                  • 칼로리: 일반적인 성인 권장량은 약 2,000~2,500kcal/일{'\n'}•
                  탄수화물: 일일 권장량은 약 130g 이상{'\n'}• 단백질: 체중 1kg당
                  약 0.8g (예: 70kg → 56g){'\n'}• 지방: 일일 권장량은 약 44~78g
                  {'\n'}• 나트륨: 일일 권장량은 2,300mg 이하
                </Text>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Container = styled.ScrollView`
  flex: 1;
  background-color: #f5f5f5;
`;

const ContentContainer = styled.View`
  padding: 10px;
`;

const ImageFrame = styled.View`
  align-items: center;
  justify-content: center;
  background-color: white;
  margin: 10px;
  border-radius: 15px;
  elevation: 3;
  padding: 20px;
`;

const StyledImage = styled.Image`
  width: 130px;
  height: 130px;
  border-radius: 65px;
  border-width: 3px;
  border-color: #ddd;
  margin-bottom: 10px;
`;

const ProfileName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const RoleText = styled.Text`
  font-size: 16px;
  color: gray;
`;

const IconContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 10px;
`;

const IconFrame = styled.TouchableOpacity`
  width: 30%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 15px;
  elevation: 2;
  padding: 10px;
`;

const IconText = styled.Text`
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
`;

// 영양 제한 섹션 관련 스타일
const NutritionContainer = styled.View`
  background-color: white;
  margin: 10px;
  border-radius: 15px;
  elevation: 3;
  padding: 15px;
  margin-bottom: 20px;
`;

const NutritionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const NutritionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const EditButton = styled.TouchableOpacity`
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
`;

const EditButtonText = styled.Text`
  color: #d9534f;
  font-weight: bold;
`;

const NutritionGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const NutritionItem = styled.View`
  width: 48%;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
`;

const NutritionLabel = styled.Text`
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
`;

const NutritionValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

// 모달 스타일
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    padding: 15,
    maxHeight: '70%',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  tipContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    width: '48%',
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#D9534F',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

const Profile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [nutritionModalVisible, setNutritionModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity
            onPress={() => setProfileModalVisible(true)}
            style={{marginRight: 15}}>
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLogout()}
            style={{marginRight: 15}}>
            <Icon2 name="logout" size={24} color="white" />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그인 화면으로 이동합니다.', [
      {text: '취소', style: 'cancel'},
      {
        text: '확인',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('accessToken');
            navigation.replace('Landing');
          } catch (error) {
            console.error('로그아웃 오류:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(
          'http://3.34.59.23/api/v1/permissions/check',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(response.data.trust_score);
        setTrustScore(response.data.trust_score);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.replace('Landing');
          return;
        }

        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {Authorization: `Bearer ${token}`},
        });

        setProfile(response.data);
        console.log('Fetched profile:', response.data);
      } catch (err) {
        console.error('프로필 가져오기 오류:', err);
        if (err.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          navigation.replace('Landing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  const handleProfileUpdate = updatedProfile => {
    setProfile(updatedProfile);
  };

  const handleNutritionUpdate = async updatedLimits => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.put(
        'http://3.34.59.23/api/v1/users/me/profile',
        {
          owned_ingredients: {
            additionalProp1: [],
            additionalProp2: [],
            additionalProp3: [],
          },
          nutrition_limits: updatedLimits,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 프로필 업데이트
      setProfile(prevProfile => ({
        ...prevProfile,
        nutrition_limits: updatedLimits,
      }));

      Alert.alert('성공', '영양 제한이 업데이트되었습니다.');
    } catch (error) {
      console.error('영양 제한 업데이트 오류:', error);
      Alert.alert('오류', '영양 제한 업데이트에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Container>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 100,
          }}>
          <Text>프로필을 불러오는 중...</Text>
        </View>
      </Container>
    );
  }

  // 프로필 이미지가 있는지 확인
  const hasProfileImage = profile && profile.profile_image_url;

  return (
    <Container>
      <ContentContainer>
        <EditProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />

        {/* 영양 제한 수정 모달 */}
        <NutritionLimitsModal
          visible={nutritionModalVisible}
          onClose={() => setNutritionModalVisible(false)}
          nutritionLimits={
            profile?.nutrition_limits || {
              max_calories: 0,
              max_carbs: 0,
              max_protein: 0,
              max_fat: 0,
              max_sodium: 0,
            }
          }
          onUpdate={handleNutritionUpdate}
        />

        <ImageFrame>
          {hasProfileImage ? (
            // 프로필 이미지가 있으면 해당 이미지 표시
            <StyledImage source={{uri: profile.profile_image_url}} />
          ) : (
            // 프로필 이미지가 없으면 기본 로고 표시
            <StyledImage source={require('../assets/testImage/chefLogo.png')} />
          )}
          <ProfileName>{profile?.nickname || '사용자'}</ProfileName>
          <RoleText>{profile?.role || '일반 사용자'}</RoleText>
          <LevelProgressBar trustScore={trustScore} />
        </ImageFrame>

        <IconContainer>
          <IconFrame onPress={() => navigation.navigate('MySales')}>
            <Icon2 name="sell" size={30} color="#D9534F" />
            <IconText>{'판매\n목록'}</IconText>
          </IconFrame>
          <IconFrame onPress={() => navigation.navigate('LikeRecipe')}>
            <Icon name="heart-sharp" size={30} color="#D9534F" />
            <IconText>{'좋아요한\n레시피'}</IconText>
          </IconFrame>
          <IconFrame onPress={() => navigation.navigate('MyRecipes')}>
            <Icon3 name="food-variant" size={30} color="#D9534F" />
            <IconText>{'내가 올린\n레시피'}</IconText>
          </IconFrame>
          <IconFrame onPress={() => navigation.navigate('RatingRecipes')}>
            <Icon3 name="star" size={30} color="#D9534F" />
            <IconText>{'평가한\n레시피'}</IconText>
          </IconFrame>
          <IconFrame onPress={() => navigation.navigate('MyIngredient')}>
            <Icon3 name="food-apple" size={30} color="#D9534F" />
            <IconText>{'나의\n식재료'}</IconText>
          </IconFrame>
          <IconFrame onPress={() => navigation.navigate('UploadIngredient')}>
            <Icon5 name="shopping-basket-add" size={30} color="#D9534F" />
            <IconText>{'식재료\n등록'}</IconText>
          </IconFrame>
        </IconContainer>

        {/* 영양 제한 설정 섹션 - IconContainer 아래에 배치 */}
        <NutritionContainer>
          <NutritionHeader>
            <NutritionTitle>영양 제한 설정</NutritionTitle>
            <EditButton
              onPress={() => {
                console.log('영양 제한 설정 수정 버튼 클릭');
                setNutritionModalVisible(true);
              }}
              activeOpacity={0.7}>
              <EditButtonText>수정</EditButtonText>
            </EditButton>
          </NutritionHeader>

          <NutritionGrid>
            <NutritionItem>
              <NutritionLabel>칼로리</NutritionLabel>
              <NutritionValue>
                {profile?.nutrition_limits?.max_calories > 0
                  ? `${profile.nutrition_limits.max_calories} kcal`
                  : '설정 안됨'}
              </NutritionValue>
            </NutritionItem>

            <NutritionItem>
              <NutritionLabel>탄수화물</NutritionLabel>
              <NutritionValue>
                {profile?.nutrition_limits?.max_carbs > 0
                  ? `${profile.nutrition_limits.max_carbs} g`
                  : '설정 안됨'}
              </NutritionValue>
            </NutritionItem>

            <NutritionItem>
              <NutritionLabel>단백질</NutritionLabel>
              <NutritionValue>
                {profile?.nutrition_limits?.max_protein > 0
                  ? `${profile.nutrition_limits.max_protein} g`
                  : '설정 안됨'}
              </NutritionValue>
            </NutritionItem>

            <NutritionItem>
              <NutritionLabel>지방</NutritionLabel>
              <NutritionValue>
                {profile?.nutrition_limits?.max_fat > 0
                  ? `${profile.nutrition_limits.max_fat} g`
                  : '설정 안됨'}
              </NutritionValue>
            </NutritionItem>

            <NutritionItem style={{width: '100%'}}>
              <NutritionLabel>나트륨</NutritionLabel>
              <NutritionValue>
                {profile?.nutrition_limits?.max_sodium > 0
                  ? `${profile.nutrition_limits.max_sodium} mg`
                  : '설정 안됨'}
              </NutritionValue>
            </NutritionItem>
          </NutritionGrid>
        </NutritionContainer>
      </ContentContainer>
    </Container>
  );
};

export default Profile;
