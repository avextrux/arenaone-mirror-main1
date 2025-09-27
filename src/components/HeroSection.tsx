import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ clubs: 0, athletes: 0, countries: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    setIsVisible(true);
    
    // Animated counters
    const animateCount = (target: number, key: keyof typeof counts) => {
      let start = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCounts(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounts(prev => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 40);
    };

    setTimeout(() => {
      animateCount(500, 'clubs');
      animateCount(10000, 'athletes');
      animateCount(30, 'countries');
    }, 1000);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setMousePosition({
      x: (x - centerX) / centerX,
      y: (y - centerY) / centerY
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getTransformStyle = () => {
    if (!isHovering) return {};
    
    const rotateX = mousePosition.y * -10;
    const rotateY = mousePosition.x * 10;
    const scale = 1.05;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
    };
  };

  return (
    <section className="hero-bg text-primary-foreground py-32 lg:py-40 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-hover/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-10 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight animate-stagger-1">
              O Sistema Operacional do{" "}
              <span className="gradient-text">Futebol Global</span>
            </h1>
            
            <p className="text-xl lg:text-2xl leading-relaxed opacity-90 animate-fade-in-up animate-stagger-2 font-medium">
              A plataforma que transformará a indústria de{" "}
              <strong className="text-accent font-heading">US$ 700 bilhões</strong> do futebol, unificando operações de clubes, 
              performance de atletas e gestão de carreiras em um único ecossistema inteligente.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up animate-stagger-3">
              <Button 
                size="lg" 
                className="group relative bg-primary hover:bg-primary-hover text-primary-foreground font-heading font-semibold px-8 py-4 text-lg hover:scale-105 hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => navigate("/dashboard")} // Navigate to dashboard
              >
                <span>🚀 Conheça a Plataforma</span>
                {/* Hover tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                  Explore nosso ecossistema completo
                </div>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="group relative bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 font-heading font-semibold px-8 py-4 text-lg hover:scale-105 hover:shadow-lg transition-all duration-200 ease-in-out overflow-hidden"
                onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })} // Scroll to contact section
              >
                <span>📞 Solicitar Demo</span>
                {/* Hover tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                  Agende uma demonstração personalizada
                </div>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 animate-fade-in-up animate-stagger-4">
              <div className="text-center hover-scale cursor-pointer group relative">
                <div className="text-4xl lg:text-5xl font-heading font-bold text-accent counter-animate group-hover:scale-110 transition-transform duration-300">
                  {counts.clubs}+
                </div>
                <div className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Clubes Parceiros</div>
                {/* Hover tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-card border border-border px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                  <div className="font-semibold">Clubes Ativos</div>
                  <div className="text-muted-foreground">Em 35+ países</div>
                </div>
              </div>
              <div className="text-center hover-scale cursor-pointer group relative">
                <div className="text-4xl lg:text-5xl font-heading font-bold text-accent counter-animate group-hover:scale-110 transition-transform duration-300">
                  {counts.athletes.toLocaleString()}+
                </div>
                <div className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Atletas Ativos</div>
                {/* Hover tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-card border border-border px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                  <div className="font-semibold">Atletas Cadastrados</div>
                  <div className="text-muted-foreground">Profissionais ativos</div>
                </div>
              </div>
              <div className="text-center hover-scale cursor-pointer group relative">
                <div className="text-4xl lg:text-5xl font-heading font-bold text-accent counter-animate group-hover:scale-110 transition-transform duration-300">
                  {counts.countries}+
                </div>
                <div className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Países</div>
                {/* Hover tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-card border border-border px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                  <div className="font-semibold">Países Cobertos</div>
                  <div className="text-muted-foreground">Presença global</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image with enhanced 3D effect */}
          <div className={`relative ${isVisible ? 'animate-fade-in-right animate-stagger-2' : 'opacity-0'}`}>
            <div 
              className="relative hover-lift transition-all duration-500 group"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={getTransformStyle()}
            >
              <div className="relative">
                <img 
                  src="/images/football-hero.jpg" 
                  alt="Futebol Moderno" 
                  className="w-full rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 border-2 border-white/20"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl transition-all duration-500 animate-pulse-subtle"
                  style={{
                    background: isHovering 
                      ? `linear-gradient(135deg, 
                          hsla(var(--primary) / ${0.4 + Math.abs(mousePosition.x) * 0.3}) 0%, 
                          hsla(var(--primary) / 0.1) 30%,
                          transparent 70%,
                          hsla(var(--accent) / ${0.2 + Math.abs(mousePosition.y) * 0.2}) 100%)`
                      : 'linear-gradient(125deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.1), transparent)',
                    boxShadow: isHovering 
                      ? `inset ${mousePosition.x * 20}px ${mousePosition.y * 10}px 40px hsla(var(--primary) / 0.3), 
                         inset ${mousePosition.x * -15}px ${mousePosition.y * -5}px 30px hsla(var(--accent) / 0.2)`
                      : 'inset -5px -5px 20px hsla(var(--primary) / 0.2)',
                    transform: `skewY(-2deg) ${isHovering ? `skewY(${mousePosition.x * -3}deg)` : ''}`,
                  }}
                ></div>
                
                {/* Floating elements */}
                <div className="absolute top-6 right-6 w-6 h-6 bg-accent rounded-full float-animation shadow-lg"></div>
                <div className="absolute bottom-6 left-6 w-4 h-4 bg-primary-hover rounded-full float-animation shadow-lg" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-4 w-3 h-3 bg-white rounded-full float-animation shadow-lg" style={{ animationDelay: '4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;