import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Product {
    id: number;
    name: string;
    salePrice: number;
    totalCost: number;
}

export default function ProductsScreen({ navigation }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await api.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os produtos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert('Excluir Produto', `Tem certeza que deseja excluir a "${name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        await api.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setProducts(prev => prev.filter(item => item.id !== id));
                    } catch (error) {
                        Alert.alert('Erro', 'Não foi possível excluir.');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Product }) => {
        const profit = item.salePrice - item.totalCost;
        const profitMargin = item.totalCost > 0 ? (profit / item.totalCost) * 100 : 0;

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                {/* Métricas do Produto em formato de Pílulas */}
                <View style={styles.metricsContainer}>
                    <View style={styles.metricColumn}>
                        <Text style={styles.metricLabel}>Custo</Text>
                        <View style={[styles.pill, styles.pillDanger]}>
                            <Text style={styles.textDanger}>R$ {item.totalCost.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.metricColumn}>
                        <Text style={styles.metricLabel}>Venda</Text>
                        <View style={[styles.pill, styles.pillNeutral]}>
                            <Text style={styles.textNeutral}>R$ {item.salePrice.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.metricColumn}>
                        <Text style={styles.metricLabel}>Lucro ({profitMargin.toFixed(0)}%)</Text>
                        <View style={[styles.pill, styles.pillSuccess]}>
                            <Text style={styles.textSuccess}>R$ {profit.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Botões de Ação */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnEdit]} onPress={() => navigation.navigate('EditProduct', { productId: item.id })}>
                        <Text style={styles.textEdit}>Editar Produto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={() => handleDelete(item.id, item.name)}>
                        <Text style={styles.textDelete}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#D6A284" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma caixa ou produto cadastrado.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProduct')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' }, // Fundo baunilha
    listContainer: { padding: 16, paddingBottom: 80 },

    // Card Principal
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#D6A284', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    cardTitle: { fontSize: 20, fontWeight: '900', color: '#5C4D43', marginBottom: 16 }, // Marrom escuro

    // Métricas (Pílulas)
    metricsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    metricColumn: { alignItems: 'center', flex: 1 },
    metricLabel: { fontSize: 12, color: '#A3958B', fontWeight: 'bold', marginBottom: 4 },
    pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, width: '90%', alignItems: 'center' },

    pillDanger: { backgroundColor: '#FCEAE8' },
    textDanger: { color: '#D67D6B', fontWeight: 'bold', fontSize: 13 },

    pillNeutral: { backgroundColor: '#F2E8DF' },
    textNeutral: { color: '#8C7B70', fontWeight: 'bold', fontSize: 13 },

    pillSuccess: { backgroundColor: '#EBF2EA' },
    textSuccess: { color: '#8CA680', fontWeight: 'bold', fontSize: 13 },

    // Botões de Ação
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F2E8DF', paddingTop: 16, gap: 12 },
    actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },

    btnEdit: { backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#D6A284' }, // Fundo claro com borda caramelo
    textEdit: { color: '#D6A284', fontWeight: 'bold', fontSize: 14 },

    btnDelete: { backgroundColor: '#FCEAE8' }, // Fundo coral
    textDelete: { color: '#D67D6B', fontWeight: 'bold', fontSize: 14 },

    emptyText: { textAlign: 'center', color: '#A3958B', marginTop: 40, fontSize: 16 },

    // Botão Flutuante (FAB)
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#D6A284', borderRadius: 30, elevation: 5, shadowColor: '#D6A284', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
    fabIcon: { fontSize: 32, color: '#FFF', lineHeight: 36, fontWeight: '300' }
});