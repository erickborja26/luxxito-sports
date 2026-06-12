import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trophy, Search, Shield, Clock, Bell, Zap, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import hero from "@/assets/hero-field.jpg";
import { api, Paginated, unwrap } from "@/lib/api";
import { Complejo, Deporte } from "@/lib/domain";

export default function Landing() {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);

  useEffect(() => {
    Promise.all([
      api<Paginated<Complejo> | Complejo[]>("/complejos/?page_size=20"),
      api<Deporte[]>("/deportes/"),
    ]).then(([complexes, sports]) => {
      setComplejos(unwrap(complexes));
      setDeportes(sports);
    }).catch(() => undefined);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/luxxito-sports-logo.png"
              alt="LuxxitoSports"
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg">LuxxitoSports</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#beneficios" className="hover:text-accent transition">Beneficios</a>
            <a href="#buscar" className="hover:text-accent transition">Buscar</a>
            <a href="#complejos" className="hover:text-accent transition">Complejos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
            <Link to="/registro"><Button size="sm" className="bg-gradient-accent border-0">Registrarse</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={hero}
            alt="Cancha de fútbol al atardecer"
            className="w-full h-full object-cover object-center"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-65" />
        </div>
        <div className="container relative z-10 text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6 backdrop-blur">
            <Zap className="w-3.5 h-3.5 text-accent" /> Disponibilidad en tiempo real
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance leading-[1.05] mb-6">
            Reserva canchas <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">sin llamadas</span><br />ni mensajes
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 text-balance">
            La plataforma deportiva más rápida del Perú. Consulta horarios, paga seguro y juega. Sin overbookings, sin esperas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/registro"><Button size="lg" className="bg-gradient-accent border-0 shadow-glow text-base h-12 px-8">Ver disponibilidad</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 px-8">Iniciar sesión</Button></Link>
          </div>
        </div>
      </section>

      {/* Buscador */}
      <section id="buscar" className="container -mt-16 relative z-10">
        <Card className="p-6 shadow-elegant border-0 bg-card/95 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Select><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger>
              <SelectContent>{deportes.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nombre}</SelectItem>)}</SelectContent>
            </Select>
            <Select><SelectTrigger><SelectValue placeholder="Complejo" /></SelectTrigger>
              <SelectContent>{complejos.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" defaultValue="2026-06-08" />
            <Input type="time" defaultValue="19:00" />
            <Link to="/login"><Button className="w-full h-10 bg-gradient-accent border-0"><Search className="w-4 h-4 mr-2" />Buscar</Button></Link>
          </div>
        </Card>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="container py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Por qué LuxxitoSports</p>
          <h2 className="text-3xl md:text-5xl font-bold text-balance">Diseñado para jugadores exigentes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Shield, t: "Cero overbookings", d: "Bloqueo temporal de 20 min garantiza tu horario." },
            { icon: CheckCircle2, t: "Pagos seguros", d: "Tarjeta, Yape o transferencia con validación." },
            { icon: Bell, t: "Recordatorios", d: "Notificaciones antes de cada partido." },
            { icon: Clock, t: "Precios dinámicos", d: "Aprovecha horas valle con tarifas reducidas." },
          ].map((b, i) => (
            <Card key={i} className="p-6 bg-gradient-card border shadow-card hover:shadow-elegant transition group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent grid place-items-center mb-4 group-hover:bg-gradient-accent group-hover:text-accent-foreground transition">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{b.t}</h3>
              <p className="text-sm text-muted-foreground">{b.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Complejos */}
      <section id="complejos" className="bg-secondary/40 py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Complejos destacados</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {complejos.map(c => (
              <Card key={c.id} className="overflow-hidden group cursor-pointer hover:shadow-elegant transition">
                <div className="aspect-video bg-gradient-hero relative">
                  <div className="absolute inset-0 grid place-items-center">
                    <Trophy className="w-12 h-12 text-accent/70" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{c.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{c.direccion} · {c.ciudad}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <Card className="p-10 lg:p-16 bg-gradient-hero text-primary-foreground border-0 shadow-elegant">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">¿Tienes un complejo deportivo?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Únete a LuxxitoSports y comienza a recibir reservas en menos de 5 minutos.</p>
          <Link to="/registro"><Button size="lg" className="bg-gradient-accent border-0 shadow-glow">Registrar mi complejo</Button></Link>
        </Card>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 LuxxitoSports — Sistema de reservas deportivas
      </footer>
    </div>
  );
}
