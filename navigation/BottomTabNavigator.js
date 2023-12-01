import { Entypo, Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ChatBadgeIcon from "../components/ChatBadgeIcon";
export default function MyTabBar({ state, descriptors, navigation }) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const tintColor = isFocused ? "black" : "gray";
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            // onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View>
                {route.name === "Home" ? (
                  <Ionicons
                    name="md-home"
                    style={{
                      color: tintColor,
                      fontSize: 15,
                    }}
                  />
                ) : route.name === "Calendar" ? (
                  <Ionicons
                    name="md-calendar"
                    style={{
                      color: tintColor,
                      fontSize: 15,
                    }}
                  />
                ) : route.name === "Chats" ? (
                  <ChatBadgeIcon tintColor={tintColor} fontSize={15} />
                ) : route.name === "Tickets" ? (
                  <Entypo
                    name="ticket"
                    style={{
                      color: tintColor,
                      fontSize: 15,
                    }}
                  />
                ) : route.name === "Profile" ? (
                  <Ionicons
                    name="md-person"
                    style={{
                      color: tintColor,
                      fontSize: 15,
                    }}
                  />
                ) : null}
              </View>
              <Text style={{ color: isFocused ? "black" : "gray" }}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
