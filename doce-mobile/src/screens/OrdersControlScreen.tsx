import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function OrdersControlScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('OPEN');

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
            setOrders(response.data.reverse());
        } catch (error) {
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
            Alert.alert('Erro', 'Falha ao atualizar pagamento.');
        }
    };

    const toggleProductionStatus = async (orderId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Entregue' ? 'Pendente' : 'Entregue';
        try {
            const token = await SecureStore.getItemAsync('userToken');
            await api.patch(`/api/orders/${orderId}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar status do pedido.');
        }
    };

    const getFilteredOrders = () => {
        if (filter === 'OPEN') return orders.filter(o => o.status !== 'Entregue');
        if (filter === 'PAYMENT') return orders.filter(o => o.paymentStatus !== 'Pago');
        if (filter === 'PAID') return orders.filter(o => o.paymentStatus === 'Pago');
        return orders;
    };

    const totalToReceive = orders.filter(o => o.paymentStatus !== 'Pago').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalReceived = orders.filter(o => o.paymentStatus === 'Pago').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const renderItem = ({ item }: { item: any }) => {
        const isPaid = item.paymentStatus === 'Pago';
        const isDelivered = item.status === 'Entregue';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.clientName}>{item.client?.name || 'Cliente Removido'}</Text>
                        <Text style={styles.orderId}>Pedido #{item.id}</Text>
                    </View>
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

                    <View style={styles.actionsWrapper}>
                        <TouchableOpacity
                            style={[styles.actionBtn, isDelivered ? styles.btnDelivered : styles.btnProduction]}
                            onPress={() => toggleProductionStatus(item.id, item.status)}
                        >
                            <Text style={[styles.btnText, isDelivered ? styles.textDelivered : styles.textProduction]}>
                                {isDelivered ? 'Entregue' : 'Produção'}
                            </Text>
                        </TouchableOpacity>

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
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity style={[styles.filterBtn, filter === 'OPEN' && styles.filterActive]} onPress={() => setFilter('OPEN')}>
                        <Text style={[styles.filterText, filter === 'OPEN' && styles.filterTextActive]}>Em Produção</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterBtn, filter === 'PAYMENT' && styles.filterActive]} onPress={() => setFilter('PAYMENT')}>
                        <Text style={[styles.filterText, filter === 'PAYMENT' && styles.filterTextActive]}>A Receber</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterBtn, filter === 'PAID' && styles.filterActive]} onPress={() => setFilter('PAID')}>
                        <Text style={[styles.filterText, filter === 'PAID' && styles.filterTextActive]}>Pagos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterBtn, filter === 'ALL' && styles.filterActive]} onPress={() => setFilter('ALL')}>
                        <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>Todos</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {filter === 'PAYMENT' && (
                <View style={[styles.summaryBox, styles.summaryDangerBox]}>
                    <Text style={styles.summaryText}>Falta Receber:</Text>
                    <Text style={styles.summaryValueDanger}>R$ {totalToReceive.toFixed(2)}</Text>
                </View>
            )}

            {filter === 'PAID' && (
                <View style={[styles.summaryBox, styles.summarySuccessBox]}>
                    <Text style={styles.summaryText}>Já Recebido:</Text>
                    <Text style={styles.summaryValueSuccess}>R$ {totalReceived.toFixed(2)}</Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#D6A284" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={getFilteredOrders()}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' }, // Fundo bege bem claro (baunilha)

    // Filtros
    filterBar: { backgroundColor: '#FDFBF7', paddingVertical: 10 },
    filterScroll: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
    filterBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, backgroundColor: '#F2E8DF' }, // Fundo inativo aconchegante
    filterActive: { backgroundColor: '#D6A284' }, // Caramelo suave
    filterText: { color: '#8C7B70', fontWeight: 'bold', fontSize: 14 },
    filterTextActive: { color: '#FFF' },

    // Resumo Financeiro
    summaryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginHorizontal: 16, marginTop: 10, borderRadius: 20 },
    summaryDangerBox: { backgroundColor: '#FCEAE8' }, // Coral clarinho
    summarySuccessBox: { backgroundColor: '#EBF2EA' }, // Verde Sálvia clarinho
    summaryText: { fontSize: 16, color: '#5C4D43', fontWeight: 'bold' },
    summaryValueDanger: { fontSize: 20, fontWeight: '900', color: '#D67D6B' },
    summaryValueSuccess: { fontSize: 20, fontWeight: '900', color: '#8CA680' },

    // Lista e Cards
    listContainer: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#D6A284', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F2E8DF', paddingBottom: 12, marginBottom: 12 },
    clientName: { fontSize: 18, color: '#5C4D43', fontWeight: '900', marginBottom: 4 }, // Marrom escuro ao invés de preto
    orderId: { fontWeight: '600', fontSize: 14, color: '#A3958B' },
    dateBadge: { backgroundColor: '#FDFBF7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    dateText: { color: '#8C7B70', fontSize: 12, fontWeight: 'bold' },

    // Itens
    itemsList: { marginBottom: 16 },
    itemText: { fontSize: 15, color: '#6D5D53', marginBottom: 4 },
    itemQtd: { fontWeight: 'bold', color: '#D6A284' },

    // Rodapé do Card
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    totalText: { fontSize: 20, fontWeight: '900', color: '#5C4D43' },

    // Botões de Status (Estilo Pílula)
    actionsWrapper: { flexDirection: 'row', gap: 8 },
    actionBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },

    btnDelivered: { backgroundColor: '#EBF2EA' }, // Verde suave
    textDelivered: { color: '#8CA680' },

    btnProduction: { backgroundColor: '#FFF4E6' }, // Pêssego/Amarelo suave
    textProduction: { color: '#E0A96D' },

    btnPaid: { backgroundColor: '#EBF2EA' }, // Verde suave
    textPaid: { color: '#8CA680' },

    btnPending: { backgroundColor: '#FCEAE8' }, // Coral suave
    textPending: { color: '#D67D6B' },

    btnText: { fontWeight: 'bold', fontSize: 13 },
    emptyText: { textAlign: 'center', color: '#A3958B', marginTop: 40, fontSize: 16 }
});