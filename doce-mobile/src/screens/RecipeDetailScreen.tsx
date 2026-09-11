import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function RecipeDetailScreen({ route }: any) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await api.get(`/api/recipes/${recipeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecipe(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar a ficha técnica.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [recipeId]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#D6A284" />
            </View>
        );
    }

    if (!recipe) return null;

    const unitCost = recipe.yield > 0 ? recipe.totalCost / recipe.yield : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

            <View style={styles.headerCard}>
                <Text style={styles.recipeName}>{recipe.name}</Text>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Custo da Panela</Text>
                        <Text style={styles.metricValueDanger}>R$ {recipe.totalCost.toFixed(2)}</Text>
                    </View>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Rendimento</Text>
                        <Text style={styles.metricValueNeutral}>{recipe.yield} un</Text>
                    </View>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricLabel}>Custo Unitário</Text>
                        <Text style={styles.metricValueSuccess}>R$ {unitCost.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Insumos Utilizados</Text>

            <View style={styles.ingredientsCard}>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((item: any, index: number) => {
                        const ing = item.ingredient;
                        // Proteção extra caso o insumo original tenha sido apagado do banco
                        if (!ing) return null;

                        const itemCost = ing.unitCost * item.quantityUsed;
                        return (
                            <View key={index} style={styles.ingredientRow}>
                                <View style={styles.ingredientInfo}>
                                    <Text style={styles.ingredientName}>{ing.name}</Text>
                                    <Text style={styles.ingredientQtd}>
                                        Usado: {item.quantityUsed} {ing.unit}
                                    </Text>
                                </View>
                                <Text style={styles.ingredientCost}>R$ {itemCost.toFixed(2)}</Text>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.emptyText}>Nenhum insumo registrado nesta ficha.</Text>
                )}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' },
    scrollContent: { padding: 16, paddingBottom: 40 },

    // Cabeçalho / Resumo
    headerCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 24, elevation: 2, shadowColor: '#D6A284', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    recipeName: { fontSize: 24, fontWeight: '900', color: '#5C4D43', marginBottom: 20, textAlign: 'center' },

    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    metricBox: { flex: 1, backgroundColor: '#FDFBF7', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F2E8DF' },
    metricLabel: { fontSize: 11, color: '#A3958B', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    metricValueDanger: { fontSize: 15, fontWeight: '900', color: '#D67D6B' },
    metricValueNeutral: { fontSize: 15, fontWeight: '900', color: '#8C7B70' },
    metricValueSuccess: { fontSize: 15, fontWeight: '900', color: '#8CA680' },

    // Lista de Insumos
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C4D43', marginBottom: 12, marginLeft: 4 },
    ingredientsCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, elevation: 1, shadowColor: '#D6A284', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },

    ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2E8DF' },
    ingredientInfo: { flex: 1 },
    ingredientName: { fontSize: 16, fontWeight: 'bold', color: '#5C4D43', marginBottom: 4 },
    ingredientQtd: { fontSize: 13, color: '#A3958B' },
    ingredientCost: { fontSize: 16, fontWeight: 'bold', color: '#D6A284' },
    emptyText: { textAlign: 'center', color: '#A3958B', fontStyle: 'italic', paddingVertical: 10 }
});