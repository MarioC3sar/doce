import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Ingredient {
    id: number;
    name: string;
    packagePrice: number;
    packageQuantity: number;
    unit: string;
    unitCost: number;
}

export default function IngredientsScreen({ navigation }: any) {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchIngredients();
        }, [])
    );

    const fetchIngredients = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await api.get('/api/ingredients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIngredients(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os insumos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Excluir Insumo',
            `Tem certeza que deseja excluir ${name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('userToken');
                            await api.delete(`/api/ingredients/${id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            // Atualiza a lista removendo o item deletado da tela
                            setIngredients(prev => prev.filter(item => item.id !== id));
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Erro', 'Não foi possível excluir. O item pode estar em uso em uma receita.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Ingredient }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.cardRow}>
                <Text style={styles.cardText}>
                    Embalagem: {item.packageQuantity}{item.unit} por R$ {item.packagePrice.toFixed(2)}
                </Text>
            </View>


            {/* Botões de Ação */}
            <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => navigation.navigate('EditIngredient', { ingredient: item })}>
                    <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                    <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={ingredients}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum insumo cadastrado.</Text>}
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddIngredient')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    listContainer: { padding: 16, paddingBottom: 80 }, // Espaço extra pro botão flutuante não cobrir o último item
    card: {
        backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1,
        borderColor: '#E0E0E0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    cardText: { fontSize: 14, color: '#666' },
    costText: { fontSize: 14, fontWeight: 'bold', color: '#4A90E2' },
    actionRow: {
        flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1,
        borderTopColor: '#EEE', paddingTop: 12, gap: 16
    },
    editText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 },
    deleteText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 14 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 16 },
    fab: {
        position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center',
        right: 20, bottom: 20, backgroundColor: '#4A90E2', borderRadius: 30, elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
    },
    fabIcon: { fontSize: 30, color: '#FFF', lineHeight: 34 }
});