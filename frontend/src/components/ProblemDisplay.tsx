import { ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProblemDisplayProps {
  imageUrl: string;
}

const ProblemDisplay = ({ imageUrl }: ProblemDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            問題文
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <Bookmark
            className={`w-5 h-5 transition-colors ${
              isBookmarked
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <img
                src={imageUrl}
                alt="アップロードされた問題"
                className="w-full rounded-xl object-contain max-h-64 bg-muted"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProblemDisplay;
