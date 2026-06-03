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

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    const { fullName, username, password, confirmPassword, gender } = formData;

    if (
      !fullName.trim() ||
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !gender
    ) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Signup failed');
      }

      setAuthUser(data, data.token);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message);
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
          <View className="items-center mb-6">
            <Text className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Sign Up <Text className="text-blue-500">Chat App</Text>
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              Create an account to start messaging.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2">
                Full Name
              </Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#64748b"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </View>

            <View className="mt-3">
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

            <View className="mt-3">
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2">
                Password
              </Text>
              <TextInput
                placeholder="Enter password"
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

            <View className="mt-3">
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2">
                Confirm Password
              </Text>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                autoCapitalize="none"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </View>

            {/* Gender Selection */}
            <View className="mt-4">
              <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-2 text-center">
                Gender
              </Text>
              <View className="flex-row justify-center gap-6 mt-1">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                  className={`px-6 py-2.5 rounded-full border ${
                    formData.gender === 'male'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Text
                    className={`font-bold ${formData.gender === 'male' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                  className={`px-6 py-2.5 rounded-full border ${
                    formData.gender === 'female'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <Text
                    className={`font-bold ${formData.gender === 'female' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl bg-blue-600 active:bg-blue-700 items-center justify-center shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 하단 전환 영역 */}
          <View className="flex-row justify-center items-center mt-12 py-4">
            <Text className="text-slate-500 dark:text-slate-400 text-base">
              Already have an account?{' '}
            </Text>
            <Pressable
              onPress={() => router.push('/login')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {({ pressed }) => (
                <Text
                  className={`font-extrabold text-base ${pressed ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500 dark:text-blue-400'}`}
                >
                  Login here
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
