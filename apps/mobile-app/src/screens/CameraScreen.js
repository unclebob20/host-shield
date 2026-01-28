import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform, BackHandler, SafeAreaView } from 'react-native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_URL } from '../config';
import * as SecureStore from 'expo-secure-store';

export default function CameraScreen({ onLogout }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [guestData, setGuestData] = useState(null);
    const [mode, setMode] = useState('menu');

    const [datePicker, setDatePicker] = useState({ visible: false, field: null });

    const cameraRef = useRef(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        const backAction = () => {
            if (mode !== 'menu' || guestData) {
                setMode('menu');
                setGuestData(null);
                setPhoto(null);
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [mode, guestData]);

    const takePicture = async () => {
        if (cameraRef.current && !isProcessing.current) {
            isProcessing.current = true;
            try {
                // 1. Take full picture
                const photoData = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: true
                });

                // Resize to balanced width (1280) - Good detail, stable performance
                let finalPhoto = photoData;
                try {
                    finalPhoto = await manipulateAsync(
                        photoData.uri,
                        [{ resize: { width: 1280 } }],
                        { compress: 0.8, format: SaveFormat.JPEG }
                    );
                } catch (e) {
                    console.warn("Resize failed, using original", e);
                }

                setPhoto({ ...finalPhoto, isPdf: false });
                await scanDocument(finalPhoto);
            } catch (e) {
                console.error(e);
                Alert.alert('Camera Error', 'Failed to take picture.');
                isProcessing.current = false;
                setPhoto(null);
            }
        }
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const isPdf = asset.mimeType === 'application/pdf' || asset.name?.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                    setPhoto({ ...asset, isPdf: true });
                    await scanDocument(asset);
                } else {
                    let finalAsset = asset;
                    try {
                        finalAsset = await manipulateAsync(
                            asset.uri,
                            [{ resize: { width: 1280 } }],
                            { compress: 0.8, format: SaveFormat.JPEG }
                        );
                        setPhoto({ ...finalAsset, isPdf: false });
                        await scanDocument(finalAsset);
                    } catch (e) {
                        console.warn("Resize failed", e);
                        setPhoto({ ...asset, isPdf: false });
                        await scanDocument(asset);
                    }
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const scanDocument = async (fileData) => {
        setScanning(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');

            const formData = new FormData();

            const isPdf = fileData.mimeType === 'application/pdf' || fileData.name?.toLowerCase().endsWith('.pdf') || (fileData.name && fileData.name.endsWith('.pdf'));
            const finalIsPdf = fileData.isPdf || isPdf;
            const fileType = finalIsPdf ? 'application/pdf' : 'image/jpeg';
            const fileName = fileData.name || (finalIsPdf ? 'passport.pdf' : 'passport.jpg');

            formData.append('document', {
                uri: fileData.uri,
                name: fileName,
                type: fileType
            });

            const response = await axios.post(`${API_URL}/ocr/scan`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const today = new Date().toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

                setGuestData({
                    ...response.data.data,
                    arrival_date: today,
                    departure_date: tomorrow
                });
            } else {
                Alert.alert(
                    'Validation Failed',
                    response.data.error || 'No valid passport data found in this image.',
                    [
                        { text: 'Retry', style: 'cancel', onPress: () => setPhoto(null) },
                        { text: 'Enter Manually', onPress: () => initManualEntry() }
                    ]
                );
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Scan Issue', 'Scanner connection failed. Falling back to manual entry.',
                [
                    { text: 'Retry', style: 'cancel', onPress: () => setPhoto(null) },
                    { text: 'Enter Manually', onPress: () => initManualEntry() }
                ]
            );
        } finally {
            setScanning(false);
            isProcessing.current = false;
        }
    };

    const initManualEntry = () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        setGuestData({
            first_name: '',
            last_name: '',
            document_number: '',
            nationality_iso3: '',
            date_of_birth: '',
            document_type: 'PASSPORT',
            arrival_date: today,
            departure_date: tomorrow
        });
    };

    const saveGuest = async () => {
        try {
            if (!guestData.arrival_date || !guestData.departure_date || !guestData.document_number) {
                Alert.alert('Validaton Error', 'Please fill in required fields.');
                return;
            }

            const token = await SecureStore.getItemAsync('userToken');
            await axios.post(`${API_URL}/guests/save`, guestData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Alert.alert('Success', 'Guest saved to database!');
            setGuestData(null);
            setPhoto(null);
            setMode('menu');
        } catch (error) {
            console.error(error);
            Alert.alert('Save Failed', error.response?.data?.error || error.message);
        }
    };

    const updateField = (key, value) => {
        setGuestData(prev => ({ ...prev, [key]: value }));
    };

    const openDatePicker = (field) => {
        setDatePicker({ visible: true, field });
    };

    const onDateChange = (event, selectedDate) => {
        const field = datePicker.field;
        setDatePicker({ visible: false, field: null });

        if (event.type === 'dismissed') return;

        if (selectedDate && field) {
            const formatted = selectedDate.toISOString().split('T')[0];
            updateField(field, formatted);
        }
    };

    const retake = () => {
        setPhoto(null);
        setGuestData(null);
        isProcessing.current = false;
        setMode('menu');
    };

    if (scanning) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.message}>Analyzing Document...</Text>
            </View>
        );
    }

    if (guestData) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.reviewContainer}>
                        <Text style={styles.header}>Verify Details</Text>

                        {photo ? (
                            photo.isPdf ? (
                                <View style={styles.placeholderImage}>
                                    <Text style={{ fontSize: 50 }}>📄</Text>
                                    <Text style={{ color: '#666' }}>PDF Document Attached</Text>
                                </View>
                            ) : (
                                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                            )
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Text style={{ color: '#999' }}>No Image Attached</Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput style={styles.input} value={guestData.first_name} onChangeText={t => updateField('first_name', t)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} value={guestData.last_name} onChangeText={t => updateField('last_name', t)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Document Number</Text>
                            <TextInput style={styles.input} value={guestData.document_number} onChangeText={t => updateField('document_number', t)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nationality (ISO3)</Text>
                            <TextInput style={styles.input} value={guestData.nationality_iso3} onChangeText={t => updateField('nationality_iso3', t)} maxLength={3} autoCapitalize="characters" />
                        </View>

                        <TouchableOpacity onPress={() => openDatePicker('date_of_birth')}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Date of Birth</Text>
                                <View pointerEvents="none">
                                    <TextInput style={styles.input} value={guestData.date_of_birth} placeholder="Select Date" editable={false} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <TouchableOpacity onPress={() => openDatePicker('arrival_date')}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Arrival</Text>
                                        <View pointerEvents="none">
                                            <TextInput style={styles.input} value={guestData.arrival_date} editable={false} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <TouchableOpacity onPress={() => openDatePicker('departure_date')}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Departure</Text>
                                        <View pointerEvents="none">
                                            <TextInput style={styles.input} value={guestData.departure_date} editable={false} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Button title="Save Guest" onPress={saveGuest} />
                            <View style={{ height: 15 }} />
                            <Button title="Cancel" onPress={retake} color="red" />
                        </View>
                        <View style={{ height: 50 }} />

                        {datePicker.visible && (
                            <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Camera Mode
    if (mode === 'camera') {
        if (!permission) return <View />;
        if (!permission.granted) {
            return (
                <View style={styles.container}>
                    <Text style={styles.message}>Permission needed for camera.</Text>
                    <Button onPress={requestPermission} title="Grant Permission" />
                    <Button onPress={() => setMode('menu')} title="Go Back" color="#666" />
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <CameraView style={styles.camera} facing="back" ref={cameraRef}>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={takePicture}>
                            <View style={styles.innerButton} />
                        </TouchableOpacity>
                    </View>

                    <SafeAreaView style={styles.topBar}>
                        <TouchableOpacity onPress={() => setMode('menu')} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </CameraView>
            </View>
        );
    }

    // Default: Menu Mode
    return (
        <View style={styles.menuContainer}>
            <Text style={styles.header}>Add Guest</Text>
            <Text style={styles.subtext}>Choose how to add a guest</Text>

            <TouchableOpacity style={styles.menuButton} onPress={() => setMode('camera')}>
                <Text style={styles.menuButtonText}>📷 Scan with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton} onPress={pickFile}>
                <Text style={styles.menuButtonText}>📂 Upload File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuButton, { backgroundColor: '#666' }]} onPress={initManualEntry}>
                <Text style={styles.menuButtonText}>📝 Add Manually</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 50 }}>
                <Button title="Logout" onPress={onLogout} color="#333" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20
    },
    menuButton: {
        backgroundColor: '#2196F3',
        padding: 20,
        width: '100%',
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center'
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
        marginTop: 20
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        zIndex: 2
    },
    button: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    reviewContainer: {
        padding: 20,
        paddingTop: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1
    },
    previewImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#000'
    },
    placeholderImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#e1e1e1',
        marginBottom: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333'
    },
    subtext: {
        marginBottom: 40,
        color: '#666',
        fontSize: 16
    },
    formGroup: {
        marginBottom: 15
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
        fontSize: 14
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        fontSize: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    actions: {
        marginTop: 20
    },
    topBar: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
