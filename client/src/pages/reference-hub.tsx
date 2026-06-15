import { KaraShell } from "@/components/kara/KaraShell";
import { ReferenceHub } from "@/components/reference/ReferenceHub";

export default function ReferenceHubPage() {
  return (
    <KaraShell activeTab="referentie" showAdminButton={false}>
      <ReferenceHub />
    </KaraShell>
  );
}
