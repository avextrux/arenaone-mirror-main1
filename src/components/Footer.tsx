import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-primary-foreground py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4 group cursor-pointer">
              <img 
                src="/images/arenaone-logo.svg" 
                alt="ArenaOne" 
                className="h-8 w-auto logo-hover transition-all duration-300" 
              />
              <span className="ml-2 text-xl font-bold group-hover:gradient-text transition-all duration-300">ArenaOne</span>
            </div>
            <p className="text-sm opacity-80 mb-4">
              O Sistema Operacional do Futebol Global. Transformando a indústria de US$ 700 bilhões 
              através de tecnologia e inteligência.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground hover:text-accent transition-all duration-300 hover-scale hover:translate-y-1">
                LinkedIn
              </a>
              <a href="#" className="text-primary-foreground hover:text-accent transition-all duration-300 hover-scale hover:translate-y-1">
                Twitter
              </a>
              <a href="#" className="text-primary-foreground hover:text-accent transition-all duration-300 hover-scale hover:translate-y-1">
                Instagram
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="animate-fade-in-up animate-stagger-1">
            <h3 className="font-semibold mb-4 hover:text-accent transition-colors">Plataforma</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Club OS</a></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Performance OS</a></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Player OS</a></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Marketplace</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="animate-fade-in-up animate-stagger-2">
            <h3 className="font-semibold mb-4 hover:text-accent transition-colors">Empresa</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/terms-of-service" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Termos de Serviço</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Política de Privacidade</Link></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Sobre</a></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Carreiras</a></li>
              <li><a href="#" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Imprensa</a></li>
              <li><a href="#contato" className="hover:text-accent transition-all duration-300 hover:translate-x-2 block py-1">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
          <p>&copy; 2024 ArenaOne. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;