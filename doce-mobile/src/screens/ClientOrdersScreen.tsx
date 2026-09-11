import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function ClientOrdersScreen({ route, navigation }: any) {
    const { clientId, clientName } = route.params;
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const fetchOrders = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await api.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const clientOrders = response.data.filter((order: any) => order.client?.id === clientId);
            setOrders(clientOrders.reverse());
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
        } finally {
            setLoading(false);
        }
    };

    const togglePaymentStatus = async (orderId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Pago' ? 'A Receber' : 'Pago';

        try {
            const token = await SecureStore.getItemAsync('userToken');
            await api.patch(`/api/orders/${orderId}/status?paymentStatus=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o));
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o status de pagamento.');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isPaid = item.paymentStatus === 'Pago';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Pedido #{item.id}</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{item.deliveryDate || 'Sem data'}</Text>
                    </View>
                </View>

                <View style={styles.itemsList}>
                    {item.items?.map((orderItem: any, index: number) => (
                        <Text key={index} style={styles.itemText}>
                            <Text style={styles.itemQtd}>{orderItem.quantity}x</Text> {orderItem.product?.name}
                        </Text>
                    ))}
                </View>

                <View style={styles.footerRow}>
                    <Text style={styles.totalText}>R$ {item.totalAmount?.toFixed(2)}</Text>

                    <TouchableOpacity
                        style={[styles.actionBtn, isPaid ? styles.btnPaid : styles.btnPending]}
                        onPress={() => togglePaymentStatus(item.id, item.paymentStatus)}
                    >
                        <Text style={[styles.btnText, isPaid ? styles.textPaid : styles.textPending]}>
                            {isPaid ? 'Pago' : 'A Receber'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitleName}>👤 {clientName}</Text>
                <Text style={styles.headerSubtitle}>Histórico de Encomendas</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#D6A284" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum pedido lançado para este cliente.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddOrder', { clientId })}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' },

    // Cabeçalho Customizado
    headerTitleContainer: { backgroundColor: '#FFF', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F2E8DF', elevation: 1 },
    headerTitleName: { fontSize: 22, fontWeight: '900', color: '#5C4D43' },
    headerSubtitle: { fontSize: 14, color: '#A3958B', marginTop: 4, marginLeft: 2 },

    listContainer: { padding: 16, paddingBottom: 80 },

    // Card
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#D6A284', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F2E8DF', paddingBottom: 12, marginBottom: 12 },
    orderId: { fontWeight: '900', fontSize: 16, color: '#5C4D43' },
    dateBadge: { backgroundColor: '#FDFBF7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    dateText: { color: '#8C7B70', fontSize: 12, fontWeight: 'bold' },

    // Itens
    itemsList: { marginBottom: 16 },
    itemText: { fontSize: 15, color: '#6D5D53', marginBottom: 4 },
    itemQtd: { fontWeight: 'bold', color: '#D6A284' },

    // Rodapé
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    totalText: { fontSize: 20, fontWeight: '900', color: '#5C4D43' },

    // Botões de Status
    actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    btnPaid: { backgroundColor: '#EBF2EA' },
    textPaid: { color: '#8CA680', fontWeight: 'bold', fontSize: 13 },
    btnPending: { backgroundColor: '#FCEAE8' },
    textPending: { color: '#D67D6B', fontWeight: 'bold', fontSize: 13 },

    emptyText: { textAlign: 'center', color: '#A3958B', marginTop: 40, fontSize: 16 },

    // Botão Flutuante (FAB)
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#D6A284', borderRadius: 30, elevation: 5, shadowColor: '#D6A284', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
    fabIcon: { fontSize: 32, color: '#FFF', lineHeight: 36, fontWeight: '300' },
    btnText: {color: undefined, fontSize: undefined, fontWeight: undefined}
});