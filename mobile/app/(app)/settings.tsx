import { View,Text} from "react-native";
import { StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function About(){
    return(
        <SafeAreaView>
            <View>
                <Text style={styles.header}>Settings</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header:{
        flex:1,
    }
})