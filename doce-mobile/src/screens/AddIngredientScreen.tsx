import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function AddIngredientScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');

    const handleSave = async () => {
        if (!name || !price || !quantity || !unit) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Converte vírgula para ponto caso o teclado do celular envie vírgula
            const formattedPrice = parseFloat(price.replace(',', '.'));
            const formattedQuantity = parseFloat(quantity.replace(',', '.'));

            await api.post('/api/ingredients', {
                name: name,
                packagePrice: formattedPrice,
                packageQuantity: formattedQuantity,
                unit: unit.toUpperCase() // Garante que a unidade vá em maiúsculo (ex: G, KG, ML)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Sucesso', 'Insumo cadastrado com sucesso!');
            navigation.goBack(); // Volta para a tela de lista automaticamente

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar o insumo.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.form}>
                <Text style={styles.label}>Nome do Insumo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Açúcar Refinado"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Preço da Embalagem (R$)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 5.50"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.label}>Quantidade na Embalagem</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 1000"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                />

                <Text style={styles.label}>Unidade de Medida (G, KG, ML, L, UN)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: G"
                    autoCapitalize="characters"
                    maxLength={2}
                    value={unit}
                    onChangeText={setUnit}
                />

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Salvar Insumo</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    form: { padding: 20 },
    label: { fontSize: 16, color: '#333', marginBottom: 5, fontWeight: 'bold' },
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
        marginTop: 10,
    },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});