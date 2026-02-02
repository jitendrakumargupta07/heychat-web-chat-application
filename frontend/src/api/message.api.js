import api from "./axios";

export const getMessages = async (chatId) => {
  const res = await api.get(`/messages/${chatId}`);
  return res.data;
};

export const sendMessage = async (data) => {
  const res = await api.post("/messages", data);
  return res.data;
};

export const sendFileMessage = async (formData) => {
  const res = await api.post("/messages/send-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const markAsDelivered = async (messageId) => {
  const res = await api.post("/messages/delivered", { messageId });
  return res.data;
};

export const markSeen = async (chatId) => {
  const res = await api.post("/messages/seen", { chatId });
  return res.data;
};
