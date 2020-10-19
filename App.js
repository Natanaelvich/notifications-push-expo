import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default function App() {
  const [token, setToken] = useState(null);

  async function registerForPushNotificationsAsync() {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      const tokenExpo = await Notifications.getExpoPushTokenAsync();
      console.log(tokenExpo);
      setToken(tokenExpo);
    } else {
      const tokenExpo = await Notifications.getExpoPushTokenAsync();
      console.log(tokenExpo);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
    </View>
  );
}
