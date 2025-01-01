import { View , Text , StyleSheet , SafeAreaView , TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import Camera from './components/CameraComponent.js';
// import OCRComponent from './components/OCRComponent.js';
import OCRComponent from './components/OCRComponent.js';

export default function App() {
  const [photoPath , setPhotoPath] = useState(null);
  const [extractedText , setExtractedText] = useState('');

  const handlePhotoTaken = (path) => {
    console.log('Photo Recieved' , path);
    setPhotoPath(path);
  }

  const handleRetake = () => {
    setPhotoPath(null);
    setExtractedText('');
  }

  return(
    <SafeAreaView style={styles.container}>
      {!photoPath ? (
        <Camera onPhotoTaken={handlePhotoTaken} />
      ) : (
        <View style={styles.container}>
          <OCRComponent 
            imagePath={photoPath}
            onExtractedText={setExtractedText}
          />
          {extractedText ? (
            <View style={styles.textContainer}>
              <Text style={styles.label}>Extracted Text:</Text>
              <Text style={styles.extractedText}>{extractedText}</Text>
            </View>
          ) : null}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRetake}
            ><Text>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
    // <View style={styles.container}>
    //   <Camera onPhotoTaken={handlePhotoTaken} />
    // </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
});