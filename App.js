import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import AppNavigator from './navigation/AppNavigator';
import LegacyNavigator from './navigation/LegacyNavigator';
import { NativeBaseProvider, Box } from "native-base";
import * as Sentry from 'sentry-expo';
import { Provider } from 'react-redux';
import { initializeStore } from './store';

Sentry.init({
  dsn: 'https://36ffb47e79c6493e8f83c2651e415583@sentry.io/1727401',
  enableInExpoDevelopment: false,
  debug: true
});

const store = initializeStore()

const Application = class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    // return Promise.all([
    //   Asset.loadAsync([
    //     require('./assets/images/robot-dev.png'),
    //     require('./assets/images/robot-prod.png'),
    //   ])
    // ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

const RootComponent = () => (
  <Provider store={store}>
    <NativeBaseProvider>
      <Application />
    </NativeBaseProvider>
  </Provider>
);


export default RootComponent

