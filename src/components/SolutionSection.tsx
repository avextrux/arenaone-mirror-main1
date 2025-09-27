import { useEffect, useState } from "react";
import { Building, Target, Network, Sparkles } from "lucide-react";

const SolutionSection = () => {
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

    const section = document.getElementById('solucao');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      icon: Building,
      title: "Infraestrutura Fundamental",
      description: "Não somos um 'aplicativo' melhor, mas sim a infraestrutura sobre a qual todos os outros aplicativos e processos irão operar.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Target,
      title: "Uma Fonte da Verdade",
      description: "Unificamos silos de dados em uma única fonte da verdade, transformando caos em rede organizada.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Network,
      title: "Efeito de Rede Trilateral",
      description: "Clubes adotam para eficiência operacional, jogadores para controle de carreira, agentes para acesso transparente.",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Sparkles,
      title: "IA Proprietary Engine",
      description: "Nossa inteligência artificial proprietária analisa padrões globais para predizer performance, valor de mercado e oportunidades.",
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <section id="solucao" className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <img 
              src="/images/solution-icon.svg" 
              alt="Solução" 
              className="w-20 h-20 float-animation hover-scale" 
            />
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
            Nossa <span className="gradient-text">Solução</span> Inovadora
          </h2>
          <h3 className="text-2xl lg:text-3xl font-heading font-semibold text-primary mb-6">
            ArenaOne - O Global Football OS
          </h3>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A ArenaOne não é mais uma ferramenta pontual. É a primeira plataforma integrada do mundo 
            que conecta todas as operações de um clube, performance em campo e gestão de carreira 
            dos atletas em um único sistema operacional inteligente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`
                group relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50
                hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`w-16 h-16 ${solution.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <solution.icon className={`w-8 h-8 ${solution.color}`} />
              </div>
              
              <h3 className="text-xl font-heading font-semibold mb-4 group-hover:text-primary transition-colors">
                {solution.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                {solution.description}
              </p>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          ))}
        </div>

      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};
export default SolutionSection;