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
      {/* Event detail screen */}
      <Stack.Screen 
        name="event/[id]" // Match the file structure
        options={{ 
          title: "Event Details" // Default title, can be updated by the screen
        }} 
      />
      {/* Performer detail screen */}
      <Stack.Screen 
        name="performer/[name]" // Match the file structure
        options={{ 
          title: "Performer Details" // Default title, can be updated by the screen
        }} 
      />
      {/* Add other screens here if needed, e.g.: */}
      {/* <Stack.Screen name="details" options={{ title: "Details" }} /> */}
    </Stack>
  );
}
