"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/auth/test"); // call your GET route
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold underline">This is login page</h1>
      if (loading) return <p>Loading...</p>;
      <ul>
        {projects.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}
