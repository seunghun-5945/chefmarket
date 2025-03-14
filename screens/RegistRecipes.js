import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const Container = styled.View`
  flex: 1;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: 20px;
  margin-bottom: ${props => (props.keyboardOpen ? '0px' : '80px')};
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const InputField = styled.TextInput`
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 10px;
`;

const DropdownField = styled.TouchableOpacity`
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 0 10px;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DropdownText = styled.Text`
  font-size: 16px;
  color: ${props => (props.placeholder ? '#999' : '#000')};
`;

const DropdownModal = styled.Modal`
  background-color: rgba(0, 0, 0, 0.5);
`;

const DropdownContainer = styled.View`
  margin: 20px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const DropdownItem = styled.TouchableOpacity`
  padding: 15px;
  border-bottom-width: ${props => (props.isLast ? '0' : '1px')};
  border-bottom-color: #eee;
`;

const DropdownItemText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const ImagePickerButton = styled.TouchableOpacity`
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  background-color: #f0f0f0;
`;

const ImagePreview = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const RegistButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const RegistButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 5px;
  background-color: #ff6b6b;
`;

const RegistText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const AddInstructionButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
`;

const InstructionContainer = styled.View`
  margin-bottom: 20px;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 8px;
`;

const IngredientsSection = styled.View`
  margin-bottom: 20px;
`;

const IngredientRow = styled.View`
  flex-direction: row;
  margin-bottom: 10px;
`;

const IngredientInput = styled.TextInput`
  flex: 1;
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  padding: 0 10px;
  margin-right: 5px;
`;

const AmountInput = styled.TextInput`
  width: 80px;
  height: 40px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 8px;
  padding: 0 10px;
`;

const AddIngredientButton = styled.TouchableOpacity`
  background-color: #2196f3;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const LoadingContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  padding: 10px 10px 10px 0px;
`;

const StyledButton = styled.TouchableOpacity`
  flex-direction: row;
  border-radius: 5px;
  margin-right: 10px;
  align-items: center;
  border: 1px solid lightgray;
  padding: 10px;
  gap: 5px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const ImageContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 0px;
  flex-wrap: wrap;
`;

const SelectedImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  margin-right: 10px;
`;

