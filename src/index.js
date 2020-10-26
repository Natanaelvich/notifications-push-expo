import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import io from 'socket.io-client';
import * as TaskManager from 'expo-task-manager';

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
  const [orphanages, setOrphanages] = useState([]);

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
      setToken(tokenExpo);
    } else {
      const tokenExpo = await Notifications.getExpoPushTokenAsync();
      setToken(tokenExpo);
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

  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken.data,
      sound: 'default',
      title: 'Novo orfanato',
      body: 'Confira o novo orfanato cadastrado!',
      data: { data: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  const socket = useMemo(() => {
    return io('http://10.0.3.2:3334', {
      query: { user: 'bg-notification' },
    });
  }, []);

  useEffect(() => {
    socket.on('orphanage', orphanage => {
      sendPushNotification(token);
      setOrphanages(oldOrphanages => {
        return [
          ...oldOrphanages,
          {
            ...JSON.parse(orphanage),
            id: String(Date.now()),
            created_at: new Date(Date.now()),
          },
        ];
      });
    });
  }, [setOrphanages, socket, token]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      {token && (
        <TouchableOpacity
          style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 6,
            marginTop: 12,
          }}
          onPress={() => sendPushNotification(token)}
        >
          <Text style={{ color: '#fff' }}>Send notification</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
