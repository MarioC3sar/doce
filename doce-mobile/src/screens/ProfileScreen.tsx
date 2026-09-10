import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen({ navigation }: any) {

    const handleLogout = async () => {
        Alert.alert(
            'Sair da Conta',
            'Tem certeza que deseja sair do aplicativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // 1. Remove o token de segurança do celular
                            await SecureStore.deleteItemAsync('userToken');

                            // 2. Reseta a árvore de navegação e joga para o Login
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Erro ao sair:', error);
                            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Aqui você pode futuramente puxar o nome do usuário logado da sua API */}
                <Text style={styles.title}>Minha Conta</Text>
                <Text style={styles.subtitle}>Gerenciamento de acesso</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sair do Aplicativo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        backgroundColor: '#4A90E2',
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#E0F7FA' },
    content: { flex: 1, justifyContent: 'flex-end', padding: 20, paddingBottom: 40 },
    logoutButton: {
        backgroundColor: '#E74C3C',
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C0392B'
    },
    logoutText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});