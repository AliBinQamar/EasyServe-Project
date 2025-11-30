import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@user_profile';

export const profileCache = {
    async save(profile: any): Promise<void> {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    },

    async get(): Promise<any | null> {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    },

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(PROFILE_KEY);
    }
};