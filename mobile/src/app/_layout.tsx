import "../global.css";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useAuthStore } from "../store/useAuthStore";
import { useConversationStore, MessageType, UserType } from "../store/useConversationStore";
import { Feather } from "@expo/vector-icons";

export default function RootLayout() {
  const { authUser, connectSocket, disconnectSocket, socket } = useAuthStore();
  const { users, selectedConversation, setSelectedConversation } = useConversationStore();
  const router = useRouter();

  const [notification, setNotification] = useState<{ message: string; sender: UserType } | null>(null);
  const [slideAnim] = useState(() => new Animated.Value(-150));

  useEffect(() => {
    if (authUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: MessageType) => {
      // Ignore if the message is from the currently selected conversation (chat screen handles it)
      if (selectedConversation?._id === newMessage.senderId) return;

      // Find sender info
      const sender = users.find((u) => u._id === newMessage.senderId);
      if (sender) {
        setNotification({ message: newMessage.message, sender });
        
        // Show toast
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation, users, slideAnim]);

  const handleNotificationPress = () => {
    if (notification?.sender) {
      // Hide toast immediately
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setNotification(null));

      setSelectedConversation(notification.sender);
      router.push("/chat");
    }
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  const getProfilePicUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("dicebear.com") && url.includes("/svg")) {
      return url.replace("/svg", "/png");
    }
    return url;
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Global Notification Toast */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 16,
          right: 16,
          transform: [{ translateY: slideAnim }],
          zIndex: 9999,
          elevation: 5,
        }}
      >
        {notification && (
          <View className="flex-row items-center p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNotificationPress}
              className="flex-row items-center flex-1"
            >
              <Image
                source={getProfilePicUrl(
                  notification.sender.profilePic ||
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${notification.sender.username}`
                )}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
              <View className="ml-3 flex-1 pr-2">
                <Text className="text-slate-900 dark:text-white font-bold text-base">
                  {notification.sender.fullName}
                </Text>
                <Text className="text-slate-500 dark:text-slate-300 text-sm mt-0.5" numberOfLines={1}>
                  {notification.message}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleDismiss} 
              className="w-8 h-8 items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full"
              aria-label="Dismiss notification"
            >
              <Feather name="x" size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
