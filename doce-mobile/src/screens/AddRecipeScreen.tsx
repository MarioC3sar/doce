import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function AddRecipeScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [recipeYield, setRecipeYield] = useState('');
    const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);

    // Lista dinâmica de insumos
    const [ingredientsForm, setIngredientsForm] = useState([{ ingredientId: null, quantityUsed: '' }]);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await api.get('/api/ingredients', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableIngredients(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os insumos.');
            }
        };
        fetchIngredients();
    }, []);

    const handleSave = async () => {
        if (!name || !recipeYield) return Alert.alert('Erro', 'Preencha o nome e o rendimento da receita.');

        // Filtra apenas as linhas preenchidas corretamente
        const validIngredients = ingredientsForm.filter(item => item.ingredientId && parseFloat(item.quantityUsed) > 0);
        if (validIngredients.length === 0) return Alert.alert('Erro', 'Adicione pelo menos um insumo válido.');

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const payload = {
                name,
                yield: parseInt(recipeYield, 10),
                ingredients: validIngredients.map(item => ({
                    ingredient: { id: item.ingredientId },
                    quantityUsed: parseFloat(item.quantityUsed.replace(',', '.'))
                }))
            };

            await api.post('/api/recipes', payload, { headers: { Authorization: `Bearer ${token}` } });
            Alert.alert('Sucesso', 'Ficha técnica montada com sucesso!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar a receita.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Nome da Receita</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Brigadeiro Tradicional"
                        placeholderTextColor="#A3958B"
                    />

                    <Text style={styles.label}>Rendimento (Unidades/Porções)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={recipeYield}
                        onChangeText={setRecipeYield}
                        placeholder="Ex: 30"
                        placeholderTextColor="#A3958B"
                    />
                </View>

                <Text style={styles.sectionTitle}>Insumos da Receita</Text>
                <View style={styles.formCard}>
                    {ingredientsForm.map((item, index) => (
                        <View key={`ing-${index}`} style={styles.itemRow}>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={item.ingredientId}
                                    onValueChange={(val) => {
                                        const newForm = [...ingredientsForm];
                                        newForm[index].ingredientId = val;
                                        setIngredientsForm(newForm);
                                    }}
                                    style={styles.pickerStyle}
                                >
                                    <Picker.Item label="Selecione o Insumo..." value={null} color="#A3958B" />
                                    {availableIngredients.map(ing => (
                                        <Picker.Item key={ing.id} label={`${ing.name} (${ing.unit})`} value={ing.id} color="#5C4D43" />
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                style={styles.qtdInput}
                                placeholder="Qtd"
                                placeholderTextColor="#A3958B"
                                keyboardType="numeric"
                                value={item.quantityUsed}
                                onChangeText={(val) => {
                                    const newForm = [...ingredientsForm];
                                    newForm[index].quantityUsed = val;
                                    setIngredientsForm(newForm);
                                }}
                            />
                        </View>
                    ))}

                    <TouchableOpacity onPress={() => setIngredientsForm([...ingredientsForm, { ingredientId: null, quantityUsed: '' }])}>
                        <Text style={styles.addText}>+ Adicionar outro insumo</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Ficha Técnica</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' },
    scrollContainer: { padding: 16, paddingBottom: 40 },

    formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 1, shadowColor: '#D6A284', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C4D43', marginBottom: 12, marginLeft: 4 },
    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 },
    input: { backgroundColor: '#FDFBF7', height: 55, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F2E8DF', color: '#5C4D43', fontSize: 16 },

    itemRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    pickerWrapper: { flex: 1, backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#F2E8DF', borderRadius: 16, justifyContent: 'center' },
    pickerStyle: { color: '#5C4D43' },
    qtdInput: { width: 75, backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#F2E8DF', borderRadius: 16, textAlign: 'center', color: '#5C4D43', fontSize: 16, fontWeight: 'bold' },
    addText: { color: '#D6A284', fontWeight: 'bold', marginTop: 4, marginBottom: 4, marginLeft: 4, fontSize: 15 },

    saveButton: { backgroundColor: '#D6A284', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#D6A284', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, marginTop: 10 },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});