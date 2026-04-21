import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#202020',
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#7F77DE',
        tabBarInactiveTintColor: '#9ca3af',
        sceneStyle: {
          backgroundColor: '#0b1220',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tonight',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />
    </Tabs>
  );
}