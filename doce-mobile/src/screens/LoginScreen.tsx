import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// AQUI ESTÁ O NAVIGATION:
export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Preencha e-mail e senha.');
            return;
        }

        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });

            // 1. Imprime a resposta real do backend no seu terminal do Expo
            console.log('Resposta do Servidor:', response.data);

            // 2. Tenta capturar o token (ajustaremos isso com base no console.log)
            const token = response.data.token || response.data.accessToken || response.data.jwt;

            // 3. Trava de segurança: se o token continuar vazio, ele avisa e para o processo
            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Verifique o terminal.');
                return;
            }

            await SecureStore.setItemAsync('userToken', String(token));


            navigation.replace('MainTabs');

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Credenciais inválidas ou erro de conexão.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Precificação</Text>
                <Text style={styles.subtitle}>Gerencie suas fichas técnicas</Text>

                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4A90E2',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});