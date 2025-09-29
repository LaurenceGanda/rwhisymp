import { Header } from '@/components/layout/Header';
import SpeechRecognitionApp from '@/components/SpeechRecognitionApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <Header />
        <SpeechRecognitionApp />
      </div>
    </div>
  );
};

export default Index;
