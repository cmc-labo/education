import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProblemDisplay from "@/components/ProblemDisplay";
import SolutionTabs from "@/components/SolutionTabs";
import ChatSection from "@/components/ChatSection";
import { Button } from "@/components/ui/button";
import { uploadAndSolve, dataURLtoBlob } from "@/lib/dify";

interface SolutionPageProps {
  imageUrl: string;
  onBack: () => void;
}

const SolutionPage = ({ imageUrl, onBack }: SolutionPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [answer, setAnswer] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const solve = async () => {
      try {
        const blob = dataURLtoBlob(imageUrl);
        const ext = blob.type.split("/")[1] || "jpg";
        const response = await uploadAndSolve(blob, `problem.${ext}`);
        setAnswer(response.answer);
        setConversationId(response.conversation_id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "解答の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    solve();
  }, [imageUrl]);

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">AI解答</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
        <div className="p-4">
          <ProblemDisplay imageUrl={imageUrl} />
        </div>

        {!showChat ? (
          <>
            <div className="flex-1">
              <SolutionTabs
                isLoading={isLoading}
                answer={answer}
                error={error}
              />
            </div>

            {!isLoading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 border-t border-border"
              >
                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  質問する
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <ChatSection conversationId={conversationId} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SolutionPage;
