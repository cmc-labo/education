import { useState } from "react";
import UploadScreen from "@/components/UploadScreen";
import SolutionPage from "@/pages/SolutionPage";

const Index = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  if (imageUrl) {
    return (
      <SolutionPage imageUrl={imageUrl} onBack={() => setImageUrl(null)} />
    );
  }

  return <UploadScreen onImageUploaded={setImageUrl} />;
};

export default Index;
