import { useEffect, useState } from "react";

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    revenue: 0,
    clubs: 0,
    players: 0,
    countries: 0,
    transfers: 0,
    satisfaction: 0
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

    const section = document.getElementById('stats');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animateCount = (target: number, key: keyof typeof counts, duration = 2000) => {
      let start = 0;
      const startTime = Date.now();
      
      const updateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(start + (target - start) * easeOutProgress);
        
        setCounts(prev => ({ ...prev, [key]: currentValue }));
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      
      updateCount();
    };

    // Delay counters for staggered effect
    setTimeout(() => animateCount(700, 'revenue'), 200);
    setTimeout(() => animateCount(500, 'clubs'), 400);
    setTimeout(() => animateCount(10000, 'players'), 600);
    setTimeout(() => animateCount(35, 'countries'), 800);
    setTimeout(() => animateCount(2500, 'transfers'), 1000);
    setTimeout(() => animateCount(98, 'satisfaction'), 1200);
  }, [isVisible]);

  const stats = [
    {
      number: counts.revenue,
      suffix: "B",
      prefix: "$",
      label: "Bilhões em Volume de Transferências",
      color: "text-primary"
    },
    {
      number: counts.clubs,
      suffix: "+",
      label: "Clubes Parceiros Globalmente",
      color: "text-accent"
    },
    {
      number: counts.players,
      suffix: "+",
      label: "Atletas na Plataforma",
      color: "text-primary-hover"
    },
    {
      number: counts.countries,
      suffix: "+",
      label: "Países com Presença Ativa",
      color: "text-purple-600"
    },
    {
      number: counts.transfers,
      suffix: "+",
      label: "Transferências Facilitadas",
      color: "text-green-600"
    },
    {
      number: counts.satisfaction,
      suffix: "%",
      label: "Satisfação dos Usuários",
      color: "text-orange-600"
    }
  ];

  return (
    <section id="stats" className="py-24 bg-gradient-to-r from-primary via-primary-dark to-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Números que <span className="text-accent">Impressionam</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Resultados concretos que demonstram o impacto da ArenaOne no ecossistema do futebol mundial
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                text-center group cursor-pointer relative
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                <div className={`text-3xl lg:text-4xl font-heading font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.prefix || ''}{stat.number.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-white/80 leading-tight group-hover:text-white transition-colors">
                  {stat.label}
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-foreground px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                  <div className="font-semibold">{stat.label}</div>
                  <div className="text-muted-foreground">
                    {index === 0 && "Volume total de negociações"}
                    {index === 1 && "Clubes ativos na plataforma"}
                    {index === 2 && "Jogadores cadastrados"}
                    {index === 3 && "Países com operações"}
                    {index === 4 && "Transferências realizadas"}
                    {index === 5 && "Avaliação dos usuários"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-hover/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Geometric decorations */}
      <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-accent/30 rotate-12 animate-bounce-slow"></div>
    </section>
  );
};

export default StatsSection;