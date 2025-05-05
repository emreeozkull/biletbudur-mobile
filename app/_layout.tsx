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
      {/* Category detail screen */}
      <Stack.Screen 
        name="category/[categoryName]" // Match the file structure
        options={{ 
          title: "Category Events" // Default title, updated by screen
        }} 
      />
      {/* Search screen */}
      <Stack.Screen 
        name="search" // Corresponds to app/search.tsx
        options={{ 
          title: "Search" // Default title, screen can override
        }} 
      />
      {/* Add other screens here if needed, e.g.: */}
      {/* <Stack.Screen name="details" options={{ title: "Details" }} /> */}
    </Stack>
  );
}
