import InterviewClientPage from "./InterviewClientPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { id } = await params;
  return <InterviewClientPage id={id} />;
}
