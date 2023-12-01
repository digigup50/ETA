import LoginScreen from "../screens/Login";
import React from "react";
import { View, Text } from 'react-native';
import HomeScreen from "../screens/Home";
import LoadingScreen from "../screens/Loading";
import TokenScreen from "../screens/Token";
import EventScreen from "../screens/Event";
import ChatScreen from "../screens/Chat";
import ProfileScreen from "../screens/Profile";
import UserChatScreen from "../screens/UserChats";
import EditProfileScreen from "../screens/EditProfile";
import ScannerScreen from "../screens/Scanner";
import BookingScreen from "../screens/Booking";
import MyEventsScreen from "../screens/MyEvents";
import OrganizeScreen from "../screens/Organize";
import MyTicketsScreen from "../screens/MyTickets";
import EventsScreen from "../screens/Events";
import TicketScreen from "../screens/Ticket";
import BlockList from '../screens/BlockList';
import SubmitEvent from '../screens/SubmitEvent'

import OnboardUserEmailScreen from "../screens/OnboardUserEmail";
import OnboardUserProfileScreen from "../screens/OnboardUserProfile";
import { Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import InternalConfig from "../constants/InternalConfig";
import StylerInstance from '../managers/BaseStyler'
import ChatBadgeIcon from "../components/ChatBadgeIcon";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { connect } from 'react-redux'
import Colors from "../constants/Colors";
import getTheme from '../native-base-theme/components';
import commonColor from '../native-base-theme/variables/commonColor';
import { useEffect } from "react";
import { updateTheme } from '../store'
import { AnalyticsManager, events } from '../api/Analytics';
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserList from "../screens/UserList";
import { Button } from "native-base";
// To assign console.log to nothing
// if (!__DEV__ || Platform.OS == "android") {
//   console.log = () => { };
// }

const AppTheme = {

}

const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ route }) => ({
          title: "ETA",
          headerLeft: () => (route.params && route.params.headerLeft) || null,
          headerRight: () => (route.params && route.params.headerRight) || null,
        })}
      />
    </Stack.Navigator>
  );
}

const StackChat = createStackNavigator();
function ChatStack() {
  return (
    <StackChat.Navigator>
      <StackChat.Screen
        name="Chats"
        component={UserChatScreen}
        options={{
          headerBackTitleVisible: false,
          headerLeft: false,
          title: "My Chats",
        }}
      />
    </StackChat.Navigator>
  );
}

const StackProfile = createStackNavigator();
function ProfileStack() {
  return (
    <StackProfile.Navigator>
      <StackProfile.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerBackTitleVisible: false,
          headerLeft: false,
        }}
      />
    </StackProfile.Navigator>
  );
}

const StackCalendar = createStackNavigator();
function CalendarStack() {
  return (
    <StackCalendar.Navigator>
      <StackCalendar.Screen
        name="Events"
        component={EventsScreen}
        options={({ route }) => ({
          header: () => (route.params && route.params.header) || null,
        })}
      />
    </StackCalendar.Navigator>
  );
}

const StackOnboarding = createStackNavigator();
function OnboardingStack() {
  return (
    <StackOnboarding.Navigator>
      <StackOnboarding.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <StackOnboarding.Screen
        name="Auth"
        component={TokenScreen}
        options={{
          headerShown: false,
        }}
      />
      <StackOnboarding.Screen
        name="OnboardEmail"
        component={OnboardUserEmailScreen}
        options={{
          headerShown: false,
        }}
      />
      <StackOnboarding.Screen
        name="OnboardUser"
        component={OnboardUserProfileScreen}
        options={{
          headerLeft: false,
          headerRight: false,
          title: "Complete profile",
        }}
      />
    </StackOnboarding.Navigator>
  );
}

