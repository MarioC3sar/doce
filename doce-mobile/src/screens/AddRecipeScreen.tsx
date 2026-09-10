import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
    ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface RecipeItemForm {
    ingredientId: number | null;
    quantityUsed: string;
}

export default function AddRecipeScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [recipeYield, setRecipeYield] = useState('');
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    // Inicia a receita com pelo menos 1 item vazio
    const [items, setItems] = useState<RecipeItemForm[]>([{ ingredientId: null, quantityUsed: '' }]);

    // Busca os insumos para preencher a lista do Picker
    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await api.get('/api/ingredients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableIngredients(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de insumos.');
        }
    };

    // Funções para gerenciar os itens dinâmicos
    const addEmptyItem = () => {
        setItems([...items, { ingredientId: null, quantityUsed: '' }]);
    };

    const removeItem = (indexToRemove: number) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const updateItem = (index: number, field: 'ingredientId' | 'quantityUsed', value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    // Envio para o backend
    const handleSave = async () => {
        if (!name || !recipeYield) {
            Alert.alert('Atenção', 'Preencha o nome e o rendimento da receita.');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um insumo à receita.');
            return;
        }

        // Valida se todos os itens da lista foram preenchidos
        const hasInvalidItem = items.some(item => !item.ingredientId || !item.quantityUsed);
        if (hasInvalidItem) {
            Alert.alert('Atenção', 'Selecione o insumo e preencha a quantidade em todos os itens.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Monta o JSON no formato exato que o Spring Boot espera
            const payload = {
                name: name,
                yield: parseInt(recipeYield, 10),
                items: items.map(item => ({
                    ingredient: { id: item.ingredientId },
                    quantityUsed: parseFloat(item.quantityUsed.replace(',', '.'))
                }))
            };

            await api.post('/api/recipes', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Sucesso', 'Ficha Técnica criada com sucesso!');
            navigation.goBack(); // Volta para a aba de Receitas

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar a receita.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* DADOS DA RECEITA */}
                <View style={styles.section}>
                    <Text style={styles.label}>Nome da Ficha Técnica</Text>
                    <TextInput style={styles.input} placeholder="Ex: Massa de Brigadeiro" value={name} onChangeText={setName} />

                    <Text style={styles.label}>Rendimento (Unidades)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="Ex: 40" value={recipeYield} onChangeText={setRecipeYield} />
                </View>

                {/* LISTA DE INSUMOS */}
                <Text style={styles.sectionTitle}>Insumos Utilizados</Text>

                {items.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={item.ingredientId}
                                onValueChange={(value) => updateItem(index, 'ingredientId', value)}
                            >
                                <Picker.Item label="Selecione um insumo..." value={null} color="#999" />
                                {availableIngredients.map(ing => (
                                    <Picker.Item key={ing.id} label={`${ing.name} (${ing.unit})`} value={ing.id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.itemRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Qtd. Usada na panela"
                                keyboardType="numeric"
                                value={item.quantityUsed}
                                onChangeText={(text) => updateItem(index, 'quantityUsed', text)}
                            />
                            {items.length > 1 && (
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(index)}>
                                    <Text style={styles.removeButtonText}>X</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addItemButton} onPress={addEmptyItem}>
                    <Text style={styles.addItemButtonText}>+ Adicionar Insumo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Ficha Técnica</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContainer: { padding: 16, paddingBottom: 40 },
    section: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 20, elevation: 1 },
    label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: 'bold' },
    input: { backgroundColor: '#F9F9F9', height: 50, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    itemCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', elevation: 1 },
    pickerContainer: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#F9F9F9', marginBottom: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    removeButton: { backgroundColor: '#E74C3C', height: 50, width: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    removeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    addItemButton: { backgroundColor: '#E8F4FD', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#4A90E2', borderStyle: 'dashed' },
    addItemButtonText: { color: '#4A90E2', fontWeight: 'bold' },
    saveButton: { backgroundColor: '#27AE60', height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});