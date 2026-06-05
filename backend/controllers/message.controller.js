import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import { getReceiverSocketId, io } from '../socket/socket.js';
import cloudinary from '../lib/cloudinary.js';

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { message, messageFile } = req.body;
    const senderId = req.user._id;

    let messageFileUrl = "";
    if (messageFile) {
      const uploadResponse = await cloudinary.uploader.upload(messageFile);
      messageFileUrl = uploadResponse.secure_url;
    }

    if (!message && !messageFileUrl) {
      return res.status(400).json({ error: 'Message content or image is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || "",
      messageFile: messageFileUrl,
    });
    conversation.messages.push(newMessage._id);

    await Promise.all([newMessage.save(), conversation.save()]);

    // SOCKET.IO FUNCTION HERE
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate('messages');

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = conversation.messages;

    // 대화방 진입 시 상대방이 나에게 보낸 메시지들을 읽음 처리
    await Message.updateMany(
      { senderId: userToChatId, receiverId: senderId, isRead: { $ne: true } },
      { isRead: true }
    );

    // 상대방에게 실시간 알림 전송
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messagesRead', { readerId: senderId });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const loggedInUserId = req.user._id;

    // 상대방이 나에게 보낸 안 읽은 메시지를 일괄 읽음 처리
    await Message.updateMany(
      { senderId: userToChatId, receiverId: loggedInUserId, isRead: { $ne: true } },
      { isRead: true }
    );

    // 상대방에게 실시간 알림 전송
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messagesRead', { readerId: loggedInUserId });
    }

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.log('Error in markMessagesAsRead controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
