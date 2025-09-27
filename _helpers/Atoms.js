import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native';

let storage = undefined;

if (Platform.OS != 'web') {
  storage = createJSONStorage(() => AsyncStorage)
} 

export const authAtom = atomWithStorage("auth", {
  token: undefined,
  username: undefined,
  role: undefined,
  preferences: undefined,
  device_registered: false,
}, storage);
