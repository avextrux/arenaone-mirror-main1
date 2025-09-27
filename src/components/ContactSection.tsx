import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    message: ""
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('contato');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado", formData);
    alert("Mensagem enviada com sucesso!");
    setFormData({ name: "", email: "", role: "", message: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contato" className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-hover/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
            Entre em <span className="text-accent">Contato</span>
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Quer saber mais sobre como a ArenaOne pode transformar seu clube ou carreira? 
            Nossa equipe está pronta para ajudar.
          </p>
        </div>

        <Card className={`bg-white/95 backdrop-blur-sm text-foreground shadow-2xl border-0 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="name" className="group-hover:text-primary transition-colors">Nome *</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome completo" 
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="group-hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20" 
                    required 
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="group-hover:text-primary transition-colors">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="group-hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="role" className="group-hover:text-primary transition-colors">Você é... *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="group-hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clube">🏆 Representante de Clube</SelectItem>
                    <SelectItem value="atleta">⚽ Atleta</SelectItem>
                    <SelectItem value="agente">💼 Agente/Empresário</SelectItem>
                    <SelectItem value="scout">🔍 Scout</SelectItem>
                    <SelectItem value="outro">👤 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="message" className="group-hover:text-primary transition-colors">Mensagem *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Conte-nos mais sobre seu interesse na ArenaOne... Como podemos ajudá-lo a revolucionar o futebol?"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="group-hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground btn-shimmer hover-glow transition-all duration-300 hover:scale-105 hover:shadow-xl relative group"
              >
                <span>📨 Enviar Mensagem</span>
                {/* Hover tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                  Resposta em até 24h
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;