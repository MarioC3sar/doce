import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function EditIngredientScreen({ route, navigation }: any) {
    const { ingredientId } = route.params;

    const [name, setName] = useState('');
    const [packagePrice, setPackagePrice] = useState('');
    const [packageQuantity, setPackageQuantity] = useState('');
    const [unit, setUnit] = useState('g');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadIngredient();
    }, []);

    const loadIngredient = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await api.get(`/api/ingredients/${ingredientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const ing = response.data;
            setName(ing.name);
            setPackagePrice(String(ing.packagePrice));
            setPackageQuantity(String(ing.packageQuantity));
            setUnit(ing.unit);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao carregar insumo.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!name || !packagePrice || !packageQuantity) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const payload = {
                name,
                packagePrice: parseFloat(packagePrice.replace(',', '.')),
                packageQuantity: parseFloat(packageQuantity.replace(',', '.')),
                unit
            };

            await api.put(`/api/ingredients/${ingredientId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Sucesso', 'Insumo atualizado!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao atualizar o insumo.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#D6A284" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formCard}>
                <Text style={styles.label}>Nome do Insumo</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#A3958B"
                    placeholder="Ex: Leite Condensado"
                />

                <Text style={styles.label}>Preço do Pacote Fechado (R$)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={packagePrice}
                    onChangeText={setPackagePrice}
                    placeholderTextColor="#A3958B"
                    placeholder="Ex: 6.50"
                />

                <Text style={styles.label}>Peso/Quantidade do Pacote</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        keyboardType="numeric"
                        value={packageQuantity}
                        onChangeText={setPackageQuantity}
                        placeholderTextColor="#A3958B"
                        placeholder="Ex: 395"
                    />
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={unit}
                            style={styles.pickerStyle}
                            onValueChange={(itemValue) => setUnit(itemValue)}
                        >
                            <Picker.Item label="Gramas (g)" value="g" color="#5C4D43" />
                            <Picker.Item label="Quilos (kg)" value="kg" color="#5C4D43" />
                            <Picker.Item label="Mililitros (ml)" value="ml" color="#5C4D43" />
                            <Picker.Item label="Litros (l)" value="l" color="#5C4D43" />
                            <Picker.Item label="Unidades (un)" value="un" color="#5C4D43" />
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                    <Text style={styles.saveButtonText}>Atualizar Insumo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 16 },

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

    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 },
    input: {
        backgroundColor: '#FDFBF7',
        height: 55,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F2E8DF',
        color: '#5C4D43',
        fontSize: 16
    },

    row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    pickerWrapper: {
        flex: 1,
        backgroundColor: '#FDFBF7',
        borderWidth: 1,
        borderColor: '#F2E8DF',
        borderRadius: 16,
        justifyContent: 'center'
    },
    pickerStyle: { color: '#5C4D43' },

    saveButton: {
        backgroundColor: '#D6A284',
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