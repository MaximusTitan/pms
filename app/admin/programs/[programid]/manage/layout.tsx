import { ProgramNavigation } from "@/components/program-navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    programid: string; // Changed to 'programid' to match the route
  };
}

export default async function Layout({ children, params }: LayoutProps) {
  const { programid } = await params; // Await the params
  return (
    <div className="flex min-h-screen">
      <ProgramNavigation programId={programid} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
