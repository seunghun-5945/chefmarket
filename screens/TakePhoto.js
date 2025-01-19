import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const TakePhoto = () => {
  const [imageUri, setImageUri] = useState(null);

  const pickImageFromLibrary = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const captureImageWithCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else if (response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image from Library" onPress={pickImageFromLibrary} />
      <Button title="Take a Photo with Camera" onPress={captureImageWithCamera} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {!imageUri && <Text>No image selected</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default TakePhoto;
