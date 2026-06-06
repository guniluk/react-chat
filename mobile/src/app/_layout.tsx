import '../global.css';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../store/useAuthStore';
import {
  useConversationStore,
  MessageType,
  UserType,
} from '../store/useConversationStore';
import { Feather } from '@expo/vector-icons';

export default function RootLayout() {
  const { authUser, connectSocket, disconnectSocket, socket } = useAuthStore();
  const { setUsers, selectedConversation, setSelectedConversation } =
    useConversationStore();
  const router = useRouter();

  const [notification, setNotification] = useState<{
    message: string;
    sender: UserType;
  } | null>(null);
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

      // Increment unreadCount using latest state from Zustand
      const currentUsers = useConversationStore.getState().users;
      setUsers(
        currentUsers.map((u) =>
          u._id === newMessage.senderId
            ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
            : u,
        ),
      );

      // Find sender info from latest users state
      const sender = useConversationStore
        .getState()
        .users.find((u) => u._id === newMessage.senderId);
      if (sender) {
        setNotification({ message: newMessage.message || '📷 사진', sender });

        // Show toast
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    const handleMessagesRead = ({ readerId }: { readerId: string }) => {
      const currentUsers = useConversationStore.getState().users;
      setUsers(
        currentUsers.map((u) =>
          u._id === readerId ? { ...u, lastMessageStatus: 'read' } : u,
        ),
      );
    };

    const handleNewUser = (newUser: UserType) => {
      if (newUser._id !== authUser?._id) {
        const currentUsers = useConversationStore.getState().users;
        if (!currentUsers.some((u) => u._id === newUser._id)) {
          setUsers([...currentUsers, newUser]);
        }
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('newUser', handleNewUser);
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('newUser', handleNewUser);
    };
  }, [socket, selectedConversation, slideAnim, setUsers, authUser?._id]);

  const handleNotificationPress = () => {
    if (notification?.sender) {
      // Hide toast immediately
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setNotification(null));

      // 만약 이미 선택된 대화방 상대와 알림 보낸 사람이 같다면, 중복 이동 방지
      if (selectedConversation?._id === notification.sender._id) {
        return;
      }

      setSelectedConversation(notification.sender);
      router.push('/chat');
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
    if (!url) return '';
    if (url.includes('dicebear.com') && url.includes('/svg')) {
      return url.replace('/svg', '/png');
    }
    return url;
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Global Notification Toast */}
      <Animated.View
        style={{
          position: 'absolute',
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
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${notification.sender.username}`,
                )}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
              <View className="ml-3 flex-1 pr-2">
                <Text className="text-slate-900 dark:text-white font-bold text-base">
                  {notification.sender.fullName}
                </Text>
                <Text
                  className="text-slate-500 dark:text-slate-300 text-sm mt-0.5"
                  numberOfLines={1}
                >
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
