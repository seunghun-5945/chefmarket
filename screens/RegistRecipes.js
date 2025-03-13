import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
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
  padding: 0 10px;
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

const SubmitButton = styled.Button`
  background-color: #ff6b6b;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
`;

const AddInstructionButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;

const InstructionContainer = styled.View`
  margin-bottom: 20px;
`;

const RegistRecipes = () => {
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
    instructions: [{image: '', description: ''}],
    cooking_img: [''],
  });

  const handleInputChange = (field, value) => {
    setRecipe(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // 레시피 등록 API 호출 또는 처리 로직
    console.log('레시피 등록:', recipe);
  };

  const handleImagePick = type => {
    // 이미지 선택 로직 구현 (예: Image Picker)
    // 선택된 이미지 URL을 해당 타입에 맞게 state에 저장
    if (type === 'small') {
      setRecipe(prevState => ({
        ...prevState,
        image_small: 'https://example.com/image-small.jpg',
      }));
    } else if (type === 'large') {
      setRecipe(prevState => ({
        ...prevState,
        image_large: 'https://example.com/image-large.jpg',
      }));
    }
  };

  const addInstruction = () => {
    setRecipe(prevState => ({
      ...prevState,
      instructions: [...prevState.instructions, {image: '', description: ''}],
    }));
  };

  const handleInstructionChange = (index, field, value) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index][field] = value;
    setRecipe(prevState => ({
      ...prevState,
      instructions: updatedInstructions,
    }));
  };

  return (
    <ScrollView style={{flex: 1}}>
      <Container>
        <HeaderTitle>레시피 등록</HeaderTitle>

        <Text>레시피 이름</Text>
        <InputField
          placeholder="레시피 이름"
          value={recipe.name}
          onChangeText={text => handleInputChange('name', text)}
        />

        <Text>카테고리 분류</Text>
        <InputField
          placeholder="카테고리"
          value={recipe.category}
          onChangeText={text => handleInputChange('category', text)}
        />

        <Text>칼로리</Text>
        <InputField
          placeholder="칼로리"
          keyboardType="numeric"
          value={String(recipe.calories)}
          onChangeText={text => handleInputChange('calories', text)}
        />

        <Text>탄수화물</Text>
        <InputField
          placeholder="탄수화물"
          keyboardType="numeric"
          value={String(recipe.carbs)}
          onChangeText={text => handleInputChange('carbs', text)}
        />

        <Text>단백질</Text>
        <InputField
          placeholder="단백질"
          keyboardType="numeric"
          value={String(recipe.protein)}
          onChangeText={text => handleInputChange('protein', text)}
        />

        <Text>지방</Text>
        <InputField
          placeholder="지방"
          keyboardType="numeric"
          value={String(recipe.fat)}
          onChangeText={text => handleInputChange('fat', text)}
        />

        <Text>나트륨</Text>
        <InputField
          placeholder="나트륨"
          keyboardType="numeric"
          value={String(recipe.sodium)}
          onChangeText={text => handleInputChange('sodium', text)}
        />

        <ImagePickerButton onPress={() => handleImagePick('small')}>
          <Text>대표 이미지 (작은 이미지)</Text>
        </ImagePickerButton>
        {recipe.image_small && (
          <ImagePreview source={{uri: recipe.image_small}} />
        )}

        <ImagePickerButton onPress={() => handleImagePick('large')}>
          <Text>대표 이미지 (큰 이미지)</Text>
        </ImagePickerButton>
        {recipe.image_large && (
          <ImagePreview source={{uri: recipe.image_large}} />
        )}

        <Text>조리법</Text>
        {recipe.instructions.map((instruction, index) => (
          <InstructionContainer key={index}>
            <Text>조리 순서 {index + 1}</Text>
            <ImagePickerButton
              onPress={() => {
                const updatedInstructions = [...recipe.instructions];
                updatedInstructions[index].image =
                  'https://example.com/image.jpg';
                setRecipe(prevState => ({
                  ...prevState,
                  instructions: updatedInstructions,
                }));
              }}>
              <Text>이미지 선택</Text>
            </ImagePickerButton>
            {instruction.image && (
              <ImagePreview source={{uri: instruction.image}} />
            )}
            <TextInput
              placeholder="조리 설명"
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

        <SubmitButton title="레시피 등록" onPress={handleSubmit} />
      </Container>
    </ScrollView>
  );
};

export default RegistRecipes;
