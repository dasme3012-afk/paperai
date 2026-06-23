import { AppHeader } from "@/components/app-header";
import { ProjectLoader } from "@/components/project-loader";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <AppHeader />
      <ProjectLoader id={id} />
    </>
  );
}
