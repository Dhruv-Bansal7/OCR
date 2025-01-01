import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet , Text, Alert } from 'react-native';
import { Camera , useCameraDevices } from 'react-native-vision-camera';

const CameraComponent = ({ onPhotoTaken }) => {
  const [camera, setCamera] = useState(null);
  const [hasPermission,setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find(dev => dev.position === 'back');

  useEffect(() => {
    const requestPermission = async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
        if(status !== 'granted') {
            Alert.alert('Permission Denied' , 'Camera access is required to take photos.')
        }
    };
    requestPermission();
  } , []);

  const takePhoto = async () => {
    if (camera) {
        try {
          const photo = await camera.takePhoto();
          console.log('Photo taken:', photo); // Log photo data
          onPhotoTaken(photo.path); // Pass photo path to parent
        } catch (error) {
          console.error('Error taking photo:', error);
        }
      } else {
        console.log('Camera not available');
      }
  };

  if (!device) return <Text>No Camera Device Available</Text>;

  return (
    <View style={styles.container}>
        <Camera
            device={device}
            ref={setCamera}
            style={StyleSheet.absoluteFillObject}
            isActive={true}
            photo={true}
        />
        <Button title="Take Photo" onPress={takePhoto} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent : 'flex-end',
    },
});
  
export default CameraComponent;