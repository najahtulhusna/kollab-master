import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold underline">Test Tailwind</h1>

      <h4>Test supabase in /login page</h4>
      <Button>Test Shadcn</Button>
    </div>
  );
}
