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
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "../store/useAuthStore";
import { useConversationStore, MessageType } from "../store/useConversationStore";
import { BASE_URL } from "../config";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function Chat() {
  const router = useRouter();
  const { authUser, token, socket, onlineUsers } = useAuthStore();
  const { selectedConversation, setSelectedConversation, messages, setMessages, users, setUsers } = useConversationStore();

  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<MessageType>>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("알림", "사진 라이브러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 1024 * 1024) {
        Alert.alert("알림", "이미지 크기는 1MB를 초과할 수 없습니다.");
        return;
      }

      if (!asset.fileSize && asset.base64) {
        const approxSize = asset.base64.length * 0.75;
        if (approxSize > 1024 * 1024) {
          Alert.alert("알림", "이미지 크기는 1MB를 초과할 수 없습니다.");
          return;
        }
      }

      const base64Image = `data:image/jpeg;base64,${asset.base64}`;
      setSelectedImage(base64Image);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  // 컴포넌트 언마운트(화면 이탈) 시 대화방 선택 상태 초기화 (대화방 교체 시 꼬임 방지)
  const currentChatUserRef = useRef(selectedConversation);
  useEffect(() => {
    currentChatUserRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      // 이탈할 때, 전역 대화 상대방이 본 컴포넌트의 대화 상대와 여전히 동일한 경우에만 초기화
      if (useConversationStore.getState().selectedConversation?._id === currentChatUserRef.current?._id) {
        setSelectedConversation(null);
      }
    };
  }, [setSelectedConversation]);

  const [shakingMessageId, setShakingMessageId] = useState<string | null>(null);
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const prevMessagesLength = useRef(0);
  const isFirstLoad = useRef(true);

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

        // 대화방을 열었으므로 해당 유저의 unreadCount를 0으로 리셋
        setUsers(
          users.map((u) =>
            u._id === selectedConversation._id
              ? { ...u, unreadCount: 0 }
              : u
          )
        );
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
    if (!socket || !selectedConversation?._id || !token) return;

    const handleNewMessage = (newMessage: MessageType) => {
      // 현재 선택된 대화 상대방이 보낸 메시지인 경우 목록에 즉시 추가 및 읽음 처리
      if (selectedConversation._id === newMessage.senderId) {
        const currentMessages = useConversationStore.getState().messages;
        setMessages([...currentMessages, newMessage]);

        // 즉시 읽음 처리 API 호출
        fetch(`${BASE_URL}/api/messages/read/${selectedConversation._id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }).catch((err) => console.error("Failed to mark read:", err));
      }
    };

    const handleMessagesRead = ({ readerId }: { readerId: string }) => {
      // 상대방이 내 메시지를 읽었으므로 lastMessageStatus를 'read'로 업데이트
      const currentUsers = useConversationStore.getState().users;
      setUsers(
        currentUsers.map((u) =>
          u._id === readerId
            ? { ...u, lastMessageStatus: "read" }
            : u
        )
      );

      // 현재 열려 있는 방이 해당 상대의 방이면, 내 말풍선 메시지들도 읽음 처리
      if (selectedConversation._id === readerId) {
        const currentMessages = useConversationStore.getState().messages;
        setMessages(
          currentMessages.map((msg) =>
            msg.receiverId === readerId
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, selectedConversation?._id, setMessages, setUsers, token]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || !selectedConversation?._id || !token) return;

    const textToSend = messageText;
    const imageToSend = selectedImage;
    setMessageText("");
    setSelectedImage(null);

    try {
      const res = await fetch(`${BASE_URL}/api/messages/send/${selectedConversation._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: textToSend,
          messageFile: imageToSend
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server status ${res.status}: ${errText.slice(0, 50)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...messages, data]);

      // 내가 보낸 마지막 메시지의 상태를 'unread'로 표시
      setUsers(
        users.map((u) =>
          u._id === selectedConversation._id
            ? { ...u, lastMessageStatus: "unread" }
            : u
        )
      );
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

  // 새로운 메시지가 왔을 때 shake 애니메이션 실행 (2초 동안)
  useEffect(() => {
    if (loading) {
      isFirstLoad.current = true;
      return;
    }

    if (isFirstLoad.current) {
      prevMessagesLength.current = messages.length;
      isFirstLoad.current = false;
      return;
    }

    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      // 마지막 메시지가 상대방이 보낸 메시지(수신 메시지)일 때만 shake 적용
      if (lastMessage && lastMessage.senderId !== authUser?._id) {
        const startShakeTimer = setTimeout(() => {
          setShakingMessageId(lastMessage._id);
        }, 0);

        const shakeSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: -6,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 6,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 10 }
        );

        shakeSequence.start();

        const timer = setTimeout(() => {
          shakeSequence.stop();
          shakeAnim.setValue(0);
          setShakingMessageId(null);
        }, 2000);

        prevMessagesLength.current = messages.length;
        return () => {
          clearTimeout(startShakeTimer);
          shakeSequence.stop();
          clearTimeout(timer);
          shakeAnim.setValue(0);
        };
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, loading, authUser?._id, shakeAnim]);

  if (!selectedConversation) {
    return null;
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
          <TouchableOpacity 
            onPress={() => {
              router.back();
            }} 
            className="mr-3 p-1.5 rounded-full active:bg-slate-100 dark:active:bg-slate-800" 
            aria-label="Go back"
          >
            <Feather name="arrow-left" size={20} color="#3b82f6" />
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
                      <Animated.View
                        style={
                          item._id === shakingMessageId
                            ? { transform: [{ translateX: shakeAnim }] }
                            : {}
                        }
                        className={`px-4 py-2.5 rounded-2xl ${
                          isMyMessage
                            ? "bg-blue-600 rounded-br-none"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                        }`}
                      >
                        {item.messageFile ? (
                          <Image
                            source={{ uri: item.messageFile }}
                            style={{ width: 200, height: 150, borderRadius: 8, marginBottom: item.message ? 6 : 0 }}
                            contentFit="cover"
                          />
                        ) : null}
                        {item.message ? (
                          <Text className={`text-sm leading-5 ${isMyMessage ? "text-white" : "text-slate-900 dark:text-white"}`}>
                            {item.message}
                          </Text>
                        ) : null}
                      </Animated.View>
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
        <View className="p-3 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
          {selectedImage && (
            <View className="flex-row items-center mb-3 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl self-start relative">
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 64, height: 64, borderRadius: 8 }}
              />
              <TouchableOpacity
                onPress={removeImage}
                className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 shadow-md"
              >
                <Feather name="x" size={10} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={pickImage}
              className={`mr-3 p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 active:bg-slate-100 ${
                selectedImage ? "border-blue-500" : ""
              }`}
            >
              <Feather name="image" size={18} color={selectedImage ? "#3b82f6" : "#64748b"} />
            </TouchableOpacity>

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
              aria-label="Send message"
            >
              <Feather name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
