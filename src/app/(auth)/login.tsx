import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

const Login = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Add your login form components here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: "Sen_700Bold",
    color: Colors.text,
  },
});

export default Login;
