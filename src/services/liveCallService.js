import { getLiveModel } from "./geminiService";

let liveSession = null;

export const startLiveCall = async (onAudio) => {
  const model = getLiveModel();
  liveSession = await model.connect();
  for await (const msg of liveSession.responses) {
    if (msg.payload === "audio") onAudio(msg.data);
  }
  return liveSession;
};

export const sendAudio = async (audioChunk) => {
  if (liveSession) await liveSession.sendAudio(audioChunk);
};

export const stopLiveCall = async () => {
  if (liveSession) {
    await liveSession.close();
    liveSession = null;
  }
};
