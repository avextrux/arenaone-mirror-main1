import { useEffect, useState } from "react";
import { AlertTriangle, TrendingDown, Database, Zap } from "lucide-react";

const ProblemSection = () => {
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

    const section = document.getElementById('problema');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const problems = [
    {
      icon: TrendingDown,
      title: "Gestão Amadora em Escala Bilionária",
      description: "Os 20 maiores clubes do mundo geraram receita recorde de €11.2 bilhões na temporada 2023/24, com o Real Madrid ultrapassando €1 bilhão. Porém, esta é uma das poucas indústrias multibilionárias ainda gerida por práticas amadoras e instintivas."
    },
    {
      icon: AlertTriangle,
      title: "Instabilidade Financeira Crônica",
      description: "A ausência de governança corporativa resulta em decisões emocionais desastrosas. Clubes enfrentam dificuldades históricas de fluxo de caixa, com receitas concentradas na venda de atletas e direitos de TV."
    },
    {
      icon: Database,
      title: "Silos de Dados Desconectados",
      description: "Cada departamento opera como reino isolado: diretoria analisa planilhas financeiras, comissão técnica foca em wearables, scouting usa plataformas de vídeo, departamento médico mantém registros próprios."
    },
    {
      icon: Zap,
      title: "Decisões Sem Base Científica",
      description: "Contratações multimilionárias baseadas em intuição e networking, sem análise preditiva. Falta de métricas unificadas para avaliar performance real vs investimento realizado."
    }
  ];

  return (
    <section id="problema" className="py-24 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
            O <span className="gradient-text">Problema</span> que Enfrentamos
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A indústria do futebol de <strong className="text-primary font-heading">US$ 700 bilhões</strong> ainda opera 
            com sistemas fragmentados, processos manuais e falta de transparência.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`
                group bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 
                hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-500 
                hover:-translate-y-2 hover:shadow-xl card-glow
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-destructive/20 group-hover:scale-110 transition-all duration-300">
                <problem.icon className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-4 group-hover:text-destructive transition-colors">
                {problem.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-destructive/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-muted/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default ProblemSection;