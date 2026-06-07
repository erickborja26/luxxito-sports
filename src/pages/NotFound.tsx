import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero text-primary-foreground p-6">
      <div className="text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-white/70 mb-6">Esta página se nos escapó como una pelota...</p>
        <Link to="/"><Button className="bg-gradient-accent border-0">Volver al inicio</Button></Link>
      </div>
    </div>
  );
}
