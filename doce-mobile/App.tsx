import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import IngredientsScreen from './src/screens/IngredientsScreen';
import AddIngredientScreen from './src/screens/AddIngredientScreen';
import EditIngredientScreen from './src/screens/EditIngredientScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import EditRecipeScreen from './src/screens/EditRecipeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import AddClientScreen from './src/screens/AddClientScreen';
import EditClientScreen from './src/screens/EditClientScreen';
import ClientOrdersScreen from './src/screens/ClientOrdersScreen';
import AddOrderScreen from './src/screens/AddOrderScreen';
import OrdersControlScreen from './src/screens/OrdersControlScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- COR DE DESTAQUE DO APP ---
const PRIMARY_COLOR = '#8E44AD'; // Um roxo elegante e moderno

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;
                    if (route.name === 'Insumos') iconName = focused ? 'basket' : 'basket-outline';
                    else if (route.name === 'Receitas') iconName = focused ? 'restaurant' : 'restaurant-outline';
                    else if (route.name === 'Produtos') iconName = focused ? 'gift' : 'gift-outline';
                    else if (route.name === 'Clientes') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Controle') iconName = focused ? 'clipboard' : 'clipboard-outline';
                    else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

                    // Aumenta levemente o ícone se estiver selecionado
                    return <Ionicons name={iconName} size={focused ? size + 4 : size} color={color} />;
                },
                tabBarActiveTintColor: PRIMARY_COLOR,
                tabBarInactiveTintColor: '#A6ACAF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 15, // Sombra suave no Android
                    shadowColor: '#000', // Sombra suave no iOS
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    height: 70, // Mais alta para não espremer os dedos
                    paddingBottom: 12,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: PRIMARY_COLOR,
                    elevation: 0, // Remove a linha separadora do cabeçalho
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFF',
                headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            })}
        >
            <Tab.Screen name="Controle" component={OrdersControlScreen} />
            <Tab.Screen name="Produtos" component={ProductsScreen} />
            <Tab.Screen name="Clientes" component={ClientsScreen} />
            <Tab.Screen name="Receitas" component={RecipesScreen} />
            <Tab.Screen name="Insumos" component={IngredientsScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: { backgroundColor: PRIMARY_COLOR, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerBackTitleVisible: false, // Remove aquele texto "Back" no iOS
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

                <Stack.Screen name="AddIngredient" component={AddIngredientScreen} options={{ title: 'Novo Insumo' }} />
                <Stack.Screen name="EditIngredient" component={EditIngredientScreen} options={{ title: 'Editar Insumo' }} />

                <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Montar Ficha Técnica' }} />
                <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalhes da Ficha' }} />
                <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Editar Ficha' }} />

                <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Novo Produto' }} />
                <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Editar Produto' }} />

                <Stack.Screen name="AddClient" component={AddClientScreen} options={{ title: 'Novo Cliente' }} />
                <Stack.Screen name="EditClient" component={EditClientScreen} options={{ title: 'Editar Cliente' }} />

                <Stack.Screen name="ClientOrders" component={ClientOrdersScreen} options={{ title: 'Histórico' }} />
                <Stack.Screen name="AddOrder" component={AddOrderScreen} options={{ title: 'Novo Pedido' }} />
            </Stack.Navigator>
            {/* Barra de status clara para combinar com o cabeçalho roxo */}
            <StatusBar style="light" />
        </NavigationContainer>
    );
}