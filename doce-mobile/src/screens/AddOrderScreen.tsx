import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export default function AddOrderScreen({ route, navigation }: any) {
    const { clientId } = route.params;

    const [deliveryDate, setDeliveryDate] = useState('');
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [itemsForm, setItemsForm] = useState([{ productId: null, quantity: '1' }]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const response = await api.get('/api/products', { headers: { Authorization: `Bearer ${token}` } });
                setAvailableProducts(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os produtos.');
            }
        };
        fetchProducts();
    }, []);

    const handleSave = async () => {
        const validItems = itemsForm.filter(i => i.productId && parseInt(i.quantity) > 0);
        if (validItems.length === 0) return Alert.alert('Erro', 'Adicione pelo menos um produto válido ao pedido.');

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const payload = {
                client: { id: clientId },
                deliveryDate: deliveryDate,
                paymentStatus: 'A Receber',
                status: 'Pendente',
                items: validItems.map(i => ({
                    product: { id: i.productId },
                    quantity: parseInt(i.quantity, 10)
                }))
            };

            await api.post('/api/orders', payload, { headers: { Authorization: `Bearer ${token}` } });

            Alert.alert('Sucesso', 'Pedido registrado com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar o pedido.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formCard}>
                <Text style={styles.label}>Data e Hora de Entrega (Opcional)</Text>
                <TextInput
                    style={styles.input}
                    value={deliveryDate}
                    onChangeText={setDeliveryDate}
                    placeholder="Ex: 25/12/2026 às 14:00"
                    placeholderTextColor="#A3958B"
                />

                <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                {itemsForm.map((item, index) => (
                    <View key={`item-${index}`} style={styles.itemRow}>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={item.productId}
                                onValueChange={(val) => {
                                    const newForm = [...itemsForm];
                                    newForm[index].productId = val;
                                    setItemsForm(newForm);
                                }}
                                style={styles.pickerStyle}
                            >
                                <Picker.Item label="Selecione a Caixa/Doce..." value={null} color="#A3958B" />
                                {availableProducts.map(p => (
                                    <Picker.Item key={p.id} label={`${p.name} (R$ ${p.salePrice.toFixed(2)})`} value={p.id} color="#5C4D43" />
                                ))}
                            </Picker>
                        </View>
                        <TextInput
                            style={styles.qtdInput}
                            placeholder="Qtd"
                            placeholderTextColor="#A3958B"
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(val) => {
                                const newForm = [...itemsForm];
                                newForm[index].quantity = val;
                                setItemsForm(newForm);
                            }}
                        />
                    </View>
                ))}

                <TouchableOpacity onPress={() => setItemsForm([...itemsForm, { productId: null, quantity: '1' }])}>
                    <Text style={styles.addText}>+ Adicionar outro item</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Confirmar Pedido</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 16 }, // Fundo baunilha

    // Card Principal
    formCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 24,
        elevation: 2,
        shadowColor: '#D6A284',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 20
    },

    // Textos e Inputs
    label: { fontSize: 14, color: '#8C7B70', marginBottom: 8, fontWeight: 'bold', marginLeft: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C4D43', marginBottom: 16, marginTop: 10, marginLeft: 4 },
    input: {
        backgroundColor: '#FDFBF7',
        height: 55,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F2E8DF',
        color: '#5C4D43',
        fontSize: 16
    },

    // Linha de Itens (Picker + Qtd)
    itemRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    pickerWrapper: {
        flex: 1,
        backgroundColor: '#FDFBF7',
        borderWidth: 1,
        borderColor: '#F2E8DF',
        borderRadius: 16,
        justifyContent: 'center'
    },
    pickerStyle: { color: '#5C4D43' },
    qtdInput: {
        width: 75,
        backgroundColor: '#FDFBF7',
        borderWidth: 1,
        borderColor: '#F2E8DF',
        borderRadius: 16,
        textAlign: 'center',
        color: '#5C4D43',
        fontSize: 16,
        fontWeight: 'bold'
    },

    // Botões
    addText: { color: '#D6A284', fontWeight: 'bold', marginBottom: 24, marginLeft: 4, fontSize: 15 },
    saveButton: {
        backgroundColor: '#D6A284',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#D6A284',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});