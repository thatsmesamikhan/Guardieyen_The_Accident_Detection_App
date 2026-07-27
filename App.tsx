import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigators from './src/navigators/RootNavigators';

const App = () => {
  return (
    <KeyboardProvider>
      <RootNavigators />
    </KeyboardProvider>
  );
};

export default App;