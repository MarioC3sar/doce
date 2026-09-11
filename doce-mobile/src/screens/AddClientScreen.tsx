import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function AddClientScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleSave = async () => {
        if (!name) return Alert.alert('Erro', 'O nome do cliente é obrigatório.');

        try {
            const token = await SecureStore.getItemAsync('userToken');
            await api.post('/api/clients',
                { name, phone, address },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar o cliente.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formCard}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: João Silva"
                    placeholderTextColor="#A3958B"
                />

                <Text style={styles.label}>Telefone / WhatsApp</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Ex: 11999999999"
                    placeholderTextColor="#A3958B"
                />

                <Text style={styles.label}>Endereço de Entrega</Text>
                <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Ex: Rua das Flores, 123 - Centro"
                    placeholderTextColor="#A3958B"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Cliente</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 16 }, // Fundo baunilha

    // Card do Formulário
    formCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 24,
        elevation: 2,
        shadowColor: '#D6A284',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 20
    },

    // Textos e Inputs
    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 }, // Marrom claro
    input: {
        backgroundColor: '#FDFBF7',
        height: 55,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F2E8DF',
        color: '#5C4D43', // Texto digitado em marrom escuro
        fontSize: 16
    },

    // Botão Principal
    saveButton: {
        backgroundColor: '#D6A284', // Caramelo
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#D6A284',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});