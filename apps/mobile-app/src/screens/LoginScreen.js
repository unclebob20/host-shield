import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';
import BackgroundWrapper from '../components/BackgroundWrapper';
import GradientText from '../components/GradientText';

export default function LoginScreen({ onLoginSuccess }) {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('alerts.error'), t('alerts.fill_required'));
            return;
        }

        try {
            setLoading(true);
            console.log(`Logging in to ${API_URL}/auth/login...`);
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: email,
                password: password
            });

            if (response.data.success) {
                const token = response.data.accessToken;
                await SecureStore.setItemAsync('userToken', token);
                onLoginSuccess(token);
            } else {
                Alert.alert(t('auth.login_failed'), 'Unknown error');
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('auth.login_failed'), error.response?.data?.error || 'Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BackgroundWrapper>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <View style={styles.headerContainer}>
                        <View style={styles.logoRow}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <GradientText style={styles.title}>{t('app.title')}</GradientText>
                        </View>
                        <Text style={styles.subtitle}>
                            {t('app.subtitle')}
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: 16 }}>
                            <TouchableOpacity onPress={() => i18n.changeLanguage('en')} style={{ padding: 8, marginHorizontal: 8, opacity: i18n.language === 'en' ? 1 : 0.5 }}>
                                <Text style={{ fontSize: 24 }}>🇬🇧</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => i18n.changeLanguage('sk')} style={{ padding: 8, marginHorizontal: 8, opacity: i18n.language === 'sk' ? 1 : 0.5 }}>
                                <Text style={{ fontSize: 24 }}>🇸🇰</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.email')}</Text>
                            <TextInput
                                placeholder="name@example.com"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.password')}</Text>
                            <TextInput
                                placeholder={t('auth.password')}
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('auth.sign_in')}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>{t('auth.no_account')}</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => Linking.openURL('https://hostshield.org/register')}
                            >
                                <Text style={styles.secondaryButtonText}>{t('auth.create_account')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor handled by wrapper
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    headerContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 80,
        height: 80,
        marginRight: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b', // Slate 500
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569', // Slate 600
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
    },
    button: {
        backgroundColor: '#2563eb', // Blue 600
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        color: '#64748b', // Slate 500
        fontSize: 14,
        paddingHorizontal: 16,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
    },
});
