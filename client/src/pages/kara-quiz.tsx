import { KaraShell } from "@/components/kara/KaraShell";
import { KaraQuiz } from "@/components/kara/KaraQuiz";

export default function KaraQuizPage() {
  return (
    <KaraShell activeTab="quiz" showAdminButton={false}>
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <KaraQuiz />
      </div>
    </KaraShell>
  );
}
