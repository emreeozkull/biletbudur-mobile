import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  console.log("[RootLayout] Rendering...");
  
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
        <Stack.Screen name="event/[id]" options={{ title: "Event Details" }} />
        <Stack.Screen name="performer/[id]" options={{ title: "Performer Details" }} />
        <Stack.Screen name="category/[categoryName]" options={{ title: "Category Events", headerShown: true }} />
        <Stack.Screen
            name="profile"
            options={{
                title: 'My Profile',
                headerShown: true
            }}
        />
        <Stack.Screen
            name="saved-event/[id]"
            options={{
                title: 'Saved Event',
                headerShown: true,
                presentation: 'modal'
            }}
        />
      </Stack>
    </AuthProvider>
  );
}
