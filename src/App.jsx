import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    font-family: 'Syne', sans-serif;
    color: #e8e8e8;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #0a0a0a;
    background-image:
      linear-gradient(rgba(0,255,120,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,120,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* LOGIN */
  .login-card {
    width: 100%;
    max-width: 440px;
    border: 1px solid #1f1f1f;
    border-top: 2px solid #00ff78;
    background: #111;
    padding: 3rem 2.5rem;
  }

  .login-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #00ff78;
    letter-spacing: 0.15em;
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }

  .login-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    margin-bottom: 0.4rem;
    letter-spacing: -0.03em;
  }

  .login-subtitle {
    font-size: 0.85rem;
    color: #444;
    margin-bottom: 2.5rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .field-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #444;
    letter-spacing: 0.12em;
    margin-bottom: 0.5rem;
  }

  .field-input {
    width: 100%;
    background: #0a0a0a;
    border: 1px solid #222;
    color: #e8e8e8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
    outline: none;
    transition: border-color 0.15s;
    margin-bottom: 1.5rem;
    border-radius: 0;
  }

  .field-input:focus { border-color: #00ff78; }
  .field-input::placeholder { color: #2a2a2a; }

  .btn-primary {
    width: 100%;
    background: #00ff78;
    color: #000;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 0.9rem;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    border-radius: 0;
  }

  .btn-primary:hover { background: #00e56b; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { background: #1a1a1a; color: #333; cursor: not-allowed; }

  /* CHAT */
  .chat-wrapper {
    width: 100%;
    max-width: 800px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid #1f1f1f;
    background: #111;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #1a1a1a;
    background: #0d0d0d;
    flex-shrink: 0;
  }

  .header-left { display: flex; align-items: center; gap: 0.75rem; }

  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #00ff78;
    box-shadow: 0 0 6px #00ff78;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .chat-title { font-size: 1rem; font-weight: 700; color: #fff; }
  .chat-user  { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; }

  .btn-ghost {
    background: transparent;
    border: 1px solid #222;
    color: #444;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    border-radius: 0;
  }

  .btn-ghost:hover { border-color: #ff4d4d; color: #ff4d4d; }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    scrollbar-width: thin;
    scrollbar-color: #1f1f1f transparent;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-thumb { background: #1f1f1f; }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #222;
  }

  .empty-state span {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .msg-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: fadeUp 0.18s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .msg-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #333;
    padding-left: 3px;
  }

  .msg-meta .author { color: #00ff78; margin-right: 0.5rem; }

  .msg-bubble {
    background: #161616;
    border-left: 2px solid #222;
    padding: 0.55rem 0.9rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    color: #bbb;
    line-height: 1.5;
    word-break: break-word;
  }

  .msg-bubble.own {
    border-left-color: #00ff78;
    background: #0d1a11;
    color: #d0ffd8;
  }

  .msg-bubble.system {
    border-left: none;
    background: transparent;
    color: #2d2d2d;
    font-size: 0.78rem;
    padding-left: 0;
  }

  /* INPUT BAR */
  .input-bar {
    display: flex;
    border-top: 1px solid #1a1a1a;
    background: #0d0d0d;
    flex-shrink: 0;
  }

  .msg-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e8e8e8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    padding: 1rem 1.25rem;
    outline: none;
    border-right: 1px solid #1a1a1a;
  }

  .msg-input::placeholder { color: #2a2a2a; }

  .btn-send {
    background: transparent;
    border: none;
    color: #333;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    padding: 0 1.25rem;
    cursor: pointer;
    transition: color 0.15s;
    white-space: nowrap;
  }

  .btn-send:hover:not(:disabled) { color: #00ff78; }
  .btn-send:disabled { color: #1e1e1e; cursor: not-allowed; }
`;

function parseMsg(raw) {
  const i = raw.indexOf(": ");
  if (i > 0) return { author: raw.slice(0, i), text: raw.slice(i + 2) };
  return { author: null, text: raw };
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMsg(content, type = "msg") {
    setMessages((prev) => [...prev, { id: Math.random(), type, content }]);
  }

  function connect() {
    if (!username.trim()) return;
    const client = new Client({
      brokerURL: `ws://chat-env.eba-7xdc6fdn.sa-east-1.elasticbeanstalk.com/livechat-websocket`,
      onConnect: () => {
        setConnected(true);
        setScreen("chat");
        addMsg("conectado ao live chat", "system");
        client.subscribe("/topics/livechat", (msg) => {
          addMsg(JSON.parse(msg.body).content);
        });
      },
      onWebSocketError: () => addMsg("erro de websocket", "system"),
      onStompError: (f) => addMsg("erro: " + f.headers["message"], "system"),
      onDisconnect: () => {
        setConnected(false);
        addMsg("desconectado", "system");
      },
    });

    clientRef.current = client;
    client.activate();
  }

  function disconnect() {
    clientRef.current?.deactivate();
    clientRef.current = null;
    setConnected(false);
    setScreen("login");
    setMessages([]);
  }

  function send() {
    if (!input.trim() || !clientRef.current) return;
    clientRef.current.publish({
      destination: "/app/new-message",
      body: JSON.stringify({ user: username, message: input }),
    });
    setInput("");
  }

  const time = () =>
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (screen === "login") {
    return (
      <div className="app">
        <div className="login-card">
          <p className="login-eyebrow">// CHAT</p>
          <h1 className="login-title">Live Chat</h1>
          <p className="login-subtitle">real-time via websocket</p>

          <label className="field-label" htmlFor="un">
            USERNAME
          </label>
          <input
            id="un"
            className="field-input"
            placeholder="seu_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && connect()}
            autoFocus
          />

          <button
            className="btn-primary"
            onClick={connect}
            disabled={!username.trim()}
          >
            CONECTAR →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-wrapper">
        <div className="chat-header">
          <div className="header-left">
            <div className="status-dot" />
            <div>
              <div className="chat-title">Live Chat</div>
              <div className="chat-user">// {username}</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={disconnect}>
            DESCONECTAR
          </button>
        </div>

        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <span>▌ aguardando mensagens...</span>
            </div>
          )}

          {messages.map((m) => {
            if (m.type === "system") {
              return (
                <div key={m.id} className="msg-row">
                  <div className="msg-bubble system">— {m.content}</div>
                </div>
              );
            }
            const { author, text } = parseMsg(m.content);
            const own = author === username;
            return (
              <div key={m.id} className="msg-row">
                {author && (
                  <div className="msg-meta">
                    <span className="author">{author}</span>
                    <span>{time()}</span>
                  </div>
                )}
                <div className={`msg-bubble${own ? " own" : ""}`}>{text}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="input-bar">
          <input
            className="msg-input"
            placeholder="mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={!connected}
          />
          <button
            className="btn-send"
            onClick={send}
            disabled={!input.trim() || !connected}
          >
            ENVIAR ↵
          </button>
        </div>
      </div>
    </div>
  );
}
