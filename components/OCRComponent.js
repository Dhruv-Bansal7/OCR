// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, PermissionsAndroid, Platform, View, Text, ToastAndroid } from "react-native";
// import RNTesseractOcr, { LANG_ENGLISH } from 'react-native-tesseract-ocr';
// import RNFS from 'react-native-fs';

// const OCRComponent = ({ imagePath, onExtractedText }) => {
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [error, setError] = useState(null);
//     const [downloadProgress, setDownloadProgress] = useState(0);
//     const [isDownloading, setIsDownloading] = useState(false);

//     const TESSDATA_URL = 'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata';

//         const requestPermission = async() => {
//             if(Platform.OS === 'android') {
//                 try {
//                     if (Platform.Version >= 33) {
//                         const granted = await PermissionsAndroid.request(
//                         PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//                         );
//                         const wgranted = await PermissionsAndroid.request(
//                             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//                             {
//                               title: 'Storage Permission Required',
//                               message: 'App needs access to your storage to process images',
//                               buttonNeutral: 'Ask Me Later',
//                               buttonNegative: 'Cancel',
//                               buttonPositive: 'OK'
//                             }
//                           );
//                           console.log("Wgranted : " , wgranted)
//                         return granted === PermissionsAndroid.RESULTS.GRANTED && wgranted === PermissionsAndroid.RESULTS.GRANTED;
//                     } else if (Platform.Version >= 29) {
//                         // For Android 10 to Android 12 (API level 29 to 32)
//                         const granted = await PermissionsAndroid.request(
//                             PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
//                         );
//                         return granted === PermissionsAndroid.RESULTS.GRANTED;
//                     } else {
//                         const granted = await PermissionsAndroid.requestMultiple([
//                         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//                         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//                         ]);
//                         return Object.values(granted).every(
//                         permission => permission === PermissionsAndroid.RESULTS.GRANTED
//                         );
//                     }
//                 }
//                 catch (err) {
//                     // setError(err)
//                     console.log('Permission request error : ', err);
//                     return false;
//                 }
//             }
//             return true;
//         };

//     const logAndShowError = (message, error) => {
//         const errorMessage = `${message}: ${error.message || error}`;
//         console.error(errorMessage);
//         ToastAndroid.show(errorMessage, ToastAndroid.LONG);
//         setError(errorMessage);
//     };

//     const downloadTrainedData = async (destination) => {
//         try {
//             setIsDownloading(true);
//             setDownloadProgress(0);

//             // Log the destination path
//             console.log('Downloading to:', destination);

//             // Ensure the parent directory exists
//             const parentDir = destination.substring(0, destination.lastIndexOf('/'));
//             const parentExists = await RNFS.exists(parentDir);
            
//             if (!parentExists) {
//                 console.log('Creating parent directory:', parentDir);
//                 await RNFS.mkdir(parentDir);
//             }

//             const response = await RNFS.downloadFile({
//                 fromUrl: TESSDATA_URL,
//                 toFile: destination,
//                 progress: (res) => {
//                     const progress = (res.bytesWritten / res.contentLength) * 100;
//                     setDownloadProgress(progress);
//                 }
//             }).promise;

//             console.log('Download response:', response);

//             if (response.statusCode !== 200) {
//                 throw new Error(`Download failed with status: ${response.statusCode}`);
//             }

