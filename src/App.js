import { useState, useEffect, useRef } from 'react';
import { initRobot, talkToRobot, generateImage } from './services/geminiService';
import { speak } from './services/speechService';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLiveCall, setIsLiveCall] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initRobot();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, role: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');

    // توليد صورة إذا طلب المستخدم
    if (userInput.includes('صورة') || userInput.includes('ارسم') || userInput.includes('ولد لي')) {
      setIsGenerating(true);
      const imgUrl = await generateImage(userInput);
      setIsGenerating(false);
      if (imgUrl) {
        const imgMsg = { text: '🎨 هذه الصورة التي طلبتها:', imageUrl: imgUrl, role: 'model', timestamp: Date.now() };
        setMessages(prev => [...prev, imgMsg]);
        return;
      }
    }

    // رد عادي مع Streaming
    const tempId = Date.now();
    const streamingMsg = { text: '', role: 'model', timestamp: Date.now(), isStreaming: true, id: tempId };
    setMessages(prev => [...prev, streamingMsg]);

    const fullReply = await talkToRobot(userInput, (chunk) => {
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, text: msg.text + chunk } : msg
      ));
    });

    setMessages(prev => prev.map(msg =>
      msg.id === tempId ? { ...msg, text: fullReply, isStreaming: false } : msg
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ padding: 15, background: '#0F9D58', color: 'white', textAlign: 'center' }}>
        <h2>🤖 روب - مساعدك الذكي</h2>
        <p style={{ fontSize: 12 }}>by الإمبراطور عبد الرحمن</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 15 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: 10 }}>
            <div style={{ display: 'inline-block', background: msg.role === 'user' ? '#DCF8C6' : '#2a2a2a', padding: 12, borderRadius: 18, maxWidth: '75%', color: msg.role === 'user' ? '#000' : '#fff' }}>
              {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
              {msg.imageUrl && <img src={msg.imageUrl} alt="generated" style={{ maxWidth: 200, borderRadius: 12, marginTop: 8 }} />}
              {msg.role === 'model' && !msg.isStreaming && (
                <button onClick={() => speak(msg.text)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 5 }}>🔊</button>
              )}
              {msg.isStreaming && <span style={{ fontSize: 12, opacity: 0.7 }}>⏳ يكتب...</span>}
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 5 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isGenerating && <div style={{ textAlign: 'center', color: '#aaa' }}>🎨 جاري توليد الصورة...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: 12, background: '#111', display: 'flex', gap: 8, borderTop: '1px solid #222' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="اكتب رسالة..."
          style={{ flex: 1, padding: 12, borderRadius: 30, border: '1px solid #333', background: '#222', color: '#fff' }}
        />
        <button onClick={sendMessage} style={{ background: '#0F9D58', color: 'white', border: 'none', borderRadius: 30, padding: '0 20px', cursor: 'pointer' }}>إرسال</button>
      </div>
    </div>
  );
                        }
