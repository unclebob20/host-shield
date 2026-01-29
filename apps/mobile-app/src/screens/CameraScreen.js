import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform, BackHandler, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_URL } from '../config';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CameraScreen({ onLogout }) {
    // --- Navigation State ---
    const [currentScreen, setCurrentScreen] = useState('overview'); // overview, new_guest, guests, ledger
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Scanner/New Guest State (Existing) ---
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [guestData, setGuestData] = useState(null);
    const [mode, setMode] = useState('menu'); // 'menu' (method select) or 'camera'
    const [datePicker, setDatePicker] = useState({ visible: false, field: null });

    const cameraRef = useRef(null);
    const isProcessing = useRef(false);

    // --- Effects ---
    useEffect(() => {
        const backAction = () => {
            if (isSidebarOpen) {
                setIsSidebarOpen(false);
                return true;
            }
            if (currentScreen === 'new_guest') {
                if (guestData) {
                    setGuestData(null);
                    setPhoto(null);
                    return true;
                }
                if (mode === 'camera') {
                    setMode('menu');
                    return true;
                }
                setCurrentScreen('overview');
                return true;
            }
            if (currentScreen !== 'overview') {
                setCurrentScreen('overview');
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isSidebarOpen, currentScreen, mode, guestData]);

    // --- Scanner Logic (Existing) ---
    const takePicture = async () => {
        if (cameraRef.current && !isProcessing.current) {
            isProcessing.current = true;
            try {
                const photoData = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false, exif: true });
                let finalPhoto = photoData;
                try {
                    finalPhoto = await manipulateAsync(photoData.uri, [{ resize: { width: 1280 } }], { compress: 0.8, format: SaveFormat.JPEG });
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
            const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const isPdf = asset.mimeType === 'application/pdf' || asset.name?.toLowerCase().endsWith('.pdf');
                if (isPdf) {
                    setPhoto({ ...asset, isPdf: true });
                    await scanDocument(asset);
                } else {
                    let finalAsset = asset;
                    try {
                        finalAsset = await manipulateAsync(asset.uri, [{ resize: { width: 1280 } }], { compress: 0.8, format: SaveFormat.JPEG });
                        setPhoto({ ...finalAsset, isPdf: false });
                        await scanDocument(finalAsset);
                    } catch (e) {
                        setPhoto({ ...asset, isPdf: false });
                        await scanDocument(asset);
                    }
                }
            }
        } catch (e) {
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

            formData.append('document', { uri: fileData.uri, name: fileName, type: fileType });

            const response = await axios.post(`${API_URL}/ocr/scan`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
            if (response.data.success) {
                const today = new Date().toISOString().split('T')[0];
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                setGuestData({ ...response.data.data, arrival_date: today, departure_date: tomorrow });
            } else {
                Alert.alert('Validation Failed', response.data.error || 'No valid passport data found.', [{ text: 'Retry', style: 'cancel', onPress: () => setPhoto(null) }, { text: 'Enter Manually', onPress: () => initManualEntry() }]);
            }
        } catch (error) {
            Alert.alert('Scan Issue', 'Scanner connection failed. Falling back to manual entry.', [{ text: 'Retry', style: 'cancel', onPress: () => setPhoto(null) }, { text: 'Enter Manually', onPress: () => initManualEntry() }]);
        } finally {
            setScanning(false);
            isProcessing.current = false;
        }
    };

    const initManualEntry = () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        setGuestData({
            first_name: '', last_name: '', document_number: '', nationality_iso3: '',
            date_of_birth: '', document_type: 'PASSPORT', arrival_date: today, departure_date: tomorrow
        });
    };

    const saveGuest = async () => {
        try {
            if (!guestData.arrival_date || !guestData.departure_date || !guestData.document_number) {
                Alert.alert('Validaton Error', 'Please fill in required fields.');
                return;
            }
            const token = await SecureStore.getItemAsync('userToken');
            await axios.post(`${API_URL}/guests/save`, guestData, { headers: { 'Authorization': `Bearer ${token}` } });
            Alert.alert('Success', 'Guest saved to database!');
            setGuestData(null);
            setPhoto(null);
            setMode('menu');
            setCurrentScreen('guests'); // Redirect to guests list after save
        } catch (error) {
            Alert.alert('Save Failed', error.response?.data?.error || error.message);
        }
    };

    const updateField = (key, value) => { setGuestData(prev => ({ ...prev, [key]: value })); };
    const openDatePicker = (field) => { setDatePicker({ visible: true, field }); };
    const onDateChange = (event, selectedDate) => {
        const field = datePicker.field;
        setDatePicker({ visible: false, field: null });
        if (event.type === 'dismissed') return;
        if (selectedDate && field) updateField(field, selectedDate.toISOString().split('T')[0]);
    };
    const retake = () => { setPhoto(null); setGuestData(null); isProcessing.current = false; setMode('menu'); };

    // --- Renderers ---

    const renderHeader = (title) => (
        <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.burgerButton}>
                <Feather name="menu" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderSidebar = () => {
        if (!isSidebarOpen) return null;
        return (
            <View style={styles.sidebarOverlay}>
                <TouchableOpacity style={styles.sidebarBackdrop} onPress={() => setIsSidebarOpen(false)} />
                <View style={styles.sidebarContent}>
                    <View style={styles.sidebarHeader}>
                        <Text style={styles.sidebarBrand}>HostShield</Text>
                    </View>
                    <View style={styles.navItems}>
                        <TouchableOpacity style={[styles.navItem, currentScreen === 'overview' && styles.navItemActive]} onPress={() => { setCurrentScreen('overview'); setIsSidebarOpen(false); }}>
                            <Feather name="home" size={20} color={currentScreen === 'overview' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'overview' && styles.navTextActive]}>Overview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'new_guest' && styles.navItemActive]} onPress={() => { setCurrentScreen('new_guest'); setIsSidebarOpen(false); }}>
                            <Feather name="plus-circle" size={20} color={currentScreen === 'new_guest' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'new_guest' && styles.navTextActive]}>New Guest</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'guests' && styles.navItemActive]} onPress={() => { setCurrentScreen('guests'); setIsSidebarOpen(false); }}>
                            <Feather name="users" size={20} color={currentScreen === 'guests' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'guests' && styles.navTextActive]}>Guests</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'ledger' && styles.navItemActive]} onPress={() => { setCurrentScreen('ledger'); setIsSidebarOpen(false); }}>
                            <Feather name="file-text" size={20} color={currentScreen === 'ledger' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'ledger' && styles.navTextActive]}>Ledger</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutItem} onPress={onLogout}>
                        <Feather name="log-out" size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDashboard = () => (
        <View style={styles.containerLight}>
            {renderHeader('Overview')}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>Welcome back,</Text>
                    <Text style={styles.welcomeSub}>Here's what's happening today.</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                            <Feather name="log-in" size={20} color="#2563eb" />
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Arrivals Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                            <Feather name="user-check" size={20} color="#16a34a" />
                        </View>
                        <Text style={styles.statValue}>45</Text>
                        <Text style={styles.statLabel}>Active Guests</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.bigActionButton} onPress={() => setCurrentScreen('new_guest')}>
                    <View style={styles.bigActionIcon}>
                        <Feather name="plus" size={32} color="white" />
                    </View>
                    <View>
                        <Text style={styles.bigActionTitle}>Check-in Guest</Text>
                        <Text style={styles.bigActionSub}>Scan passport or enter manually</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityList}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.activityItem}>
                            <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>JD</Text></View>
                            <View>
                                <Text style={styles.activityName}>John Doe</Text>
                                <Text style={styles.activityDetail}>Checked in • Room 10{i}</Text>
                            </View>
                            <Text style={styles.activityTime}>{i * 10}m ago</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderNewGuest = () => {
        // --- Existing Scanner/Camera Logic Rendered Here ---
        if (scanning) {
            return (
                <View style={styles.containerDark}>
                    <StatusBar barStyle="light-content" />
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.messageDark}>Analyzing Document...</Text>
                </View>
            );
        }

        // Camera View
        if (mode === 'camera' && !guestData) {
            if (!permission) return <View />;
            if (!permission.granted) {
                return (
                    <View style={styles.containerDark}>
                        <Text style={styles.messageDark}>Permission needed for camera.</Text>
                        <Button onPress={requestPermission} title="Grant Permission" />
                        <TouchableOpacity onPress={() => setMode('menu')} style={{ marginTop: 20 }}>
                            <Text style={{ color: '#fff' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.containerBlack}>
                    <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <View style={styles.captureButtonInner} />
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

        // Verification Form
        if (guestData) {
            return (
                <SafeAreaView style={styles.containerLight}>
                    <StatusBar barStyle="dark-content" />
                    <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                        <TouchableOpacity onPress={retake} style={{ padding: 8 }}>
                            <Feather name="arrow-left" size={24} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 16 }}>Verify Guest</Text>
                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.reviewContainer}>
                            {photo ? (
                                photo.isPdf ? (
                                    <View style={styles.placeholderImage}><Text style={{ fontSize: 50 }}>📄</Text><Text style={styles.subtext}>PDF Attached</Text></View>
                                ) : (<Image source={{ uri: photo.uri }} style={styles.previewImage} />)
                            ) : (
                                <View style={styles.placeholderImage}><Text style={styles.subtext}>No Image Attached</Text></View>
                            )}
                            <View style={styles.formGroup}><Text style={styles.label}>First Name</Text><TextInput style={styles.input} value={guestData.first_name} onChangeText={t => updateField('first_name', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Last Name</Text><TextInput style={styles.input} value={guestData.last_name} onChangeText={t => updateField('last_name', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Document Number</Text><TextInput style={styles.input} value={guestData.document_number} onChangeText={t => updateField('document_number', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Nationality (ISO3)</Text><TextInput style={styles.input} value={guestData.nationality_iso3} onChangeText={t => updateField('nationality_iso3', t)} maxLength={3} autoCapitalize="characters" /></View>
                            <TouchableOpacity onPress={() => openDatePicker('date_of_birth')}>
                                <View style={styles.formGroup}><Text style={styles.label}>Date of Birth</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.date_of_birth} placeholder="Select Date" editable={false} /></View></View>
                            </TouchableOpacity>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}><TouchableOpacity onPress={() => openDatePicker('arrival_date')}><View style={styles.formGroup}><Text style={styles.label}>Arrival</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.arrival_date} editable={false} /></View></View></TouchableOpacity></View>
                                <View style={{ flex: 1, marginLeft: 8 }}><TouchableOpacity onPress={() => openDatePicker('departure_date')}><View style={styles.formGroup}><Text style={styles.label}>Departure</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.departure_date} editable={false} /></View></View></TouchableOpacity></View>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.primaryButton} onPress={saveGuest}><Text style={styles.primaryButtonText}>Save Guest</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.secondaryButton} onPress={retake}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
                            </View>
                            <View style={{ height: 50 }} />
                            {datePicker.visible && <DateTimePicker value={new Date()} mode="date" display="default" onChange={onDateChange} />}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            );
        }

        // Method Selection Menu
        return (
            <View style={styles.containerLight}>
                {renderHeader('New Guest')}
                <View style={styles.menuContainer}>
                    <Text style={styles.subtext}>Choose a method to scan document</Text>

                    <TouchableOpacity style={styles.menuButton} onPress={() => setMode('camera')}>
                        <Feather name="camera" size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text style={styles.menuButtonText}>Scan with Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton} onPress={pickFile}>
                        <Feather name="upload" size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text style={styles.menuButtonText}>Upload File</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuButton, styles.menuButtonSecondary]} onPress={initManualEntry}>
                        <Feather name="edit" size={24} color="#64748b" style={{ marginBottom: 8 }} />
                        <Text style={[styles.menuButtonText, styles.menuButtonTextSecondary]}>Enter Manually</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderGuestsList = () => (
        <View style={styles.containerLight}>
            {renderHeader('All Guests')}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="users" size={48} color="#cbd5e1" />
                <Text style={{ marginTop: 16, color: '#64748b' }}>Guest list under construction</Text>
            </View>
        </View>
    );

    const renderLedger = () => (
        <View style={styles.containerLight}>
            {renderHeader('Ledger')}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="file-text" size={48} color="#cbd5e1" />
                <Text style={{ marginTop: 16, color: '#64748b' }}>Ledger module under construction</Text>
            </View>
        </View>
    );

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.containerLight}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            <View style={{ flex: 1 }}>
                {currentScreen === 'overview' && renderDashboard()}
                {currentScreen === 'new_guest' && renderNewGuest()}
                {currentScreen === 'guests' && renderGuestsList()}
                {currentScreen === 'ledger' && renderLedger()}
            </View>

            {renderSidebar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerLight: { flex: 1, backgroundColor: '#f8fafc' },
    containerDark: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
    containerBlack: { flex: 1, backgroundColor: '#000' },

    // Header
    headerBar: {
        height: Platform.OS === 'android' ? 100 : 60,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        zIndex: 50, // Ensure it's on top
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a'
    },
    burgerButton: {
        padding: 8
    },

    // Sidebar
    sidebarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        zIndex: 100,
        elevation: 10, // Critical for Android to sit above buttons with elevation
        flexDirection: 'row'
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    sidebarContent: {
        width: 280,
        backgroundColor: '#fff',
        height: '100%',
        paddingVertical: 40,
        paddingHorizontal: 20,
        elevation: 20, // Ensure content is above backdrop and underlying screens
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    sidebarHeader: {
        marginBottom: 40,
        paddingHorizontal: 10
    },
    sidebarBrand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb'
    },
    navItems: {
        flex: 1
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8
    },
    navItemActive: {
        backgroundColor: '#eff6ff'
    },
    navText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#64748b',
        fontWeight: '500'
    },
    navTextActive: {
        color: '#2563eb',
        fontWeight: '600'
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    logoutText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#ef4444',
        fontWeight: '500'
    },

    // Dashboard
    contentContainer: {
        padding: 24
    },
    welcomeCard: {
        marginBottom: 24
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a'
    },
    welcomeSub: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center'
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a'
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4
    },
    bigActionButton: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    bigActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    bigActionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    bigActionSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 2
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16
    },
    activityList: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 8
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        color: '#64748b',
        fontWeight: '600'
    },
    activityName: {
        fontWeight: '600',
        color: '#0f172a'
    },
    activityDetail: {
        fontSize: 12,
        color: '#64748b'
    },
    activityTime: {
        marginLeft: 'auto',
        fontSize: 12,
        color: '#94a3b8'
    },

    // New Guest Menu
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    subtext: {
        marginBottom: 48,
        color: '#64748b',
        fontSize: 16,
        textAlign: 'center'
    },
    menuButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 24,
        width: '100%',
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    menuButtonSecondary: {
        backgroundColor: '#f1f5f9',
        shadowColor: 'transparent',
        borderWidth: 1,
        borderColor: '#cbd5e1'
    },
    menuButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600'
    },
    menuButtonTextSecondary: {
        color: '#475569'
    },

    // Existing Styles preserved/tweaked
    messageDark: { textAlign: 'center', color: '#e2e8f0', marginTop: 20, fontSize: 16 },
    camera: { flex: 1 },
    buttonContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    captureButton: { width: 80, height: 80, borderRadius: 40, borderColor: 'rgba(255,255,255,0.5)', borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
    captureButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
    topBar: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
    closeButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    closeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    // Form
    reviewContainer: { padding: 24, flexGrow: 1 },
    previewImage: { width: '100%', height: 220, resizeMode: 'contain', marginBottom: 24, borderRadius: 16, backgroundColor: '#1e293b' },
    placeholderImage: { width: '100%', height: 120, backgroundColor: '#e2e8f0', marginBottom: 24, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    formGroup: { marginBottom: 20 },
    label: { fontWeight: '600', color: '#475569', marginBottom: 8, fontSize: 14 },
    input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, fontSize: 16, color: '#0f172a' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    actions: { marginTop: 24, gap: 16 },
    primaryButton: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
    secondaryButton: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
    secondaryButtonText: { color: '#64748b', fontWeight: '600', fontSize: 16 }
});