const RegistRecipes = ({navigation}) => {
  const [recipe, setRecipe] = useState({
    name: '',
    category: '',
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    sodium: 0,
    image_small: '',
    image_large: '',
    ingredients: {},
    instructions: [],
    cooking_img: [],
  });

  const [ingredients, setIngredients] = useState([{name: '', amount: 0}]);
  const [loading, setLoading] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [instructionImages, setInstructionImages] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // 카테고리 옵션 정의
  const categoryOptions = ['국&찌개', '반찬', '일품', '후식'];

  const handleInputChange = (field, value) => {
    setRecipe(prevState => ({
      ...prevState,
      [field]: field.match(/calories|carbs|protein|fat|sodium/)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleCategorySelect = category => {
    setRecipe(prevState => ({
      ...prevState,
      category,
    }));
    setShowCategoryDropdown(false);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] =
      field === 'amount' ? Number(value) || 0 : value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {name: '', amount: 0}]);
  };

  // 갤러리 권한 요청
  const checkGalleryPermission = async (type, instructionIndex = null) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'ChefMarket 권한 요청',
            message: '사진 선택을 위해 갤러리 접근 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openGallery(type, instructionIndex);
        } else {
          Alert.alert('갤러리 접근 권한이 필요합니다.');
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('권한 요청 중 오류가 발생했습니다.');
      }
    } else {
      openGallery(type, instructionIndex);
    }
  };

  // 카메라 권한 요청
  const checkCameraPermission = async (type, instructionIndex = null) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'ChefMarket 카메라 권한 요청',
            message: '사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera(type, instructionIndex);
        } else {
          Alert.alert('카메라 접근 권한이 필요합니다.');
        }
      } catch (err) {
        console.warn(err);
        Alert.alert('권한 요청 중 오류가 발생했습니다.');
      }
    } else {
      openCamera(type, instructionIndex);
    }
  };

  // 갤러리 열기
  const openGallery = (type, instructionIndex = null) => {
    const options = {
      mediaType: 'photo',
      quality: 1.0,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) return;

      if (response.errorMessage) {
        Alert.alert(
          '이미지 선택 중 오류가 발생했습니다: ' + response.errorMessage,
        );
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];

        if (type === 'main') {
          setMainImage(selectedImage);
          setRecipe(prevState => ({
            ...prevState,
            image_large: selectedImage.uri,
            image_small: selectedImage.uri,
          }));
        } else if (instructionIndex !== null) {
          handleInstructionImageChange(instructionIndex, selectedImage);
        }
      }
    });
  };

  // 카메라 열기
  const openCamera = (type, instructionIndex = null) => {
    const options = {
      mediaType: 'photo',
      quality: 1.0,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    ImagePicker.launchCamera(options, response => {
      if (response.didCancel) return;

      if (response.errorMessage) {
        Alert.alert('카메라 오류: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];

        if (type === 'main') {
          setMainImage(selectedImage);
          setRecipe(prevState => ({
            ...prevState,
            image_large: selectedImage.uri,
            image_small: selectedImage.uri,
          }));
        } else if (instructionIndex !== null) {
          handleInstructionImageChange(instructionIndex, selectedImage);
        }
      }
    });
  };

  const handleInstructionImageChange = (index, imageData) => {
    // 이미지 데이터 저장
    const newInstructionImages = [...instructionImages];
    newInstructionImages[index] = imageData;
    setInstructionImages(newInstructionImages);

    // 레시피 instructions 업데이트
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index].image = imageData.uri;
    setRecipe(prevState => ({
      ...prevState,
      instructions: updatedInstructions,
    }));
  };

  const addInstruction = () => {
    setRecipe(prevState => ({
      ...prevState,
      instructions: [...prevState.instructions, {image: '', description: ''}],
    }));
    setInstructionImages([...instructionImages, null]);
  };

  const handleInstructionChange = (index, field, value) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index][field] = value;
    setRecipe(prevState => ({
      ...prevState,
      instructions: updatedInstructions,
    }));
  };

  const handleSubmit = async () => {
    // 필수 입력값 검증
    if (!recipe.name.trim()) {
      Alert.alert('알림', '레시피 이름을 입력해주세요.');
      return;
    }

    if (!recipe.category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    if (!mainImage) {
      Alert.alert('알림', '대표 이미지를 등록해주세요.');
      return;
    }

    // 재료 검증
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      Alert.alert('알림', '최소 하나 이상의 재료를 입력해주세요.');
      return;
    }

    // 조리법 검증
    if (recipe.instructions.length === 0) {
      Alert.alert('알림', '최소 하나 이상의 조리 순서를 추가해주세요.');
      return;
    }

    // 유효한 조리법만 필터링
    const validInstructions = recipe.instructions.filter(
      inst => inst.description.trim() !== '',
    );
    if (validInstructions.length === 0) {
      Alert.alert('알림', '최소 하나 이상의 조리 설명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // accessToken 가져오기 (다른 페이지에서 사용한 방식 동일하게 적용)
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('알림', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 재료 객체 형태로 변환
      const ingredientsObj = {};
      validIngredients.forEach(ing => {
        if (ing.name.trim()) {
          ingredientsObj[ing.name] = ing.amount;
        }
      });

      // FormData 생성
      const formData = new FormData();

      // 기본 정보 추가
      formData.append('name', recipe.name);
      formData.append('category', recipe.category);
      formData.append('calories', recipe.calories);
      formData.append('carbs', recipe.carbs);
      formData.append('protein', recipe.protein);
      formData.append('fat', recipe.fat);
      formData.append('sodium', recipe.sodium);
      formData.append('ingredients', JSON.stringify(ingredientsObj));
      formData.append(
        'instructions',
        JSON.stringify(validInstructions.map(inst => inst.description)),
      );

      // 대표 이미지 추가 (첫 번째 파일)
      if (mainImage) {
        const mainImageFile = {
          uri: mainImage.uri,
          type: mainImage.type || 'image/jpeg',
          name: mainImage.fileName || 'main_image.jpg',
        };
        formData.append('files', mainImageFile);
      }

      // 조리 과정 이미지 추가 (두 번째 이미지부터)
      instructionImages.forEach((img, index) => {
        if (img) {
          const instructionImageFile = {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `instruction_${index}.jpg`,
          };
          formData.append('files', instructionImageFile);
        }
      });

      console.log('Form data to be sent:', formData);
      console.log(
        'Using token (first 10 chars):',
        token.substring(0, 10) + '...',
      );

      // API 호출 (다른 페이지에서 사용한 인증 방식과 동일하게 사용)
      const response = await axios.post(
        'http://3.34.59.23/api/v1/recipes/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert('성공', '레시피가 성공적으로 등록되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', '레시피 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);

      // 오류 응답 상세 로깅
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        if (error.response.status === 401) {
          Alert.alert(
            '인증 오류',
            '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
            [
              {
                text: '확인',
                onPress: () => {
                  // 로그인 화면으로 이동 (필요한 경우 수정)
                  // navigation.navigate('Login');
                },
              },
            ],
          );
        } else {
          Alert.alert(
            '오류',
            `레시피 등록 중 오류가 발생했습니다: ${
              error.response?.data?.message ||
              error.response?.data?.error ||
              '서버 응답 오류'
            }`,
          );
        }
      } else if (error.request) {
        Alert.alert(
          '서버 연결 오류',
          '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
        );
      } else {
        Alert.alert(
          '오류',
          `요청 설정 중 오류가 발생했습니다: ${error.message}`,
        );
      }
    } finally {
      setLoading(false);
    }
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
            showsVerticalScrollIndicator={true}
            bounces={true}>
            <HeaderTitle>레시피 등록</HeaderTitle>

            <SectionTitle>레시피 이름</SectionTitle>
            <InputField
              placeholder="레시피 이름"
              value={recipe.name}
              onChangeText={text => handleInputChange('name', text)}
            />

            <SectionTitle>카테고리 분류</SectionTitle>
            <DropdownField onPress={() => setShowCategoryDropdown(true)}>
              <DropdownText placeholder={!recipe.category}>
                {recipe.category || '카테고리 선택'}
              </DropdownText>
              <Icon name="arrow-drop-down" size={24} color="#999" />
            </DropdownField>

            <Modal
              visible={showCategoryDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowCategoryDropdown(false)}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
                activeOpacity={1}
                onPress={() => setShowCategoryDropdown(false)}>
                <DropdownContainer>
                  {categoryOptions.map((category, index) => (
                    <DropdownItem
                      key={category}
                      onPress={() => handleCategorySelect(category)}
                      isLast={index === categoryOptions.length - 1}>
                      <DropdownItemText>{category}</DropdownItemText>
                    </DropdownItem>
                  ))}
                </DropdownContainer>
              </TouchableOpacity>
            </Modal>

            <SectionTitle>칼로리 (kcal)</SectionTitle>
            <InputField
              placeholder="칼로리"
              keyboardType="numeric"
              value={String(recipe.calories)}
              onChangeText={text => handleInputChange('calories', text)}
            />

            <SectionTitle>탄수화물 (g)</SectionTitle>
            <InputField
              placeholder="탄수화물"
              keyboardType="numeric"
              value={String(recipe.carbs)}
              onChangeText={text => handleInputChange('carbs', text)}
            />

            <SectionTitle>단백질 (g)</SectionTitle>
            <InputField
              placeholder="단백질"
              keyboardType="numeric"
              value={String(recipe.protein)}
              onChangeText={text => handleInputChange('protein', text)}
            />

            <SectionTitle>지방 (g)</SectionTitle>
            <InputField
              placeholder="지방"
              keyboardType="numeric"
              value={String(recipe.fat)}
              onChangeText={text => handleInputChange('fat', text)}
            />

            <SectionTitle>나트륨 (mg)</SectionTitle>
            <InputField
              placeholder="나트륨"
              keyboardType="numeric"
              value={String(recipe.sodium)}
              onChangeText={text => handleInputChange('sodium', text)}
            />

            <SectionTitle>대표 이미지</SectionTitle>

            <ButtonContainer>
              <StyledButton onPress={() => checkCameraPermission('main')}>
                <Icon name="add-photo-alternate" size={30} color="gray" />
                <ButtonText>카메라</ButtonText>
              </StyledButton>
              <StyledButton onPress={() => checkGalleryPermission('main')}>
                <Icon name="add-a-photo" size={30} color="gray" />
                <ButtonText>갤러리</ButtonText>
              </StyledButton>
            </ButtonContainer>

            {mainImage && (
              <ImagePreview source={{uri: mainImage.uri}} resizeMode="cover" />
            )}

            <SectionTitle>재료</SectionTitle>
            <IngredientsSection>
              {ingredients.map((ingredient, index) => (
                <IngredientRow key={index}>
                  <IngredientInput
                    placeholder="재료명"
                    value={ingredient.name}
                    onChangeText={text =>
                      handleIngredientChange(index, 'name', text)
                    }
                  />
                  <AmountInput
                    placeholder="수량"
                    keyboardType="numeric"
                    value={String(ingredient.amount)}
                    onChangeText={text =>
                      handleIngredientChange(index, 'amount', text)
                    }
                  />
                </IngredientRow>
              ))}
              <AddIngredientButton onPress={addIngredient}>
                <Text style={{color: '#fff'}}>+ 재료 추가</Text>
              </AddIngredientButton>
            </IngredientsSection>

            <SectionTitle>조리법</SectionTitle>
            {recipe.instructions.map((instruction, index) => (
              <InstructionContainer key={index}>
                <Text style={{fontWeight: 'bold'}}>조리 순서 {index + 1}</Text>
                <ButtonContainer>
                  <StyledButton
                    onPress={() => checkCameraPermission('instruction', index)}>
                    <Icon name="add-photo-alternate" size={30} color="gray" />
                    <ButtonText>카메라</ButtonText>
                  </StyledButton>
                  <StyledButton
                    onPress={() =>
                      checkGalleryPermission('instruction', index)
                    }>
                    <Icon name="add-a-photo" size={30} color="gray" />
                    <ButtonText>갤러리</ButtonText>
                  </StyledButton>
                </ButtonContainer>

                {instructionImages[index] && (
                  <ImagePreview
                    source={{uri: instructionImages[index].uri}}
                    resizeMode="cover"
                  />
                )}

                <InputField
                  placeholder="조리 설명"
                  multiline={true}
                  numberOfLines={3}
                  style={{height: 80, textAlignVertical: 'top'}}
                  value={instruction.description}
                  onChangeText={text =>
                    handleInstructionChange(index, 'description', text)
                  }
                />
              </InstructionContainer>
            ))}

            <AddInstructionButton onPress={addInstruction}>
              <Text style={{color: '#fff'}}>+ 조리 순서 추가</Text>
            </AddInstructionButton>

            {/* 하단 여백 추가 */}
            <View style={{height: 40}} />
          </ContentContainer>

          <RegistButtonContainer>
            <RegistButton onPress={handleSubmit} disabled={loading}>
              <RegistText>{loading ? '등록 중...' : '등록하기'}</RegistText>
            </RegistButton>
          </RegistButtonContainer>

          {loading && (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#ff6b6b" />
            </LoadingContainer>
          )}
        </Container>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

export default RegistRecipes;
