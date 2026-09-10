import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function EditIngredientScreen({ route, navigation }: any) {
    // Recebe o ingrediente selecionado da tela anterior
    const { ingredient } = route.params;

    // Inicia os estados com os dados atuais
    const [name, setName] = useState(ingredient.name);
    const [price, setPrice] = useState(String(ingredient.packagePrice));
    const [quantity, setQuantity] = useState(String(ingredient.packageQuantity));
    const [unit, setUnit] = useState(ingredient.unit);

    const handleUpdate = async () => {
        if (!name || !price || !quantity || !unit) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const formattedPrice = parseFloat(price.replace(',', '.'));
            const formattedQuantity = parseFloat(quantity.replace(',', '.'));

            await api.put(`/api/ingredients/${ingredient.id}`, {
                name: name,
                packagePrice: formattedPrice,
                packageQuantity: formattedQuantity,
                unit: unit.toUpperCase()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Sucesso', 'Insumo atualizado com sucesso!');
            navigation.goBack();

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível atualizar o insumo.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.form}>
                <Text style={styles.label}>Nome do Insumo</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Preço da Embalagem (R$)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

                <Text style={styles.label}>Quantidade na Embalagem</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

                <Text style={styles.label}>Unidade (G, KG, ML, L, UN)</Text>
                <TextInput style={styles.input} autoCapitalize="characters" maxLength={2} value={unit} onChangeText={setUnit} />

                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                    <Text style={styles.buttonText}>Atualizar Insumo</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    form: { padding: 20 },
    label: { fontSize: 16, color: '#333', marginBottom: 5, fontWeight: 'bold' },
    input: { backgroundColor: '#FFF', height: 50, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
    button: { backgroundColor: '#4A90E2', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});