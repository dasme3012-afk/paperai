import { AppHeader } from "@/components/app-header";
import { PaperEditor } from "@/components/paper-editor";
import { createDemoProject } from "@/lib/demo-project";

export default function DemoPage() {
  return (
    <>
      <AppHeader />
      <PaperEditor project={createDemoProject()} demoMode />
    </>
  );
}
