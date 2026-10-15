import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Privacy Policy</Text>

          <Text style={styles.lastUpdated}>
            Last Updated: June 2026
          </Text>

          <View style={styles.section}>
            <Text style={styles.heading}>Introduction</Text>
            <Text style={styles.text}>
              We respect your privacy and are committed to protecting your
              personal information. This Privacy Policy explains how we
              collect, use, store, and protect information when you use
              our application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Information We Collect</Text>
            <Text style={styles.text}>
              We may collect information such as:
            </Text>
            <Text style={styles.bullet}>• Name and contact details</Text>
            <Text style={styles.bullet}>• Email address</Text>
            <Text style={styles.bullet}>• Customer and product records</Text>
            <Text style={styles.bullet}>• Order and inventory data</Text>
            <Text style={styles.bullet}>• Device and usage information</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>How We Use Information</Text>
            <Text style={styles.bullet}>
              • Provide and improve our services
            </Text>
            <Text style={styles.bullet}>
              • Manage inventory and customer records
            </Text>
            <Text style={styles.bullet}>
              • Respond to support requests
            </Text>
            <Text style={styles.bullet}>
              • Enhance security and reliability
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Data Security</Text>
            <Text style={styles.text}>
              We implement reasonable technical and organizational measures
              to protect your information from unauthorized access, loss,
              misuse, or disclosure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Data Sharing</Text>
            <Text style={styles.text}>
              We do not sell your personal information. Information may be
              shared only when required by law or when necessary to provide
              our services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Your Rights</Text>
            <Text style={styles.bullet}>
              • Access your personal data
            </Text>
            <Text style={styles.bullet}>
              • Request corrections to inaccurate data
            </Text>
            <Text style={styles.bullet}>
              • Request deletion of your data where applicable
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Contact Us</Text>
            <Text style={styles.text}>
              If you have questions regarding this Privacy Policy,
              please contact us:
            </Text>

            <Text style={styles.contact}>
              Email: ordergoapp@gmail.com
            </Text>
            <Text style={styles.contact}>
              Location: Accra, Ghana
            </Text>
          </View>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} OrderGo.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  lastUpdated: {
    color: "#666",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    textAlign: 'justify',
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  bullet: {
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
  },
  contact: {
    fontSize: 15,
    marginTop: 4,
    color: "#444",
  },
  footer: {
    textAlign: "center",
    marginVertical: 20,
    color: "#777",
    fontSize: 13,
  },
});