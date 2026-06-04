import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import { useAuthStore } from "../store/useAuthStore";
import { useConversationStore, UserType } from "../store/useConversationStore";
import { BASE_URL } from "../config";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { authUser, token, onlineUsers, logout } = useAuthStore();
  const { users, setUsers, setSelectedConversation } = useConversationStore();

  // DiceBear SVG 주소를 PNG 주소로 우회 변환하여 React Native 렌더링 먹통 방지
  const getProfilePicUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("dicebear.com") && url.includes("/svg")) {
      return url.replace("/svg", "/png");
    }
    return url;
  };

  // 사용자 목록 조회
  useEffect(() => {
    if (!token) return;

    const getUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/users`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setUsers(data);
      } catch (err: any) {
        console.error("Failed to load users:", err.message);
        Alert.alert("Error", "Failed to load users list");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [token]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.warn("Logout API call failed, signing out locally...", e);
    } finally {
      logout();
      router.replace("/login");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const selectUser = (user: UserType) => {
    setSelectedConversation(user);
    router.push("/chat");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      {/* 상단 헤더 */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
        <View className="flex-row items-center gap-3">
          <View className="relative">
            <Image
              source={getProfilePicUrl(
                authUser?.profilePic ||
                `https://api.dicebear.com/9.x/avataaars/svg?seed=${authUser?.username}`
              )}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
              transition={200}
            />
            <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border border-white dark:border-slate-900" />
          </View>
          <View>
            <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight">
              {authUser?.fullName}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              @{authUser?.username}
            </Text>
          </View>
        </View>

        {/* 테마 토글 및 로그아웃 버튼 영역 */}
        <View className="flex-row items-center gap-2">
          {/* 테마 토글 버튼 */}
          <TouchableOpacity
            onPress={toggleColorScheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50"
            aria-label="Toggle Theme"
          >
            {colorScheme === "light" ? (
              <Feather name="moon" size={16} color="#475569" />
            ) : (
              <Feather name="sun" size={16} color="#fbbf24" />
            )}
          </TouchableOpacity>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2.5 rounded-xl bg-red-500/10 active:bg-red-500/20 border border-red-500/20"
            aria-label="Logout"
          >
            <Feather name="log-out" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 바 */}
      <View className="px-6 py-3">
        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500"
        />
      </View>

      {/* 사용자 목록 */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 dark:text-slate-400 text-sm">No users found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8 }}
          renderItem={({ item }) => {
            const isOnline = onlineUsers?.includes(item._id);
            return (
              <TouchableOpacity
                onPress={() => selectUser(item)}
                className="flex-row items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-900/50"
              >
                <View className="flex-row items-center gap-3">
                  <View className="relative">
                    <Image
                      source={getProfilePicUrl(
                        item.profilePic ||
                        `https://api.dicebear.com/9.x/avataaars/svg?seed=${item.username}`
                      )}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      contentFit="cover"
                      transition={200}
                    />
                    {isOnline && (
                      <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-950 animate-pulse" />
                    )}
                  </View>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-semibold text-base">
                      {item.fullName}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">
                      @{item.username}
                    </Text>
                  </View>
                </View>

                {/* 상태 텍스트 */}
                <Text className={`text-xs font-semibold ${isOnline ? "text-green-500" : "text-slate-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
