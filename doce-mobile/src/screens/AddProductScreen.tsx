import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function AddProductScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [availableRecipes, setAvailableRecipes] = useState<any[]>([]);
    const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);

    const [recipesForm, setRecipesForm] = useState([{ recipeId: null, quantity: '1' }]);
    const [ingredientsForm, setIngredientsForm] = useState([{ ingredientId: null, quantity: '1' }]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const [recRes, ingRes] = await Promise.all([
                    api.get('/api/recipes', { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/api/ingredients', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setAvailableRecipes(recRes.data);
                setAvailableIngredients(ingRes.data);
            } catch (error) {
                Alert.alert('Erro', 'Falha ao carregar insumos e receitas.');
            }
        };
        loadData();
    }, []);

    let liveCost = 0;
    recipesForm.forEach(item => {
        const rec = availableRecipes.find(r => r.id === item.recipeId);
        if (rec && rec.yield > 0) liveCost += (rec.totalCost / rec.yield) * (Number(item.quantity) || 0);
    });
    ingredientsForm.forEach(item => {
        const ing = availableIngredients.find(i => i.id === item.ingredientId);
        if (ing && ing.packageQuantity > 0) liveCost += (ing.packagePrice / ing.packageQuantity) * (Number(item.quantity) || 0);
    });

    const liveProfit = (parseFloat(salePrice.replace(',', '.')) || 0) - liveCost;

    const handleSave = async () => {
        if (!name || !salePrice) return Alert.alert('Erro', 'Preencha nome e preço de venda.');

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const payload = {
                name,
                salePrice: parseFloat(salePrice.replace(',', '.')),
                recipes: recipesForm.filter(r => r.recipeId).map(r => ({ recipe: { id: r.recipeId }, quantity: parseInt(r.quantity, 10) })),
                ingredients: ingredientsForm.filter(i => i.ingredientId).map(i => ({ ingredient: { id: i.ingredientId }, quantityUsed: parseFloat(i.quantity.replace(',', '.')) }))
            };

            await api.post('/api/products', payload, { headers: { Authorization: `Bearer ${token}` } });
            Alert.alert('Sucesso', 'Produto criado!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o produto.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Painel Financeiro */}
                <View style={styles.dashboardCard}>
                    <View style={styles.dashboardCol}>
                        <Text style={styles.dashLabel}>Custo Estimado</Text>
                        <Text style={styles.dashValueDanger}>R$ {liveCost.toFixed(2)}</Text>
                    </View>
                    <View style={styles.dashDivider} />
                    <View style={styles.dashboardCol}>
                        <Text style={styles.dashLabel}>Lucro Limpo</Text>
                        <Text style={[styles.dashValueSuccess, liveProfit < 0 && styles.dashValueDanger]}>
                            R$ {liveProfit.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Dados Principais */}
                <View style={styles.formCard}>
                    <Text style={styles.label}>Nome da Caixa / Kit</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Caixa 6 Brigadeiros" placeholderTextColor="#A3958B" />

                    <Text style={styles.label}>Preço de Venda (R$)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={salePrice} onChangeText={setSalePrice} placeholder="Ex: 35.00" placeholderTextColor="#A3958B" />
                </View>

                {/* Doces */}
                <Text style={styles.sectionTitle}>Doces Inclusos</Text>
                <View style={styles.formCard}>
                    {recipesForm.map((item, index) => (
                        <View key={`rec-${index}`} style={styles.itemRow}>
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={item.recipeId} onValueChange={(val) => { const newForm = [...recipesForm]; newForm[index].recipeId = val; setRecipesForm(newForm); }} style={styles.pickerStyle}>
                                    <Picker.Item label="Selecione o Doce..." value={null} color="#A3958B" />
                                    {availableRecipes.map(r => <Picker.Item key={r.id} label={r.name} value={r.id} color="#5C4D43" />)}
                                </Picker>
                            </View>
                            <TextInput style={styles.qtdInput} placeholder="Qtd" placeholderTextColor="#A3958B" keyboardType="numeric" value={item.quantity} onChangeText={(val) => { const newForm = [...recipesForm]; newForm[index].quantity = val; setRecipesForm(newForm); }} />
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => setRecipesForm([...recipesForm, { recipeId: null, quantity: '1' }])}>
                        <Text style={styles.addText}>+ Adicionar outro doce</Text>
                    </TouchableOpacity>
                </View>

                {/* Embalagens */}
                <Text style={styles.sectionTitle}>Embalagens / Extras</Text>
                <View style={styles.formCard}>
                    {ingredientsForm.map((item, index) => (
                        <View key={`ing-${index}`} style={styles.itemRow}>
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={item.ingredientId} onValueChange={(val) => { const newForm = [...ingredientsForm]; newForm[index].ingredientId = val; setIngredientsForm(newForm); }} style={styles.pickerStyle}>
                                    <Picker.Item label="Selecione a Embalagem..." value={null} color="#A3958B" />
                                    {availableIngredients.map(i => <Picker.Item key={i.id} label={i.name} value={i.id} color="#5C4D43" />)}
                                </Picker>
                            </View>
                            <TextInput style={styles.qtdInput} placeholder="Qtd" placeholderTextColor="#A3958B" keyboardType="numeric" value={item.quantity} onChangeText={(val) => { const newForm = [...ingredientsForm]; newForm[index].quantity = val; setIngredientsForm(newForm); }} />
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => setIngredientsForm([...ingredientsForm, { ingredientId: null, quantity: '1' }])}>
                        <Text style={styles.addText}>+ Adicionar embalagem</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar Produto</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' },
    scrollContainer: { padding: 16, paddingBottom: 40 },

    // Dashboard
    dashboardCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 2, shadowColor: '#D6A284', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    dashboardCol: { flex: 1, alignItems: 'center' },
    dashDivider: { width: 1, backgroundColor: '#F2E8DF', marginHorizontal: 10 },
    dashLabel: { fontSize: 13, color: '#8C7B70', fontWeight: 'bold', marginBottom: 4 },
    dashValueDanger: { fontSize: 20, fontWeight: '900', color: '#D67D6B' },
    dashValueSuccess: { fontSize: 20, fontWeight: '900', color: '#8CA680' },

    // Cards e Inputs
    formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 1, shadowColor: '#D6A284', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C4D43', marginBottom: 12, marginLeft: 4 },
    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 },
    input: { backgroundColor: '#FDFBF7', height: 55, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F2E8DF', color: '#5C4D43', fontSize: 16 },

    // Linhas dinâmicas
    itemRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    pickerWrapper: { flex: 1, backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#F2E8DF', borderRadius: 16, justifyContent: 'center' },
    pickerStyle: { color: '#5C4D43' },
    qtdInput: { width: 70, backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#F2E8DF', borderRadius: 16, textAlign: 'center', color: '#5C4D43', fontSize: 16, fontWeight: 'bold' },
    addText: { color: '#D6A284', fontWeight: 'bold', marginTop: 4, marginBottom: 4, marginLeft: 4, fontSize: 15 },

    // Botão Salvar
    saveButton: { backgroundColor: '#D6A284', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#D6A284', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, marginTop: 10 },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});