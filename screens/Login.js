import {
  Text, TextInput, Alert, ImageBackground, Image, Platform,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import GameplanHeaderText from '../components/GameplanHeaderText'
import UserAPI from '../api/UserAPI';
import SocialAPI from '../api/SocialAPI';
import { Button, FormControl, Input, Spinner, View } from 'native-base';
import * as WebBrowser from 'expo-web-browser';
import { KeyboardAwareFlatList, KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AnalyticsManager, events } from '../api/Analytics'
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-facebook';
import { overwrite, setUser, setUserPath } from "../store";
import { connect } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainUser from '../components/MainUser';
import ErrorManager from '../managers/ErrorManager';
import StylerInstance from '../managers/BaseStyler';
import * as Sentry from 'sentry-expo';

const FakeUserToken = "023904c830cb8ae83b851b2433360954d4fbb244";
const FakeUserNumber = "1111";
class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loginLoading: null,
      mobile: ''
    }

    this.userAPI = new UserAPI();
    this.socialAPI = new SocialAPI();
    this.errorManager = new ErrorManager();
  }

  async handleClick() {
    AnalyticsManager.logEvent(events.USER_ENTERED_PHONE)
    const mobile = this.state.mobile
    console.log(this.state.mobile)
    0
    if (mobile === FakeUserNumber) {
      await this.handleFakeUserLogin()
      return;
    }

    if (isNaN(mobile)) {
      Alert.alert("Please enter a valid phone number")
      return
    }

    if (mobile == '') {
      Alert.alert("Error",
        "Please enter a valid phone number")
      return
    }

    this.setState({ loginLoading: true });

    const userAuthResp = await this.userAPI.sendAuth(mobile);
    if (userAuthResp && userAuthResp.code !== -1) {
      console.log("User auth response data =")
      console.log(userAuthResp)
      this.setState({ loginLoading: false })
      this.props.navigation.navigate('Auth')
    } else {
      console.log("Send auth error recieved")
      console.log(userAuthResp);
      this.setState({ loginLoading: false })

      if (userAuthResp.mobile) {
        var str = ""
        for (var element of userAuthResp.mobile) {
          str += element + "\n"
        }

        Alert.alert(str)
        return
      }

      if (userAuthResp.detail) {
        Alert.alert(error.detail)
      } else {
        Alert.alert("Couldn't complete the login flow",
          "Try again later")
      }
    }
  }


  componentDidMount() {
    console.log("=======LOGIN LOADDEDDD==========");
    AnalyticsManager.logEvent(events.USER_VIEWED_SIGNUP);
    this.props.dispatch(setUserPath("onboarding"));
  }

  componentWillUnmount() {
    console.log("=======LOGIN UNMOUNTING====")
  }

  async handleFakeUserLogin() {
    MainUser.setToken(FakeUserToken);
    this.userAPI.setAuth(FakeUserToken);
    const userResp = await this.userAPI.getMe();
    if (userResp && userResp.code !== -1) {
      this.props.dispatch(setUser(userResp));
      AsyncStorage.setItem('token', FakeUserToken).then((val) => this.props.dispatch(setUserPath(null)))
    } else {
      console.error(userResp);
    }
  }

  linkPrivacyPolicy() {
    WebBrowser.openBrowserAsync('https://www.witheta.com/privacy')
  }

  linkTermsOfService() {
    WebBrowser.openBrowserAsync('https://www.witheta.com/terms')
  }

  handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      console.log(credential)
      const details = {
        token: credential.authorizationCode,

      }
      this.handleSocialLogin("apple", details);

    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
        console.log("User canceled sign in flow.");
      } else {
        // handle other errors
        console.log(e);
        Sentry.Native.captureException(e);
        Alert.alert("Failed to grab apple information");
      }
    }
  }

  handleFbLogin = async () => {
    try {
      await Facebook.initializeAsync({
        appId: '742957793182154',
      });
      const {
        type,
        token,
        expirationDate,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'email']
      });
      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`)
          .then(response => response.json())
          .then(data => {
            const details = {
              token: token,
              email: data.email,
              username: data.name,
              picture_url: data.picture.data.url,
            }
            this.handleSocialLogin('facebook', details)
          })
          .catch(e => {
            Sentry.Native.captureException(e);
            Alert.alert(`Facebook Login Error: ${e}`)
          })
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      Sentry.Native.captureMessage(message)
      Alert.alert(`Facebook Login Error: ${message}`);
      return message
    }
  }

  handleSocialLogin = async (type, data) => {
    let socialData = data;
    socialData.account_type = type
    AnalyticsManager.logEvent(events.USER_SOCIAL_LOGIN, { type: type });
    this.setState({ loginLoading: true })

    const socialLogin = await this.socialAPI.loginWithSocial(socialData);

    if (socialLogin && socialLogin.code !== -1) {
      console.log("Social login response successful.");
      this.setState({ loginLoading: false })
      AsyncStorage.setItem('token', socialLogin.token)
        .then((val) => {
          MainUser.setToken(socialLogin.token);
          this.props.dispatch(overwrite(socialLogin[0]));
          console.log("Login -> OnboardEmail");
          this.props.navigation.navigate('OnboardEmail');
        })
    } else {
      console.log("Social login error recieved");
      const errorStr = this.errorManager.getErrorString(socialLogin.error);
      Sentry.Native.captureMessage(errorStr);
      this.setState({ loginLoading: false }, () => {
        Alert.alert(errorStr);
      })
    }
  }

  render() {
    const height = Dimensions.get('window').height
    if (this.state.loginLoading == true) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </View>)
    }
    return (
      <ImageBackground source={require('../assets/images/loading3.jpg')}
        style={{ height: '100%', width: '100%', flex: 1, position: 'absolute', backgroundColor: 'black' }}>
        <StatusBar style={StylerInstance.choose("dark", "light")} />
        <View style={styles.overlay} />
        {/* <Content enableOnAndroid> */}
        <KeyboardAwareScrollView enableOnAndroid>
          <View style={{ flex: 1, height: height, flexDirection: 'column' }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <Image source={require('../assets/images/eta_green.png')} style={{ height: 70, width: 210, margin: 20 }} />
                <Text style={{ color: 'white', fontWeight: 'bold' }}>The event platform for the culture by the culture</Text>
              </View>
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: height / 10 }}>
              {Platform.OS === 'ios' &&
                <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 20, }}>
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={5}
                    style={{ width: '70%', height: 44 }}
                    onPress={this.handleAppleLogin}
                  />
                </View>
              }
              <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 20 }}>
                <Button onPress={this.handleFbLogin} style={{ backgroundColor: '#485993', width: '70%', justifyContent: 'center', alignItems: 'center', }}>
                  <View style={{}}>
                    <Text style={{
                      color: 'white',
                      fontSize: 16
                    }}>Continue with Facebook</Text>
                  </View>
                </Button>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                <Text style={{
                  fontSize: 16,
                  color: 'white'
                }}>Or</Text>
              </View>
              <View flex alignItems={"center"}>
                <FormControl w={"80%"}>
                  <FormControl.Label>Phone number</FormControl.Label>
                  <Input size="lg" keyboardType='phone-pad' returnKeyType='done' variant="underlined"
                    style={{ color: 'white' }} mt={2} placeholder="2146769177..." value={this.state.mobile} onChangeText={(val) => this.setState({ mobile: val })} />
                </FormControl>
              </View>
              <View style={styles.buttonViewStyle}>
                <Button style={styles.buttonStyle}
                  onPress={() => this.handleClick()}>
                  <Text style={{ fontSize: 14, color: 'white' }}>Continue</Text>
                </Button>
              </View>
              <View style={{ margin: 20, alignItems: 'center' }}>
                <View>
                  <Text style={styles.textStyle}>By selecting Continue, you agree to our </Text>
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <Text onPress={() => this.linkTermsOfService()}
                    style={[styles.textStyle, styles.activeText]}>Terms of Service</Text>
                  <Text style={styles.textStyle}> and </Text>
                  <Text onPress={() => this.linkPrivacyPolicy()}
                    style={[styles.textStyle, styles.activeText]}>Privacy Policy</Text>
                </View>
              </View>
            </View>

          </View>

          {/* </Content> */}
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}


const styles = {
  textStyle: {
    fontSize: 10,
    color: 'white'
  },

  activeText: {
    color: '#007AFF'
  },

  buttonViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '10%'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    opacity: 0.40
  },
  buttonStyle: {
    width: '70%',
    justifyContent: 'center',
    backgroundColor: 'black'
  }
}
export default connect(null)(LoginScreen);