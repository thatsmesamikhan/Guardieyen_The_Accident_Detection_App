import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigators from './src/navigators/RootNavigators';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <KeyboardProvider>
      <RootNavigators />
      <Toast />
    </KeyboardProvider>
  );
};

export default App;