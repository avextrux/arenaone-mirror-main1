import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

const PlatformSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('plataforma');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="plataforma" className="py-24 bg-gradient-to-br from-muted/30 via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <img 
              src="/images/platform-icon.svg" 
              alt="Plataforma" 
              className="w-20 h-20 float-animation hover-scale group-hover:rotate-12 transition-all duration-300" 
            />
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 gradient-text">
            Arquitetura da Plataforma
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-stagger-1">
            Três Ecossistemas Integrados que Revolucionam o Futebol Global
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Club OS */}
          <Card className={`relative p-8 hover:shadow-2xl transition-all duration-500 hover-lift hover-glow group card-entrance cursor-pointer border border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm ${isVisible ? 'animate-fade-in-up animate-stagger-1' : 'opacity-0'}`}>
            <CardContent className="space-y-6 p-0">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🏢</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-primary mb-2 group-hover:gradient-text transition-all">Club OS</h3>
                <h4 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors">A Sala da Diretoria</h4>
                <p className="text-muted-foreground mb-6 group-hover:text-foreground transition-colors leading-relaxed">
                  Centro de comando para gestão estratégica e financeira.
                </p>
              </div>
              
              <ul className="space-y-4 text-sm">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-primary transition-colors">Planejamento financeiro e orçamentário</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-primary transition-colors">Gestão de contratos e ativos</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-primary transition-colors">Governança e compliance</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-primary transition-colors">Marketplace de transferências integrado</span>
                </li>
              </ul>

              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold">Sistema Executivo</div>
                <div className="text-xs opacity-80">Para diretores e gestores</div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </CardContent>
          </Card>

          {/* Performance OS */}
          <Card className={`relative p-8 hover:shadow-2xl transition-all duration-500 hover-lift hover-glow group card-entrance cursor-pointer border border-border/50 hover:border-accent/30 bg-card/80 backdrop-blur-sm ${isVisible ? 'animate-fade-in-up animate-stagger-2' : 'opacity-0'}`}>
            <CardContent className="space-y-6 p-0">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-3xl group-hover:scale-110 transition-transform">⚽</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-accent mb-2 group-hover:gradient-text transition-all">Performance OS</h3>
                <h4 className="text-lg font-semibold mb-4 group-hover:text-accent transition-colors">Campo e Treinamento</h4>
                <p className="text-muted-foreground mb-6 group-hover:text-foreground transition-colors leading-relaxed">
                  Plataforma 360º para otimização do desempenho esportivo.
                </p>
              </div>
              
              <ul className="space-y-4 text-sm">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-accent transition-colors">Integração nativa de wearables e GPS</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-accent transition-colors">Análise tática e de vídeo avançada</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-accent transition-colors">Departamento médico centralizado</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-accent transition-colors">Scouting potencializado por IA</span>
                </li>
              </ul>

              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold">Sistema Técnico</div>
                <div className="text-xs opacity-80">Para comissão técnica</div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </CardContent>
          </Card>

          {/* Player OS */}
          <Card className={`relative p-8 hover:shadow-2xl transition-all duration-500 hover-lift hover-glow group card-entrance cursor-pointer border border-border/50 hover:border-green-500/30 bg-card/80 backdrop-blur-sm ${isVisible ? 'animate-fade-in-up animate-stagger-3' : 'opacity-0'}`}>
            <CardContent className="space-y-6 p-0">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-3xl group-hover:scale-110 transition-transform">👤</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-green-600 mb-2 group-hover:gradient-text transition-all">Player OS</h3>
                <h4 className="text-lg font-semibold mb-4 group-hover:text-green-600 transition-colors">A Vida do Atleta</h4>
                <p className="text-muted-foreground mb-6 group-hover:text-foreground transition-colors leading-relaxed">
                  Nossa arma secreta para aquisição viral e empoderamento.
                </p>
              </div>
              
              <ul className="space-y-4 text-sm">
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-green-600 transition-colors">Gestão de carreira 360º</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-green-600 transition-colors">Planejamento financeiro e patrimonial</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-green-600 transition-colors">Planejamento pós-carreira</span>
                </li>
                <li className="flex items-start group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="group-hover:text-green-600 transition-colors">Marketplace de serviços vistoriados</span>
                </li>
              </ul>

              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold">Sistema do Jogador</div>
                <div className="text-xs opacity-80">Para atletas e agentes</div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;