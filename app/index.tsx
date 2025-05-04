import { SafeAreaView, StyleSheet } from "react-native";
import HomeScreen from "../src/screens/HomeScreen"; // Adjusted path

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <HomeScreen />
      {/* StatusBar might be handled in _layout.tsx or globally */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Match Header background or set a base color
  },
});
