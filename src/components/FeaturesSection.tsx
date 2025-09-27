import { useEffect, useState } from "react";
import { Target, Users, BarChart3, Shield, Zap, Globe } from "lucide-react";

const FeaturesSection = () => {
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

    const section = document.getElementById('features');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Target,
      title: "Análise Avançada",
      description: "IA proprietária para análise preditiva de performance de jogadores e resultados de partidas.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Gestão Integrada",
      description: "Plataforma unificada para clubes, jogadores, agentes e scouts em um único ecossistema.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: BarChart3,
      title: "Métricas em Tempo Real",
      description: "Dashboard com estatísticas ao vivo, análise de mercado e insights estratégicos.",
      color: "text-primary-hover",
      bgColor: "bg-primary-hover/10",
    },
    {
      icon: Shield,
      title: "Segurança Blockchain",
      description: "Contratos inteligentes para transparência total em transferências e negociações.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Zap,
      title: "Automação Completa",
      description: "Workflows automatizados para scouting, recrutamento e gestão de carreiras.",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Globe,
      title: "Alcance Global",
      description: "Conecte-se com mais de 500 clubes e 10.000 atletas em 30 países.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Recursos <span className="gradient-text">Revolucionários</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tecnologia de ponta que está transformando como o futebol global opera,
            desde a base até os maiores clubes do mundo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                group relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50
                hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              
              <h3 className="text-xl font-heading font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold">Saiba mais</div>
                <div className="text-xs opacity-80">Clique para explorar</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default FeaturesSection;