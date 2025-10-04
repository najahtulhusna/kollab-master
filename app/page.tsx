import { Switch } from "@mantine/core";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Test Tailwind</h1>
      <Switch defaultChecked label="Test Mantine" />
      <h4>Test supabase in /login page</h4>
    </div>
  );
}
