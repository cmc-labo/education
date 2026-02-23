import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubble } from "./SolutionTabs";
import { sendChatMessage } from "@/lib/dify";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function normalizeMath(content: string): string {
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_: string, math: string) => `$$${math}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_: string, math: string) => `$${math}$`);
}

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatSectionProps {
  conversationId: string;
}

const ChatSection = ({ conversationId }: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "呼んでくれてありがとう！\nどこがわからなかったかな？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] =
    useState(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        query: userMsg,
        conversationId: currentConversationId || undefined,
      });
      if (!currentConversationId && response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
      }
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response.answer },
      ]);
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "返答の取得に失敗しました";
      setMessages((prev) => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 p-4 space-y-1">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble role={msg.role === "ai" ? "ai" : "user"}>
                {msg.role === "ai" ? (
                  <div className="text-sm leading-relaxed [&>p]:mb-1 [&>p:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {normalizeMath(msg.content)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </ChatBubble>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-soft">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-chat-ai rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="ここから質問してみよう"
            className="flex-1 bg-secondary text-secondary-foreground rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="gradient-primary text-primary-foreground rounded-xl px-4 py-3 font-semibold text-sm shadow-soft hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
