import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Recipe {
    id: number;
    name: string;
    yield: number;
    totalCost: number;
}

export default function RecipesScreen({ navigation }: any) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchRecipes();
        }, [])
    );

    const fetchRecipes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await api.get('/api/recipes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar as receitas.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Excluir Ficha Técnica',
            `Tem certeza que deseja excluir a receita de ${name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('userToken');
                            await api.delete(`/api/recipes/${id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            // Remove a receita da tela instantaneamente
                            setRecipes(prev => prev.filter(item => item.id !== id));
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Erro', 'Não foi possível excluir a receita.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Recipe }) => {
        // Proteção matemática: evita divisão por zero caso o rendimento venha zerado
        const unitCost = item.yield > 0 ? (item.totalCost / item.yield) : 0;

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <View style={styles.cardRow}>
                    <Text style={styles.cardText}>Rendimento: {item.yield} un.</Text>
                    <Text style={styles.totalCostText}>Custo Total: R$ {item.totalCost.toFixed(2)}</Text>
                </View>

                <View style={styles.cardRow}>
                    <Text style={styles.unitCostText}>
                        Custo/Unidade: R$ {unitCost.toFixed(4)}
                    </Text>
                </View>

                {/* Botão de Excluir */}
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
                        <Text style={styles.detailText}>Ver Detalhes</Text>
                    </TouchableOpacity>

                    {/* NOVO BOTÃO DE EDITAR */}
                    <TouchableOpacity onPress={() => navigation.navigate('EditRecipe', { recipeId: item.id })}>
                        <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                        <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ficha técnica cadastrada.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    listContainer: { padding: 16, paddingBottom: 80 },
    card: {
        backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1,
        borderColor: '#E0E0E0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardText: { fontSize: 14, color: '#666' },
    totalCostText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
    unitCostText: { fontSize: 16, fontWeight: 'bold', color: '#27AE60' }, // Verde destacado
    deleteText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 14 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 16 },
    fab: {
        position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center',
        right: 20, bottom: 20, backgroundColor: '#4A90E2', borderRadius: 30, elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
    },
    fabIcon: { fontSize: 30, color: '#FFF', lineHeight: 34 },
    detailText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 },
    actionRow: {
        flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1,
        borderTopColor: '#EEE', paddingTop: 12, gap: 16 // <-- Adicionado gap: 16
    },
    editText: { color: '#F39C12', fontWeight: 'bold', fontSize: 14 }, // <-- Laranja/Amarelo para Editar
});