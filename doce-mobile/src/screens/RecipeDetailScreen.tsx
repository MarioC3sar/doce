import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface RecipeItem {
    id: number;
    ingredient: {
        name: string;
        unit: string;
    };
    quantityUsed: number;
    calculatedCost: number; // ou o nome que seu backend dá para o custo desse item
}

interface RecipeDetail {
    id: number;
    name: string;
    yield: number;
    totalCost: number;
    items: RecipeItem[];
}

export default function RecipeDetailScreen({ route }: any) {
    const { recipeId } = route.params; // Recebe o ID da tela anterior
    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipeDetails();
    }, []);

    const fetchRecipeDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            // Busca os detalhes de UMA receita específica pelo ID
            const response = await api.get(`/api/recipes/${recipeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipe(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da receita.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />;
    }

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Receita não encontrada.</Text>
            </View>
        );
    }

    const unitCost = recipe.yield > 0 ? (recipe.totalCost / recipe.yield) : 0;

    const renderItem = ({ item }: { item: RecipeItem }) => (
        <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.ingredient.name}</Text>
            <View style={styles.itemRow}>
                <Text style={styles.itemText}>
                    Usado: {item.quantityUsed} {item.ingredient.unit}
                </Text>
                {/* Se o seu backend chamar o custo do item de outro nome, ajuste o "calculatedCost" abaixo */}
                <Text style={styles.itemCost}>R$ {item.calculatedCost ? item.calculatedCost.toFixed(2) : '0.00'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Cabeçalho da Receita */}
            <View style={styles.headerCard}>
                <Text style={styles.headerTitle}>{recipe.name}</Text>
                <View style={styles.headerRow}>
                    <Text style={styles.headerText}>Rendimento: {recipe.yield} un.</Text>
                    <Text style={styles.headerText}>Custo Total: R$ {recipe.totalCost.toFixed(2)}</Text>
                </View>
                <View style={styles.headerRow}>
                    <Text style={styles.unitCostText}>Custo por Unidade: R$ {unitCost.toFixed(4)}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Insumos Utilizados</Text>

            {/* Lista de Insumos */}
            <FlatList
                data={recipe.items}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum insumo encontrado nesta receita.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    listContainer: { padding: 16, paddingBottom: 40 },
    headerCard: { backgroundColor: '#4A90E2', padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 16, elevation: 3 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    headerText: { fontSize: 16, color: '#FFF' },
    unitCostText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 16, marginBottom: 8 },
    itemCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
    itemText: { fontSize: 14, color: '#666' },
    itemCost: { fontSize: 14, fontWeight: 'bold', color: '#E67E22' }, // Laranja para o custo do item
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 16 },
});