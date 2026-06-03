import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "../store/useAuthStore";
import { useConversationStore, MessageType } from "../store/useConversationStore";
import { BASE_URL } from "../config";

export default function Chat() {
  const router = useRouter();
  const { authUser, token, socket, onlineUsers } = useAuthStore();
  const { selectedConversation, messages, setMessages } = useConversationStore();

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<MessageType>>(null);

  // DiceBear SVG 주소를 PNG 주소로 우회 변환하여 React Native 렌더링 먹통 방지
  const getProfilePicUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("dicebear.com") && url.includes("/svg")) {
      return url.replace("/svg", "/png");
    }
    return url;
  };

  // 메시지 로드
  useEffect(() => {
    if (!selectedConversation?._id || !token) return;

    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/messages/${selectedConversation._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data);
      } catch (err: any) {
        console.error("Failed to load messages:", err.message);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation?._id, token, setMessages]);

  // 실시간 메시지 수신 연동
  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;

    const handleNewMessage = (newMessage: MessageType) => {
      // 현재 선택된 대화 상대방이 보낸 메시지인 경우 목록에 즉시 추가
      if (selectedConversation._id === newMessage.senderId) {
        setMessages([...messages, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation?._id, messages, setMessages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?._id || !token) return;

    const textToSend = messageText;
    setMessageText("");

    try {
      const res = await fetch(`${BASE_URL}/api/messages/send/${selectedConversation._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...messages, data]);
    } catch (err: any) {
      console.error("Failed to send message:", err.message);
    }
  };

  // 메시지가 바뀔 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages]);

  if (!selectedConversation) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-950 justify-center items-center">
        <Text className="text-slate-500 dark:text-slate-400">No conversation selected</Text>
      </SafeAreaView>
    );
  }

  const isOnline = onlineUsers?.includes(selectedConversation._id);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* 상단 헤더 */}
        <View className="px-4 py-3 flex-row items-center border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-blue-500 font-bold text-base">← Back</Text>
          </TouchableOpacity>

          <View className="relative mr-3">
            <Image
              source={getProfilePicUrl(
                selectedConversation.profilePic ||
                `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation.username}`
              )}
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="cover"
              transition={200}
            />
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-white dark:border-slate-900" />
            )}
          </View>

          <View>
            <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight">
              {selectedConversation.fullName}
            </Text>
            <Text className={`text-[10px] ${isOnline ? "text-green-500" : "text-slate-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* 대화 내용 영역 */}
        <View style={{ flex: 1 }} className="bg-slate-50/30 dark:bg-slate-950/20 px-4 py-2">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 justify-center items-center opacity-70">
              <Text className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                Say hello to start the conversation!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const isMyMessage = item.senderId === authUser?._id;
                const messageTime = new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <View
                    className={`flex-row my-1.5 ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMyMessage && (
                      <Image
                        source={getProfilePicUrl(
                          selectedConversation.profilePic ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation.username}`
                        )}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        className="mr-2 self-end mb-1"
                        contentFit="cover"
                      />
                    )}
                    <View className="max-w-[70%]">
                      <View
                        className={`px-4 py-2.5 rounded-2xl ${
                          isMyMessage
                            ? "bg-blue-600 rounded-br-none"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                        }`}
                      >
                        <Text className={`text-sm leading-5 ${isMyMessage ? "text-white" : "text-slate-900 dark:text-white"}`}>
                          {item.message}
                        </Text>
                      </View>
                      <Text
                        className={`text-[9px] text-slate-500 mt-1 ${
                          isMyMessage ? "text-right" : "text-left"
                        }`}
                      >
                        {messageTime}
                      </Text>
                    </View>
                    {isMyMessage && (
                      <Image
                        source={getProfilePicUrl(
                          authUser?.profilePic ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${authUser?.username}`
                        )}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        className="ml-2 self-end mb-1"
                        contentFit="cover"
                      />
                    )}
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* 하단 입력 영역 */}
        <View className="p-3 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 flex-row items-center">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            value={messageText}
            onChangeText={setMessageText}
            onSubmitEditing={handleSendMessage}
            className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="ml-3 p-3 rounded-full bg-blue-600 active:bg-blue-500"
          >
            <Text className="text-white font-bold text-sm">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
