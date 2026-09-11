import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Preencha e-mail e senha.');
            return;
        }

        setLoading(true);
        try {
            // Rota exata que estava funcionando no seu código original
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });

            console.log('Resposta do Servidor:', response.data);

            // Tenta capturar o token da mesma forma que funcionou antes
            const token = response.data.token || response.data.accessToken || response.data.jwt;

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Verifique o terminal.');
                setLoading(false);
                return;
            }

            // Salva o token de forma segura
            await SecureStore.setItemAsync('userToken', String(token));

            // Vai para a tela principal
            navigation.replace('MainTabs');

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Credenciais inválidas ou erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.content}>

                {/* Cabeçalho de Boas-vindas */}
                <View style={styles.header}>
                    <Text style={styles.title}>Bem-vindo(a)! 🧁</Text>
                    <Text style={styles.subtitle}>Gerencie sua confeitaria com amor, organização e precisão.</Text>
                </View>

                {/* Card do Formulário */}
                <View style={styles.formCard}>
                    <Text style={styles.label}>E-mail</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="exemplo@confeitaria.com"
                        placeholderTextColor="#A3958B"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#A3958B"
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Rodapé */}
                <Text style={styles.footerText}>Feito com ❤️ para negócios artesanais</Text>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' }, // Fundo baunilha
    content: { flex: 1, justifyContent: 'center', padding: 24 },

    // Textos do Cabeçalho
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '900', color: '#5C4D43', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#8C7B70', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },

    // Card Flutuante
    formCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 32,
        elevation: 4,
        shadowColor: '#D6A284',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        marginBottom: 30
    },

    // Inputs
    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 },
    input: {
        backgroundColor: '#FDFBF7',
        height: 60,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F2E8DF',
        color: '#5C4D43',
        fontSize: 16
    },

    // Botão de Login
    loginButton: {
        backgroundColor: '#D6A284', // Caramelo
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#D6A284',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    // Rodapé
    footerText: { textAlign: 'center', color: '#A3958B', fontSize: 14, fontWeight: '600' }
});