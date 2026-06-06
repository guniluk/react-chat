import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { BASE_URL } from '../config';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }

      setAuthUser(data, data.token);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6">
          <View className="items-center mb-8">
            <Text className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Login <Text className="text-blue-500">Chat App</Text>
            </Text>
            <Text className="text-slate-600 dark:text-slate-400 text-sm">
              Welcome back! Please enter your details.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2">
                Username
              </Text>
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor="#64748b"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                autoCapitalize="none"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </View>

            <View className="mt-4">
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2">
                Password
              </Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                autoCapitalize="none"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl bg-blue-600 active:bg-blue-700 items-center justify-center shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 하단 전환 영역 */}
          <View className="flex-row justify-center items-center mt-12 py-4">
            <Text className="text-slate-500 dark:text-slate-400 text-base">
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/signup')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {({ pressed }) => (
                <Text
                  className={`font-extrabold text-base ${pressed ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500 dark:text-blue-400'}`}
                >
                  Sign up
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
