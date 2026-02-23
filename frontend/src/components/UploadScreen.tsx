import { useState, useCallback } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UploadScreenProps {
  onImageUploaded: (imageUrl: string) => void;
}

const UploadScreen = ({ onImageUploaded }: UploadScreenProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          onImageUploaded(e.target?.result as string);
          setIsUploading(false);
        }, 600);
      };
      reader.readAsDataURL(file);
    },
    [onImageUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-soft">
          <Camera className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          問題を写真で解こう
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          大学受験の問題をアップロードすると、AIが解答・解説をステップごとに表示します
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-lg"
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
            ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]"
            }
            shadow-card
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-lg mb-1">
                    問題の画像をドラッグ＆ドロップ
                  </p>
                  <p className="text-muted-foreground text-sm">
                    または下のボタンからアップロード
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Button
                    asChild
                    size="lg"
                    className="gradient-primary text-primary-foreground shadow-soft hover:opacity-90 cursor-pointer"
                  >
                    <span>
                      <ImageIcon className="w-5 h-5 mr-2" />
                      画像を選択
                    </span>
                  </Button>
                </label>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="cursor-pointer"
                  >
                    <span>
                      <Camera className="w-5 h-5 mr-2" />
                      カメラで撮影
                    </span>
                  </Button>
                </label>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-sm mt-8"
      >
        対応形式: JPG, PNG, HEIC ・ 最大10MB
      </motion.p>
    </div>
  );
};

export default UploadScreen;
