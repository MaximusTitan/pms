import { ProgramNavigation } from "@/components/program-navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    programid: string;
  }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { programid } = await params;
  return (
    <div className="flex min-h-screen">
      {/* 
        If ProgramNavigation handles interactions, ensure it's a Client Component:
        <ProgramNavigation programId={programid} />
      */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
