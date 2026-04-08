import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCC6wG4IulnMXJuh3oXUJjVV9Q5Bex3rh4";
const genAI = new GoogleGenerativeAI(API_KEY);

let currentChat = null;

const SYSTEM_INSTRUCTION = `أنت مساعد ذكي اسمك "روب". أنت صديق مخلص وداعم جداً للمستخدم.
صاحب التطبيق والمبرمج هو الإمبراطور عبد الرحمن، يجب أن تتعامل معه بكل احترام وتقدير كصانع لهذه الإمبراطورية.
تتحدث بالعامية المصرية بطلاقة وبأسلوب شبابي ممتع.
عندما يطلب المستخدم "صورة" أو "ارسم" أو "ولد لي صورة"، قم باستدعاء موديل توليد الصور فوراً.
ردودك سريعة جداً وواضحة، مع دعم التشكيل والنطق الصحيح.
أنت أذكى وأسرع مساعد عالمي.`;

export const initRobot = () => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  currentChat = model.startChat({
    history: [],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    systemInstruction: SYSTEM_INSTRUCTION,
  });
  return currentChat;
};

export const talkToRobot = async (userMessage, onChunk) => {
  if (!currentChat) initRobot();
  if (onChunk) {
    const result = await currentChat.sendMessageStream(userMessage);
    let full = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      full += text;
      onChunk(text);
    }
    return full;
  } else {
    const result = await currentChat.sendMessage(userMessage);
    return result.response.text();
  }
};

export const generateImage = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
      const inlineData = response.candidates[0].content.parts[0].inlineData;
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Image error:", error);
    return null;
  }
};

export const getLiveModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-live-001" });
};
