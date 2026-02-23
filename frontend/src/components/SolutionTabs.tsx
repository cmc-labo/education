import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Bot, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface SolutionTabsProps {
  isLoading: boolean;
  answer: string;
  error: string | null;
}

interface Step {
  title: string;
  content: string;
}

function parseIntoSteps(text: string): Step[] {
  const lines = text.split("\n");
  const stepStarts: number[] = [];

  const stepHeadingRe = /^(?:ステップ\s*\d+|Step\s+\d+|\d+[.．])\s*[：:．]?/;

  lines.forEach((line, i) => {
    if (stepHeadingRe.test(line.trim()) && line.trim().length > 2) {
      stepStarts.push(i);
    }
  });

  if (stepStarts.length >= 2) {
    return stepStarts.map((start, idx) => {
      const end =
        idx + 1 < stepStarts.length ? stepStarts[idx + 1] : lines.length;
      const title = lines[start].trim();
      const content = lines
        .slice(start + 1, end)
        .join("\n")
        .trim();
      return { title, content };
    });
  }

  // Fallback: split by blank lines
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 2) {
    return paragraphs.map((p, i) => ({
      title: `ステップ${i + 1}`,
      content: p.trim(),
    }));
  }

  return [{ title: "解説", content: text }];
}

const SolutionTabs = ({ isLoading, answer, error }: SolutionTabsProps) => {
  const [activeTab, setActiveTab] = useState<"answer" | "explanation">(
    "answer"
  );
  const [displayMode, setDisplayMode] = useState<"all" | "step">("all");
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-soft animate-pulse">
          <Bot className="w-7 h-7 text-primary-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">AIが問題を解析中...</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="text-sm text-destructive text-center">{error}</p>
      </div>
    );
  }

  const steps = parseIntoSteps(answer);

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("answer")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "answer"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          解答
          {activeTab === "answer" && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("explanation")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "explanation"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          解説
          {activeTab === "explanation" && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full"
            />
          )}
        </button>
      </div>

      {/* Display mode toggle for explanation */}
      {activeTab === "explanation" && (
        <div className="flex gap-2 p-4 pb-0">
          <button
            onClick={() => setDisplayMode("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              displayMode === "all"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            全部表示
          </button>
          <button
            onClick={() => {
              setDisplayMode("step");
              setCurrentStep(0);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              displayMode === "step"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            ステップ表示
          </button>
        </div>
      )}

      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === "answer" ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ChatBubble role="ai">
                <MarkdownContent content={answer} />
                <FeedbackButtons />
              </ChatBubble>
              <ChatBubble role="assistant-prompt">
                <p className="text-sm">
                  わからないところがあったら、解説も見てみてね
                </p>
              </ChatBubble>
            </motion.div>
          ) : displayMode === "all" ? (
            <motion.div
              key="explanation-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ChatBubble role="ai">
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-primary mb-1">
                        {step.title}
                      </p>
                      <MarkdownContent content={step.content} />
                    </div>
                  ))}
                </div>
                <FeedbackButtons />
              </ChatBubble>
            </motion.div>
          ) : (
            <motion.div
              key="explanation-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AnimatePresence mode="wait">
                {steps.slice(0, currentStep + 1).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <ChatBubble role="ai">
                      <p className="text-xs font-semibold text-primary mb-1">
                        {step.title}
                      </p>
                      <MarkdownContent content={step.content} />
                    </ChatBubble>
                  </motion.div>
                ))}
              </AnimatePresence>

              {currentStep < steps.length - 1 ? (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="gradient-primary text-primary-foreground shadow-soft"
                  >
                    次のステップを表示する
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground border border-dashed border-border rounded-xl py-3 px-4">
                    ステップ解説 END
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MarkdownContent = ({ content }: { content: string }) => (
  <div className="text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>li]:mb-1 [&>pre]:bg-muted [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:overflow-x-auto [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&>h1]:text-base [&>h1]:font-bold [&>h2]:text-sm [&>h2]:font-bold [&>h3]:text-sm [&>h3]:font-semibold">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
);

export const ChatBubble = ({
  role,
  children,
}: {
  role: "ai" | "user" | "assistant-prompt";
  children: React.ReactNode;
}) => {
  const isUser = role === "user";
  return (
    <div
      className={`flex gap-2 mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : role === "assistant-prompt"
            ? "bg-card border border-border text-foreground rounded-bl-md shadow-card"
            : "bg-chat-ai text-chat-ai-foreground rounded-bl-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const FeedbackButtons = () => (
  <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
    <button className="p-1 rounded hover:bg-background/50 transition-colors text-muted-foreground hover:text-primary">
      <ThumbsUp className="w-4 h-4" />
    </button>
    <button className="p-1 rounded hover:bg-background/50 transition-colors text-muted-foreground hover:text-destructive">
      <ThumbsDown className="w-4 h-4" />
    </button>
  </div>
);

export default SolutionTabs;
