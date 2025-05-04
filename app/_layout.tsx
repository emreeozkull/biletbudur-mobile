import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false // Hide header for the index screen
        }} 
      />
      {/* Add other screens here if needed, e.g.: */}
      {/* <Stack.Screen name="details" options={{ title: "Details" }} /> */}
    </Stack>
  );
}
