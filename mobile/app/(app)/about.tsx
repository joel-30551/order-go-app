import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

export default function About() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>About OrderGo</Text>

          <Text style={styles.description}>
            OrderGo is a modern stock and order management app
            designed to help businesses track products, manage customers,
            monitor stock levels, and streamline daily operations.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              To simplify Order management for businesses of all sizes by
              providing powerful yet easy-to-use tools.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <Text style={styles.bullet}>• Product Management</Text>
            <Text style={styles.bullet}>• Customer Tracking</Text>
            <Text style={styles.bullet}>• Order Management</Text>
            <Text style={styles.bullet}>• Inventory Monitoring</Text>
            <Text style={styles.bullet}>• Sales Analytics</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose Us?</Text>
            <Text style={styles.sectionText}>
              We focus on simplicity, reliability, and performance to help
              businesses save time and improve efficiency.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionText}>
              Email: ordergoapp@gmail.com
            </Text>
            <Text style={styles.sectionText}>
              Phone: +233 26 811 6047
            </Text>
            <Text style={styles.sectionText}>
              Location: Accra, Ghana
            </Text>
          </View>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} OrderGo.com All Rights Reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    color: "#222",
  },
  description: {
    textAlign: 'justify',
    fontSize: 16,
    lineHeight: 22,
    color: "#555",
    marginBottom: 25,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#222",
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
  bullet: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  footer: {
    textAlign: "center",
    marginVertical: 25,
    color: "#777",
    fontSize: 13,
  },
});