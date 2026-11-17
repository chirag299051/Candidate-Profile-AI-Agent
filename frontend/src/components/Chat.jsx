
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import "./Chat.css";
function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const initializeChat = async () => {
      try {
        const response = await api.get("/conversations");
        const conversations = response.data.conversations;
        if (conversations.length > 0) {
          const latestConversation = conversations[0];
          const conversationResponse = await api.get(
            `/conversations/${latestConversation.id}`
          );
          setConversationId(conversationResponse.data.conversation.id);
          setMessages(conversationResponse.data.conversation.messages);
        } else {
          const newConversation = await api.post("/conversations");
          setConversationId(newConversation.data.conversation.id);
        }
      } catch (err) {
        console.error("Chat initialization failed:", err);
        setError("Unable to load your conversation. Please refresh the page.");
      } finally {
        setInitializing(false);
      }
    };
    initializeChat();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading || !conversationId) return;
    setQuestion("");
    setError("");
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: trimmedQuestion,
        createdAt: new Date()
      }
    ]);
    setLoading(true);
    try {
      const response = await api.post(
        `/chat/${conversationId}/messages`,
        { question: trimmedQuestion }
      );
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources,
          createdAt: new Date()
        }
      ]);
    } catch (err) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: err.response?.data?.message ||
            "Unable to get an answer. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  if (initializing) {
    return (
      <div className="chat-container">
        <p>Loading your conversation...</p>
      </div>
    );
  }
  if (error && !conversationId) {
    return (
      <div className="chat-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="chat-container">
      <h1>Candidate Profile AI Agent</h1>
      <p>Ask me anything about the candidate's skills, projects, and experience.</p>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={index}>
            <strong>{message.role === "user" ? "You" : "AI Assistant"}</strong>
            <div className="markdown-content">
  <ReactMarkdown>
    {message.content?.replace(/\\([*_`])/g, "$1")}
  </ReactMarkdown>
</div>
            {message.sources?.length > 0 && (
              <details>
                <summary>View sources ({message.sources.length})</summary>
                {message.sources.map((source, sourceIndex) => (
                  <div className="chat-source" key={sourceIndex}>
                    <strong>{source.section}</strong>
                    <p>{source.content}</p>
                    {source.score !== null && source.score !== undefined && (
  <small>Similarity: {source.score.toFixed(4)}</small>
)}
                  </div>
                ))}
              </details>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <strong>AI Assistant</strong>
            <p>Thinking...</p>
          </div>
        )}
      </div>
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the candidate..."
          disabled={loading || !conversationId}
        />
        <button
          type="submit"
          disabled={loading || !question.trim() || !conversationId}
        >
          Send
        </button>
      </form>
    </div>
  );
}
export default Chat;
