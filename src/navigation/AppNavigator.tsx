import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { LocationPermissionScreen, ShiftListScreen } from '../screens';

export type RootStackParamList = {
  LocationPermission: undefined;
  ShiftList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LocationPermission"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="LocationPermission"
          component={LocationPermissionScreen}
          options={{
            title: 'Location Permission',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ShiftList"
          component={ShiftListScreen}
          options={{
            title: 'Available Shifts',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
