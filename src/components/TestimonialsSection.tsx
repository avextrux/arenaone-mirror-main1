import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
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

    const section = document.getElementById('testimonials');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "Marco Silva",
      role: "Diretor Técnico, FC Barcelona Academy",
      content: "A ArenaOne revolucionou nossa abordagem de scouting. Conseguimos identificar talentos com 300% mais precisão usando suas análises preditivas.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Carla Santos", 
      role: "Agente FIFA, Elite Sports Management",
      content: "Como agente, preciso de dados confiáveis para negociar contratos. A plataforma me dá insights que nunca tive acesso antes.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Diego Fernández",
      role: "Ex-Jogador Profissional, Real Madrid",
      content: "Usar a ArenaOne durante minha transição de carreira foi fundamental. A plataforma me conectou com oportunidades que mudaram minha vida.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            O Que Nossos <span className="gradient-text">Clientes</span> Dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Histórias reais de profissionais que transformaram suas carreiras com a ArenaOne
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`
                group relative bg-card backdrop-blur-sm rounded-2xl p-8 border border-border/50
                hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Rating Stars */}
              <div className="flex mb-6 group-hover:scale-110 transition-transform duration-300">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:text-yellow-300 transition-colors" />
                ))}
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-foreground/90 mb-8 leading-relaxed text-lg group-hover:text-foreground transition-colors">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all"
                />
                <div>
                  <div className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Quote decoration */}
              <div className="absolute top-4 right-6 text-6xl text-primary/10 font-serif leading-none group-hover:text-primary/20 transition-colors">
                "
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold">Cliente Verificado ✓</div>
                <div className="text-xs opacity-80">{testimonial.rating}/5 estrelas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;