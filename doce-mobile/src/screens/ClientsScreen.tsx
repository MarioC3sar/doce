import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Client {
    id: number;
    name: string;
    phone: string;
    address: string;
}

export default function ClientsScreen({ navigation }: any) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchClients();
        }, [])
    );

    const fetchClients = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await api.get('/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os clientes.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert('Excluir Cliente', `Tem certeza que deseja excluir ${name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        await api.delete(`/api/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setClients(prev => prev.filter(item => item.id !== id));
                    } catch (error) {
                        Alert.alert('Erro', 'Não foi possível excluir.');
                    }
                }
            }
        ]);
    };

    const openWhatsApp = (phone: string, name: string) => {
        if (!phone) return Alert.alert('Atenção', 'Este cliente não possui telefone cadastrado.');
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá, ${name}! Tudo bem?`;
        Linking.openURL(`whatsapp://send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`);
    };

    const renderItem = ({ item }: { item: Client }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{item.name}</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>📞  {item.phone || 'Sem telefone'}</Text>
                <Text style={styles.infoText}>📍  {item.address || 'Sem endereço'}</Text>
            </View>

            {/* Grid 2x2 para os botões ficarem perfeitamente alinhados */}
            <View style={styles.actionGrid}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnOrders]}
                    onPress={() => navigation.navigate('ClientOrders', { clientId: item.id, clientName: item.name })}
                >
                    <Text style={styles.textOrders}>📦 Pedidos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnWhatsApp]}
                    onPress={() => openWhatsApp(item.phone, item.name)}
                >
                    <Text style={styles.textWhatsApp}>💬 WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnEdit]}
                    onPress={() => navigation.navigate('EditClient', { clientId: item.id })}
                >
                    <Text style={styles.textEdit}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnDelete]}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Text style={styles.textDelete}>🗑️ Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#D6A284" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={clients}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum cliente cadastrado.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddClient')}>
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
    cardHeader: { borderBottomWidth: 1, borderBottomColor: '#F2E8DF', paddingBottom: 12, marginBottom: 12 },
    clientName: { fontSize: 20, fontWeight: '900', color: '#5C4D43' }, // Marrom escuro

    // Informações
    infoContainer: { marginBottom: 16, gap: 6 },
    infoText: { fontSize: 15, color: '#6D5D53' }, // Marrom suave

    // Grid de Botões
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
    actionBtn: { width: '48%', paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

    btnOrders: { backgroundColor: '#F2E8DF' }, // Caramelo super claro
    textOrders: { color: '#8C7B70', fontWeight: 'bold', fontSize: 13 },

    btnWhatsApp: { backgroundColor: '#EBF2EA' }, // Verde Sálvia
    textWhatsApp: { color: '#8CA680', fontWeight: 'bold', fontSize: 13 },

    btnEdit: { backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#E0A96D' }, // Contorno baunilha/pêssego
    textEdit: { color: '#E0A96D', fontWeight: 'bold', fontSize: 13 },

    btnDelete: { backgroundColor: '#FCEAE8' }, // Coral clarinho
    textDelete: { color: '#D67D6B', fontWeight: 'bold', fontSize: 13 },

    emptyText: { textAlign: 'center', color: '#A3958B', marginTop: 40, fontSize: 16 },

    // Botão Flutuante (FAB)
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#D6A284', borderRadius: 30, elevation: 5, shadowColor: '#D6A284', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
    fabIcon: { fontSize: 32, color: '#FFF', lineHeight: 36, fontWeight: '300' }
});