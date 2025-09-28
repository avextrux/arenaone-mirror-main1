import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate("/auth");
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer" onClick={() => navigate("/")}>
            <img src="/images/arenaone-logo.svg" alt="ArenaOne" className="h-[120px] w-auto logo-hover transition-all duration-300" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#problema" className="nav-link text-foreground hover:text-primary font-medium py-2">
              O Problema
            </a>
            <a href="#solucao" className="nav-link text-foreground hover:text-primary font-medium py-2">
              A Solução
            </a>
            <a href="#plataforma" className="nav-link text-foreground hover:text-primary font-medium py-2">
              Plataforma
            </a>
            <a href="#contato" className="nav-link text-foreground hover:text-primary font-medium py-2">
              Contato
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                  onClick={handleDashboard}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={handleAuthAction}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 hover-scale"
                  onClick={handleAuthAction}
                >
                  Login
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground btn-shimmer hover-glow transition-all duration-300"
                  onClick={handleAuthAction}
                >
                  Cadastre-se
                </Button>
                <Button 
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                  onClick={() => navigate("/club-auth")}
                >
                  Registrar Clube
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;