//             return true;
//         } catch (error) {
//             logAndShowError('Download error', error);
//             throw error;
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     const setupTessData = async () => {
//         try {
//             // Use the app's private directory
//             const tessDataPath = `${RNFS.DocumentDirectoryPath}/tessdata`;
//             const trainedDataPath = `${tessDataPath}/eng.traineddata`;

//             console.log('Setting up tessdata at:', tessDataPath);

//             // Check if the file already exists
//             const fileExists = await RNFS.exists(trainedDataPath);
//             console.log('Trained data file exists:', fileExists);

//             if (!fileExists) {
//                 // Create directory if it doesn't exist
//                 const dirExists = await RNFS.exists(tessDataPath);
//                 if (!dirExists) {
//                     console.log('Creating tessdata directory');
//                     await RNFS.mkdir(tessDataPath);
//                 }

//                 // Download the trained data file
//                 await downloadTrainedData(trainedDataPath);
//             }

//             return tessDataPath;
//         } catch (error) {
//             logAndShowError('Setup error', error);
//             throw error;
//         }
//     };

//     const performOCR = async () => {


//         if (!imagePath) {
//             logAndShowError('Invalid input', new Error('No image path provided'));
//             return;
//         }

//         try {
//             setIsProcessing(true);
//             setError(null);


//             const hasPermission = await requestPermission();
//             console.log(hasPermission)
//             if(!hasPermission) {
//                 throw new Error('Storage Permission are reuquired for OCR');
//             }

//             console.log('Starting OCR process for image:', imagePath);

//             // Setup tessdata directory
//             const tessDataPath = await setupTessData();
//             console.log('Tessdata setup complete at:', tessDataPath);

//             // Verify that both the image and trained data exist
//             const [imageExists, tessDataExists] = await Promise.all([
//                 RNFS.exists(imagePath),
//                 RNFS.exists(`${tessDataPath}/eng.traineddata`)
//             ]);

//             console.log('Image exists:', imageExists);
//             console.log('Trained data exists:', tessDataExists);

//             if (!imageExists) {
//                 throw new Error('Image file not found');
//             }

//             if (!tessDataExists) {
//                 throw new Error('Trained data file not found');
//             }

//             // Perform OCR
//             const result = await RNTesseractOcr.recognize(imagePath,
//                 LANG_ENGLISH, 
//                 {
//                 whitelist: null,
//                 blacklist: null
//             });

//             console.log('OCR completed successfully');
//             onExtractedText(result || '');

//         } catch (error) {
//             logAndShowError('OCR process error', error);
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     useEffect(() => {
//         if (imagePath) {
//             performOCR();
//         }
//     }, [imagePath]);

//     return (
//         <View style={{ padding: 16 }}>
//             {error && (
//                 <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
//             )}
//             {isDownloading && (
//                 <View>
//                     <Text>Downloading trained data... {downloadProgress.toFixed(1)}%</Text>
//                     <View style={{ height: 2, backgroundColor: '#eee', marginTop: 8 }}>
//                         <View 
//                             style={{ 
//                                 height: '100%', 
//                                 backgroundColor: '#007AFF', 
//                                 width: `${downloadProgress}%` 
//                             }} 
//                         />
//                     </View>
//                 </View>
//             )}
//             {isProcessing && !isDownloading && (
//                 <>
//                     <ActivityIndicator size="large" color="#0000ff" />
//                     <Text style={{ marginTop: 8 }}>Processing Image...</Text>
//                 </>
//             )}
//         </View>
//     );
// };

// export default OCRComponent;

import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  PermissionsAndroid, 
  Platform, 
  View, 
  Text, 
  ToastAndroid,
  Alert,
  Linking,
  Button,
  StyleSheet 
} from "react-native";
import RNTesseractOcr, { LANG_ENGLISH } from 'react-native-tesseract-ocr';
import RNFS from 'react-native-fs';

const OCRComponent = ({ imagePath, onExtractedText }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(null);

    const TESSDATA_URL = 'https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata';

    const openAppSettings = async () => {
        try {
            await Linking.openSettings();
            ToastAndroid.show('Please enable storage permission and come back', ToastAndroid.LONG);
        } catch (error) {
            console.error('Error opening settings:', error);
        }
    };
    const checkPermissionStatus = async () => {
        try {
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            console.log("Current permission status:", result);
            return result;
        } catch (error) {
            console.error("Error checking permission:", error);
            return false;
        }
    };
    const requestPermission = async () => {
        try {
            const currentStatus = await checkPermissionStatus();
            
            if (currentStatus) {
                setPermissionStatus('granted');
                return true;
            }

            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Storage Permission Required",
                    message: "This app needs storage access to process images for OCR",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );

            console.log("Permission request result:", result);
            setPermissionStatus(result);

            if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                Alert.alert(
                    'Storage Permission Required',
                    'Please follow these steps:\n\n' +
                    '1. Press "Open Settings" below\n' +
                    '2. Tap Permissions\n' +
                    '3. Enable Storage permission\n' +
                    '4. Return to the app and try again',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: openAppSettings }
                    ]
                );
                return false;
            }

            return result === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.error("Permission request error:", error);
            return false;
        }
    };

    const downloadTrainedData = async (destination) => {
        try {
            console.log("Starting download to:", destination);
            setIsDownloading(true);
            setDownloadProgress(0);

            const parentDir = destination.substring(0, destination.lastIndexOf('/'));
            await RNFS.mkdir(parentDir);

            const response = await RNFS.downloadFile({
                fromUrl: TESSDATA_URL,
                toFile: destination,
                progress: (res) => {
                    const progress = (res.bytesWritten / res.contentLength) * 100;
                    setDownloadProgress(progress);
                }
            }).promise;

            console.log("Download response:", response);
            if (response.statusCode === 200) {
                return true;
            } else {
                throw new Error('Download failed with status: ' + response.statusCode);
            }
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        } finally {
            setIsDownloading(false);
        }
    };

    const setupTessData = async () => {
        try {
            const tessDataPath = `${RNFS.ExternalDirectoryPath}/tessdata`;
            const trainedDataPath = `${tessDataPath}/eng.traineddata`;

            console.log("Checking trained data at:", trainedDataPath);
            const fileExists = await RNFS.exists(trainedDataPath);
            console.log("Trained data exists:", fileExists);

            if (!fileExists) {
                await downloadTrainedData(trainedDataPath);
            }

            return tessDataPath;
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    };

    const performOCR = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            // Check for existing permission first
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                throw new Error('Storage permission is required for OCR');
            }

            console.log("Starting OCR for image:", imagePath);
            const tessDataPath = await setupTessData();
            console.log("TessData path:", tessDataPath);

            const result = await RNTesseractOcr.recognize(
                imagePath,
                LANG_ENGLISH,
                {
                    whitelist: null,
                    blacklist: null
                }
            );

            console.log("OCR result:", result ? "Text extracted" : "No text found");
            onExtractedText(result || '');

        } catch (error) {
            console.error("OCR error:", error);
            setError(error.message);
            ToastAndroid.show(error.message, ToastAndroid.LONG);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (imagePath) {
            performOCR();
        }
    }, [imagePath]);

    // Render permission status for debugging
    const renderPermissionStatus = () => {
        if (!permissionStatus) return null;
        
        return (
            <Text style={{ color: 'blue', marginBottom: 10 }}>
                Permission Status: {permissionStatus}
            </Text>
        );
    };

    return (
        <View style={{ padding: 16 }}>
            {renderPermissionStatus()}
            
            {error && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
                    <Button
                        title="Retry with Permissions"
                        onPress={performOCR}
                    />
                </View>
            )}
            
            {isDownloading && (
                <View>
                    <Text>Downloading trained data... {downloadProgress.toFixed(1)}%</Text>
                    <View style={{ height: 2, backgroundColor: '#eee', marginTop: 8 }}>
                        <View 
                            style={{ 
                                height: '100%', 
                                backgroundColor: '#007AFF', 
                                width: `${downloadProgress}%` 
                            }} 
                        />
                    </View>
                </View>
            )}
            
            {isProcessing && !isDownloading && (
                <View>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={{ marginTop: 8 }}>Processing Image...</Text>
                </View>
            )}
        </View>
    );
};

export default OCRComponent;