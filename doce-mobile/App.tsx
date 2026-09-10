import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Imports de todas as telas
import LoginScreen from './src/screens/LoginScreen';
import IngredientsScreen from './src/screens/IngredientsScreen';
import AddIngredientScreen from './src/screens/AddIngredientScreen';
import EditIngredientScreen from './src/screens/EditIngredientScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import EditRecipeScreen from './src/screens/EditRecipeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu de Abas Inferiores
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: any;

                    if (route.name === 'Insumos') {
                        iconName = 'basket';
                    } else if (route.name === 'Receitas') {
                        iconName = 'restaurant';
                    } else if (route.name === 'Perfil') {
                        iconName = 'person';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4A90E2',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
            })}
        >
            <Tab.Screen name="Insumos" component={IngredientsScreen} />
            <Tab.Screen name="Receitas" component={RecipesScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Navegação Principal
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

                <Stack.Screen name="AddIngredient" component={AddIngredientScreen} options={{ title: 'Novo Insumo' }} />
                <Stack.Screen name="EditIngredient" component={EditIngredientScreen} options={{ title: 'Editar Insumo' }} />

                <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Montar Ficha Técnica' }} />
                <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalhes da Ficha' }} />
                <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Editar Ficha' }} />
            </Stack.Navigator>
            <StatusBar style="auto" />
        </NavigationContainer>
    );
}