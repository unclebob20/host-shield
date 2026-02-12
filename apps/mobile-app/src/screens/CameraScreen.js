import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform, BackHandler, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_URL } from '../config';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import BackgroundWrapper from '../components/BackgroundWrapper';
import GradientText from '../components/GradientText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CameraScreen({ onLogout }) {
    const { t, i18n } = useTranslation();
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
                Alert.alert(t('alerts.error'), t('alerts.camera_error'));
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
            Alert.alert(t('alerts.error'), t('alerts.pick_error'));
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

                let docType = 'P';
                if (response.data.data.document_type === 'ID_CARD') docType = 'ID';

                setGuestData({
                    ...response.data.data,
                    document_type: docType,
                    arrival_date: today,
                    departure_date: tomorrow,
                    objectId: properties.length === 1 ? properties[0].id : null
                });
            } else {
                Alert.alert(t('alerts.val_failed'), response.data.error || t('alerts.no_valid_data'), [{ text: t('new_guest.retry'), style: 'cancel', onPress: () => setPhoto(null) }, { text: t('new_guest.enter_manual'), onPress: () => initManualEntry() }]);
            }
        } catch (error) {
            Alert.alert(t('alerts.scan_issue'), t('alerts.scan_conn_fail'), [{ text: t('new_guest.retry'), style: 'cancel', onPress: () => setPhoto(null) }, { text: t('new_guest.enter_manual'), onPress: () => initManualEntry() }]);
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
            date_of_birth: '', document_type: 'P', arrival_date: today, departure_date: tomorrow,
            objectId: properties.length === 1 ? properties[0].id : null
        });
    };

    const saveGuest = async () => {
        try {
            if (!guestData.arrival_date || !guestData.departure_date || !guestData.document_number || !guestData.objectId) {
                Alert.alert(t('alerts.val_failed'), t('alerts.fill_required'));
                return;
            }
            const token = await SecureStore.getItemAsync('userToken');
            await axios.post(`${API_URL}/guests/save`, guestData, { headers: { 'Authorization': `Bearer ${token}` } });
            Alert.alert(t('login.success'), t('alerts.save_success'));
            setGuestData(null);
            setPhoto(null);
            setMode('menu');
            setCurrentScreen('guests'); // Redirect to guests list after save
        } catch (error) {
            Alert.alert(t('alerts.save_failed'), error.response?.data?.error || error.message);
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
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.sidebarLogo}
                            resizeMode="contain"
                        />
                        <GradientText style={styles.sidebarBrand}>HostShield</GradientText>
                    </View>

                    {/* Language Switcher */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                        <TouchableOpacity onPress={() => i18n.changeLanguage('en')} style={{ padding: 10, opacity: i18n.language === 'en' ? 1 : 0.5 }}>
                            <Text style={{ fontSize: 24 }}>🇬🇧</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => i18n.changeLanguage('sk')} style={{ padding: 10, opacity: i18n.language === 'sk' ? 1 : 0.5 }}>
                            <Text style={{ fontSize: 24 }}>🇸🇰</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.navItems}>
                        <TouchableOpacity style={[styles.navItem, currentScreen === 'overview' && styles.navItemActive]} onPress={() => { setCurrentScreen('overview'); setIsSidebarOpen(false); }}>
                            <Feather name="home" size={20} color={currentScreen === 'overview' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'overview' && styles.navTextActive]}>{t('nav.overview')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'new_guest' && styles.navItemActive]} onPress={() => { setCurrentScreen('new_guest'); setIsSidebarOpen(false); }}>
                            <Feather name="plus-circle" size={20} color={currentScreen === 'new_guest' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'new_guest' && styles.navTextActive]}>{t('nav.new_guest')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'guests' && styles.navItemActive]} onPress={() => { setCurrentScreen('guests'); setIsSidebarOpen(false); }}>
                            <Feather name="users" size={20} color={currentScreen === 'guests' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'guests' && styles.navTextActive]}>{t('nav.guests')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.navItem, currentScreen === 'calendar' && styles.navItemActive]} onPress={() => { setCurrentScreen('calendar'); setIsSidebarOpen(false); }}>
                            <Feather name="calendar" size={20} color={currentScreen === 'calendar' ? '#2563eb' : '#64748b'} />
                            <Text style={[styles.navText, currentScreen === 'calendar' && styles.navTextActive]}>{t('nav.calendar')}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutItem} onPress={onLogout}>
                        <Feather name="log-out" size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>{t('nav.logout')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const [dashboardStats, setDashboardStats] = useState({
        arrivalsToday: 0,
        activeGuests: 0,
        recentActivity: []
    });
    const [guestList, setGuestList] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [properties, setProperties] = useState([]);

    // Helper to shorten ISO dates

    // Helper to shorten ISO dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dateString.split('T')[0];
    };

    useEffect(() => {
        if (currentScreen === 'overview') fetchDashboardData();
        if (currentScreen === 'guests') fetchGuests();
        if (currentScreen === 'new_guest') fetchProperties();
        if (currentScreen === 'calendar') {
            fetchGuests();
            fetchProperties();
        }
    }, [currentScreen]);

    const fetchGuests = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/guests`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.data.success) {
                setGuestList(response.data.guests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            }
        } catch (error) {
            console.error('Failed to fetch guests', error);
        }
    };

    const fetchProperties = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/properties`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.data.properties) {
                setProperties(response.data.properties);
            }
        } catch (error) {
            console.error('Failed to fetch properties', error);
        }
    };

    const submitGuest = async (guestId) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            // Optimistic update
            setGuestList(prev => prev.map(g => g.id === guestId ? { ...g, submission_status: 'sending' } : g));
            if (selectedGuest && selectedGuest.id === guestId) {
                setSelectedGuest(prev => ({ ...prev, submission_status: 'sending' }));
            }

            const response = await axios.post(`${API_URL}/guests/register`, { guestId }, { headers: { 'Authorization': `Bearer ${token}` } });

            if (response.data.success) {
                Alert.alert(t('login.success'), t('alerts.save_success')); // Reuse success message or add new
                fetchGuests();
                if (selectedGuest && selectedGuest.id === guestId) {
                    setSelectedGuest(prev => ({ ...prev, submission_status: 'sent' }));
                }
            }
        } catch (error) {
            Alert.alert(t('alerts.error'), error.response?.data?.error || "Submission failed");
            fetchGuests();
            if (selectedGuest && selectedGuest.id === guestId) {
                setSelectedGuest(prev => ({ ...prev, submission_status: 'error' }));
            }
        }
    };

    const fetchDashboardData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/guests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                const guests = response.data.guests;
                const today = new Date().toISOString().split('T')[0];

                // Arrivals Today
                const arrivals = guests.filter(g => g.arrival_date && g.arrival_date.startsWith(today)).length;

                // Active Guests (simple logic: not departed yet)
                const active = guests.filter(g => {
                    if (!g.departure_date) return true;
                    return g.departure_date >= today;
                }).length;

                // Recent Activity (sort by created_at desc)
                const recent = [...guests]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3);

                setDashboardStats({
                    arrivalsToday: arrivals,
                    activeGuests: active,
                    recentActivity: recent
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        }
    };

    const renderDashboard = () => (
        <View style={styles.containerLight}>
            {renderHeader(t('nav.overview'))}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>{t('dashboard.welcome')}</Text>
                    <Text style={styles.welcomeSub}>{t('dashboard.subtitle')}</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                            <Feather name="log-in" size={20} color="#2563eb" />
                        </View>
                        <Text style={styles.statValue}>{dashboardStats.arrivalsToday}</Text>
                        <Text style={styles.statLabel}>{t('dashboard.arrivals_today')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                            <Feather name="user-check" size={20} color="#16a34a" />
                        </View>
                        <Text style={styles.statValue}>{dashboardStats.activeGuests}</Text>
                        <Text style={styles.statLabel}>{t('dashboard.active_guests')}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.bigActionButton} onPress={() => setCurrentScreen('new_guest')}>
                    <View style={styles.bigActionIcon}>
                        <Feather name="plus" size={32} color="white" />
                    </View>
                    <View>
                        <Text style={styles.bigActionTitle}>{t('dashboard.check_in')}</Text>
                        <Text style={styles.bigActionSub}>{t('dashboard.check_in_sub')}</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>{t('dashboard.recent_activity')}</Text>
                <View style={styles.activityList}>
                    {dashboardStats.recentActivity.length > 0 ? (
                        dashboardStats.recentActivity.map((guest, i) => (
                            <View key={guest.id || i} style={styles.activityItem}>
                                <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{guest.first_name?.[0]}{guest.last_name?.[0]}</Text></View>
                                <View>
                                    <Text style={styles.activityName}>{guest.first_name} {guest.last_name}</Text>
                                    <Text style={styles.activityDetail}>{new Date(guest.created_at).toLocaleDateString()} • {guest.nationality_iso3}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{ padding: 16 }}>
                            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No recent guests</Text>
                        </View>
                    )}
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
                    <Text style={styles.messageDark}>{t('new_guest.analyzing')}</Text>
                </View>
            );
        }

        // Camera View
        if (mode === 'camera' && !guestData) {
            if (!permission) return <View />;
            if (!permission.granted) {
                return (
                    <View style={styles.containerDark}>
                        <Text style={styles.messageDark}>{t('new_guest.permission_needed')}</Text>
                        <Button onPress={requestPermission} title={t('new_guest.grant_permission')} />
                        <TouchableOpacity onPress={() => setMode('menu')} style={{ marginTop: 20 }}>
                            <Text style={{ color: '#fff' }}>{t('new_guest.go_back')}</Text>
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
                        <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 16 }}>{t('new_guest.verify_title')}</Text>
                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.reviewContainer}>
                            {photo ? (
                                photo.isPdf ? (
                                    <View style={styles.placeholderImage}><Text style={{ fontSize: 50 }}>📄</Text><Text style={styles.subtext}>{t('new_guest.pdf_attached')}</Text></View>
                                ) : (<Image source={{ uri: photo.uri }} style={styles.previewImage} />)
                            ) : (
                                <View style={styles.placeholderImage}><Text style={styles.subtext}>{t('new_guest.no_image')}</Text></View>
                            )}
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.first_name')}</Text><TextInput style={styles.input} value={guestData.first_name} onChangeText={t => updateField('first_name', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.last_name')}</Text><TextInput style={styles.input} value={guestData.last_name} onChangeText={t => updateField('last_name', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.doc_number')}</Text><TextInput style={styles.input} value={guestData.document_number} onChangeText={t => updateField('document_number', t)} /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.nationality')}</Text><TextInput style={styles.input} value={guestData.nationality_iso3} onChangeText={t => updateField('nationality_iso3', t)} maxLength={3} autoCapitalize="characters" /></View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('form.doc_type')}</Text>
                                <View style={styles.pickerContainer}>
                                    <TouchableOpacity
                                        style={[styles.pickerButton, guestData.document_type === 'P' && styles.pickerButtonActive]}
                                        onPress={() => updateField('document_type', 'P')}
                                    >
                                        <Text style={[styles.pickerButtonText, guestData.document_type === 'P' && styles.pickerButtonTextActive]}>
                                            {t('form.passport')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.pickerButton, guestData.document_type === 'ID' && styles.pickerButtonActive]}
                                        onPress={() => updateField('document_type', 'ID')}
                                    >
                                        <Text style={[styles.pickerButtonText, guestData.document_type === 'ID' && styles.pickerButtonTextActive]}>
                                            {t('form.id_card')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('form.property')}</Text>
                                <View style={styles.input}>
                                    {properties.length > 0 ? (
                                        <View>
                                            {properties.map(prop => (
                                                <TouchableOpacity
                                                    key={prop.id}
                                                    style={[styles.propertyOption, guestData.objectId === prop.id && styles.propertyOptionActive]}
                                                    onPress={() => updateField('objectId', prop.id)}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={[styles.radioButton, guestData.objectId === prop.id && styles.radioButtonActive]}>
                                                            {guestData.objectId === prop.id && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={[styles.propertyName, guestData.objectId === prop.id && styles.propertyNameActive]}>{prop.name}</Text>
                                                            <Text style={styles.propertyType}>{prop.type}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text style={{ color: '#94a3b8', fontSize: 14 }}>{t('form.no_properties')}</Text>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => openDatePicker('date_of_birth')}>
                                <View style={styles.formGroup}><Text style={styles.label}>{t('form.dob')}</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.date_of_birth} placeholder={t('form.select_date')} editable={false} /></View></View>
                            </TouchableOpacity>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}><TouchableOpacity onPress={() => openDatePicker('arrival_date')}><View style={styles.formGroup}><Text style={styles.label}>{t('form.arrival')}</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.arrival_date} editable={false} /></View></View></TouchableOpacity></View>
                                <View style={{ flex: 1, marginLeft: 8 }}><TouchableOpacity onPress={() => openDatePicker('departure_date')}><View style={styles.formGroup}><Text style={styles.label}>{t('form.departure')}</Text><View pointerEvents="none"><TextInput style={styles.input} value={guestData.departure_date} editable={false} /></View></View></TouchableOpacity></View>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.primaryButton} onPress={saveGuest}><Text style={styles.primaryButtonText}>{t('new_guest.save')}</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.secondaryButton} onPress={retake}><Text style={styles.secondaryButtonText}>{t('new_guest.cancel')}</Text></TouchableOpacity>
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
                {renderHeader(t('new_guest.title'))}
                <View style={styles.menuContainer}>
                    <Text style={styles.subtext}>{t('new_guest.method_title')}</Text>

                    <TouchableOpacity style={styles.menuButton} onPress={() => setMode('camera')}>
                        <Feather name="camera" size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text style={styles.menuButtonText}>{t('new_guest.scan_camera')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton} onPress={pickFile}>
                        <Feather name="upload" size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text style={styles.menuButtonText}>{t('new_guest.upload_file')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuButton, styles.menuButtonSecondary]} onPress={initManualEntry}>
                        <Feather name="edit" size={24} color="#64748b" style={{ marginBottom: 8 }} />
                        <Text style={[styles.menuButtonText, styles.menuButtonTextSecondary]}>{t('new_guest.enter_manual')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderGuestDetails = () => {
        if (!selectedGuest) return null;
        return (
            <BackgroundWrapper>
                <SafeAreaView style={styles.containerLight}>
                    <View style={styles.headerBar}>
                        <TouchableOpacity onPress={() => setSelectedGuest(null)} style={styles.burgerButton}>
                            <Feather name="arrow-left" size={24} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('guest_details.title')}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <ScrollView contentContainerStyle={styles.contentContainer}>
                        <View style={styles.welcomeCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={[styles.avatarPlaceholder, { width: 60, height: 60, borderRadius: 30 }]}>
                                    <Text style={{ fontSize: 24, color: '#64748b', fontWeight: 'bold' }}>{selectedGuest.first_name?.[0]}{selectedGuest.last_name?.[0]}</Text>
                                </View>
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{selectedGuest.first_name} {selectedGuest.last_name}</Text>
                                    <View style={{ backgroundColor: selectedGuest.submission_status === 'sent' ? '#dcfce7' : '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 4 }}>
                                        <Text style={{ fontSize: 12, color: selectedGuest.submission_status === 'sent' ? '#166534' : '#64748b', fontWeight: '600' }}>
                                            {t(`status.${selectedGuest.submission_status || 'draft'}`)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>{t('guest_details.personal')}</Text>
                        <View style={styles.statCard}>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.nationality')}</Text><Text style={styles.input}>{selectedGuest.nationality_iso3}</Text></View>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.dob')}</Text><Text style={styles.input}>{formatDate(selectedGuest.date_of_birth)}</Text></View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('guest_details.documents')}</Text>
                        <View style={styles.statCard}>
                            <View style={styles.formGroup}><Text style={styles.label}>{t('form.doc_number')}</Text><Text style={styles.input}>{selectedGuest.document_number}</Text></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Type</Text><Text style={styles.input}>{selectedGuest.document_type}</Text></View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('guest_details.stay')}</Text>
                        <View style={styles.statCard}>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.label}>{t('form.arrival')}</Text><Text style={styles.input}>{formatDate(selectedGuest.arrival_date)}</Text></View>
                                <View style={{ flex: 1, marginLeft: 8 }}><Text style={styles.label}>{t('form.departure')}</Text><Text style={styles.input}>{formatDate(selectedGuest.departure_date)}</Text></View>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.secondaryButton, { marginTop: 32 }]} onPress={() => setSelectedGuest(null)}>
                            <Text style={styles.secondaryButtonText}>{t('guest_details.close')}</Text>
                        </TouchableOpacity>

                        {(selectedGuest.submission_status === 'pending' || selectedGuest.submission_status === 'draft' || selectedGuest.submission_status === 'error' || !selectedGuest.submission_status) && (
                            <TouchableOpacity style={[styles.primaryButton, { marginTop: 16, backgroundColor: '#2563eb' }]} onPress={() => submitGuest(selectedGuest.id)}>
                                <Feather name="send" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>{t('guest_details.submit')}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </BackgroundWrapper>
        );
    };

    const renderCalendar = () => {
        const [viewDate, setViewDate] = useState(new Date());

        const changeMonth = (offset) => {
            const d = new Date(viewDate);
            d.setMonth(d.getMonth() + offset);
            setViewDate(d);
        };

        const currentMonthBookings = guestList.filter(guest => {
            const arrival = new Date(guest.arrival_date);
            const departure = new Date(guest.departure_date);
            const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
            const lastOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

            // Overlap check
            return arrival <= lastOfMonth && departure >= firstOfMonth;
        });

        const monthName = viewDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' });

        return (
            <View style={styles.containerLight}>
                <View style={[styles.headerBar, { borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }]}>
                    <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.burgerButton}>
                        <Feather name="menu" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('nav.calendar')}</Text>
                    <TouchableOpacity onPress={() => setCurrentScreen('new_guest')} style={{ padding: 8 }}>
                        <Feather name="plus-circle" size={24} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                    backgroundColor: 'white',
                    marginHorizontal: 16,
                    marginTop: 8,
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 }}>
                        <Feather name="chevron-left" size={20} color="#2563eb" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{monthName}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{currentMonthBookings.length} {t('nav.guests').toLowerCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 }}>
                        <Feather name="chevron-right" size={20} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24 }}>
                    {properties.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Feather name="info" size={48} color="#cbd5e1" />
                            <Text style={{ marginTop: 16, color: '#64748b', textAlign: 'center' }}>{t('form.no_properties')}</Text>
                        </View>
                    ) : (
                        properties.map(property => {
                            const propertyBookings = currentMonthBookings.filter(b => (b.propertyId || b.object_id) === property.id);

                            return (
                                <View key={property.id} style={{ marginBottom: 24 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Feather name="home" size={20} color="#2563eb" />
                                        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#334155' }}>{property.name}</Text>
                                    </View>

                                    {propertyBookings.length === 0 ? (
                                        <Text style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic', marginLeft: 28 }}>No bookings this month</Text>
                                    ) : (
                                        propertyBookings.sort((a, b) => new Date(a.arrival_date) - new Date(b.arrival_date)).map(booking => (
                                            <TouchableOpacity
                                                key={booking.id}
                                                style={{
                                                    flexDirection: 'row',
                                                    backgroundColor: 'white',
                                                    padding: 12,
                                                    borderRadius: 12,
                                                    marginBottom: 8,
                                                    marginLeft: 28,
                                                    borderLeftWidth: 4,
                                                    borderLeftColor: booking.submission_status === 'sent' ? '#10b981' : '#f59e0b',
                                                    shadowColor: "#000",
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.05,
                                                    shadowRadius: 2,
                                                    elevation: 2
                                                }}
                                                onPress={() => setSelectedGuest(booking)}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontWeight: '600', color: '#1e293b' }}>{booking.first_name} {booking.last_name}</Text>
                                                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                                        {formatDate(booking.arrival_date)} → {formatDate(booking.departure_date)}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    backgroundColor: booking.submission_status === 'sent' ? '#ecfdf5' : '#fffbeb',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={{
                                                        fontSize: 10,
                                                        fontWeight: '700',
                                                        color: booking.submission_status === 'sent' ? '#059669' : '#d97706'
                                                    }}>
                                                        {t(`status.${booking.submission_status || 'pending'}`).toUpperCase()}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        );
    };

    const renderGuestsList = () => (
        <View style={styles.containerLight}>
            {renderHeader(t('nav.guests'))}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {guestList.length > 0 ? (
                    guestList.map((guest, i) => (
                        <TouchableOpacity key={guest.id || i} style={styles.activityItem} onPress={() => setSelectedGuest(guest)}>
                            <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{guest.first_name?.[0]}{guest.last_name?.[0]}</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.activityName}>{guest.first_name} {guest.last_name}</Text>
                                <Text style={styles.activityDetail}>{guest.document_number} • {guest.nationality_iso3}</Text>
                                <Text style={styles.activityDetail}>{formatDate(guest.arrival_date)} ➔ {formatDate(guest.departure_date)}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={{ backgroundColor: guest.submission_status === 'sent' ? '#dcfce7' : '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 10, color: guest.submission_status === 'sent' ? '#166534' : '#64748b' }}>{t(`status.${guest.submission_status || 'draft'}`)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Feather name="users" size={48} color="#cbd5e1" />
                        <Text style={{ marginTop: 16, color: '#64748b' }}>{t('common.no_data')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );


    // --- Main Render ---
    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.containerLight}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

                <View style={{ flex: 1 }}>
                    {!selectedGuest ? (
                        <>
                            {currentScreen === 'overview' && renderDashboard()}
                            {currentScreen === 'new_guest' && renderNewGuest()}
                            {currentScreen === 'guests' && renderGuestsList()}
                            {currentScreen === 'calendar' && renderCalendar()}
                        </>
                    ) : (
                        renderGuestDetails()
                    )}
                </View>

                {renderSidebar()}
            </SafeAreaView>
        </BackgroundWrapper>
    );
}

const styles = StyleSheet.create({
    containerLight: { flex: 1, backgroundColor: 'transparent' },
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
        // backgroundColor: '#f8fafc', // Remove opaque bg
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
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebarLogo: {
        width: 40,
        height: 40,
        marginRight: 12,
        marginBottom: 0, // Reset margin
    },
    sidebarBrand: {
        fontSize: 24,
        fontWeight: 'bold',
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
    secondaryButtonText: { color: '#64748b', fontWeight: '600', fontSize: 16 },

    // Document Type Picker
    pickerContainer: { flexDirection: 'row', gap: 12 },
    pickerButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff', alignItems: 'center' },
    pickerButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    pickerButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    pickerButtonTextActive: { color: '#ffffff' },

    // Property Selector
    propertyOption: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    propertyOptionActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
    radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    radioButtonActive: { borderColor: '#2563eb' },
    radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
    propertyName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    propertyNameActive: { color: '#2563eb' },
    propertyType: { fontSize: 12, color: '#64748b', marginTop: 2 }
});