const StackTicket = createStackNavigator();
function TicketStack() {
  return (
    <StackTicket.Navigator>
      <StackTicket.Screen
        name="Submit"
        component={SubmitEvent}
        options={{
          headerShown: false,
          title: "Submit Event",
          headerBackTitleVisible: false,
          headerLeft: false,
        }}
      />
    </StackTicket.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function AppTab() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons
              name="md-home"
              size={size}
              style={{
                color: color,
                fontSize: size
              }}
            />
          } else if (route.name === "Calendar") {
            return <Ionicons
              name="md-calendar"
              style={{
                color: color,
                fontSize: size
              }}
            />
          } else if (route.name === "Chats") {
            return <ChatBadgeIcon tintColor={color} fontSize={size} />
          } else if (route.name === "Submit") {
            return <Entypo name="circle-with-plus"
              style={{
                color: color,
                fontSize: size + 5
              }}
            />
          } else if (route.name === "Profile") {
            return <Ionicons
              name="md-person"
              style={{
                color: color,
                fontSize: size
              }}
            />
          }
        },
      })}>
      <Tab.Screen name="Home" component={AppStack} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ headerShown: false }} />
      <Tab.Screen name="Submit" component={TicketStack} options={{ headerShown: false }} />
      <Tab.Screen name="Chats" component={ChatStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const StackMainApp = createStackNavigator();

function MainApp(props) {
  useEffect(() => {
    console.log("Legacy Navigator Did Mount ");
    AnalyticsManager.logEvent(events.APP_OPEN)
    async function getAppTheme() {
      const theme = await AsyncStorage.getItem("theme");
      console.log('Stored App Theme =', theme);
      if (theme) {
        props.dispatch(updateTheme(theme));
      }
    }
    getAppTheme();
  }, [])


  StylerInstance.setAppearance(props.theme);
  console.log("======LEGACY NAGIATOR=====");
  console.log(`user: ${props.user}`);
  console.log(`userPath: ${props.userPath}`);
  var finishedOnboarding = props.user !== null && props.userPath === null
  console.log(`Finished onboaridng : ${finishedOnboarding}`);

  const currentTheme = StylerInstance.choose(DefaultTheme, DarkTheme);
  const MyTheme = {
    ...currentTheme,
    colors: {
      ...currentTheme.colors,
      primary: Colors.primaryETAButtonColor,
    },
  };

  return (
    // <StyleProvider style={getTheme(commonColor)}>
    <NavigationContainer theme={MyTheme}>
      {!finishedOnboarding &&
        <StackMainApp.Navigator initialRouteName={"Loading"}>
          <StackMainApp.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              headerShown: false,
            }}
          />
          <StackMainApp.Screen
            name="OnboardingStack"
            component={OnboardingStack}
            options={{
              headerShown: false,
            }}
          />
        </StackMainApp.Navigator>
      }
      {finishedOnboarding &&
        <StackMainApp.Navigator initialRouteName={"App"}>
          <StackMainApp.Screen
            name="App"
            component={AppTab}
            options={{
              headerShown: false,
            }}
          />
          <StackChat.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params.title || "Chat",
              headerBackTitle: 'My Chats',
              // headerRight: () => (
              //   <Button
              //     onPress={() => alert('This is a button!')}
              //     title="Info"
              //     color="red"
              //   />
              // ),
            })}
          />


          <StackChat.Screen
            name="UserList"
            component={UserList}
            options={({ route }) => ({
              title: "UserList",
              headerBackTitle: 'Chats',
            })}
          />






          <Stack.Screen
            name="Event"
            component={EventScreen}
            options={({ route }) => ({
              headerTransparent: route.params.headerTransparent || true,
              headerBackTitle: 'Events',
              headerRight: (props) => (
                <Button
                  {...props}
                  style={{
                    backgroundColor: "white",
                    justifyContent: "center",
                    marginRight: 10,
                    height: 40,
                    width: 40,
                    borderRadius: 40 / 2,
                  }}
                  onPress={route.params.shareClick || null}
                >
                  <Feather name="share" size={20} />
                  {console.log("props", route, props)}
                </Button>
              ),
            })}
          />
          <Stack.Screen
            name="MyEvents"
            component={MyEventsScreen}
            options={({ route }) => ({
              title: "My Events",
              headerRight: (props) => (
                <View {...props} style={{ paddingRight: 5 }}>
                  <Text>{InternalConfig.internalSdk}</Text>
                </View>
              ),
            })}
          />
          <Stack.Screen name="Book" component={BookingScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
          <Stack.Screen
            name="Organize"
            component={OrganizeScreen}
            options={({ route }) => ({
              title: route.params.event.title || "Organize",
              headerRight: route.params.headerRight || null,
            })}
          />

          <Stack.Screen
            name="Events"
            component={EventsScreen}
          />

          <StackProfile.Screen
            name="Edit"
            component={EditProfileScreen}
            options={{ title: "Profile", headerBackTitle: 'Profile', }}
          />
          <StackTicket.Screen
            name="TicketDetail"
            component={TicketScreen}
            options={{ title: "Ticket", headerBackTitle: 'My Tickets' }}
          />
          <StackTicket.Screen
            name="BlockList"
            component={BlockList}
            options={{ title: "Block list" }}
          />
        </StackMainApp.Navigator>
      }
    </NavigationContainer>
    // </StyleProvider>
  );
}



const mapStateToProps = (state) => {
  const { user, theme, userPath } = state
  return { user, theme, userPath }
}

export default connect(mapStateToProps)(MainApp)
