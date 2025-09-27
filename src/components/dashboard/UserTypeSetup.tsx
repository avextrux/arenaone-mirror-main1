import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { User, Building, Briefcase, Target, Trophy, PenTool, Heart, Flag, Activity, Stethoscope, Calculator } from "lucide-react"; // Adicionei Stethoscope e Calculator

interface UserTypeSetupProps {
  onComplete: (userType: string, profileData: any) => Promise<void>;
}

const UserTypeSetup = ({ onComplete }: UserTypeSetupProps) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [profileData, setProfileData] = useState({
    bio: "",
    location: "",
    website: "",
    specialization: "",
    experience: "",
    achievements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userTypes = [
    {
      value: "player",
      label: "Jogador",
      icon: User,
      description: "Atleta profissional ou amador",
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: "club",
      label: "Clube",
      icon: Building,
      description: "Organização esportiva",
      color: "bg-red-100 text-red-800"
    },
    {
      value: "agent",
      label: "Agente",
      icon: Briefcase,
      description: "Representante de jogadores",
      color: "bg-green-100 text-green-800"
    },
    {
      value: "coach",
      label: "Técnico",
      icon: Target,
      description: "Treinador ou preparador",
      color: "bg-purple-100 text-purple-800"
    },
    {
      value: "scout",
      label: "Olheiro",
      icon: Trophy,
      description: "Observador de talentos",
      color: "bg-orange-100 text-orange-800"
    },
    {
      value: "journalist",
      label: "Jornalista",
      icon: PenTool,
      description: "Profissional de mídia esportiva",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      value: "referee",
      label: "Árbitro",
      icon: Flag,
      description: "Oficial de partida",
      color: "bg-gray-100 text-gray-800"
    },
    {
      value: "medical_staff",
      label: "Staff Médico",
      icon: Stethoscope, // Ícone atualizado
      description: "Profissional de saúde esportiva",
      color: "bg-teal-100 text-teal-800"
    },
    {
      value: "financial_staff",
      label: "Staff Financeiro",
      icon: Calculator, // Ícone atualizado
      description: "Profissional de finanças do clube",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      value: "technical_staff",
      label: "Staff Técnico",
      icon: Activity,
      description: "Profissional de apoio técnico",
      color: "bg-cyan-100 text-cyan-800"
    }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(selectedType, profileData);
    } catch (error) {
      console.error("Erro ao configurar perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getSpecializationPlaceholder = (type: string) => {
    const placeholders = {
      player: "Ex: Meio-campo, Atacante, Goleiro...",
      club: "Ex: Futebol profissional, Base, Feminino...",
      agent: "Ex: Negociação de contratos, Transferências internacionais...",
      coach: "Ex: Futebol de base, Preparação física, Análise técnica...",
      scout: "Ex: Talentos jovens, Mercado europeu, Futebol brasileiro...",
      journalist: "Ex: Cobertura de jogos, Entrevistas, Análise tática...",
      referee: "Ex: Futebol profissional, Arbitragem FIFA...",
      medical_staff: "Ex: Fisioterapia, Nutrição esportiva, Preparação física...",
      financial_staff: "Ex: Contabilidade, Orçamento, Análise de investimentos...",
      technical_staff: "Ex: Análise de dados, Suporte de vídeo, Tecnologia esportiva..."
    };
    return placeholders[type as keyof typeof placeholders] || "Descreva sua especialização...";
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Bem-vindo à ArenaOne!</CardTitle>
            <CardDescription>
              Escolha seu tipo de perfil para personalizar sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              <div className="grid md:grid-cols-3 gap-4">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="relative">
                      <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                      <Label
                        htmlFor={type.value}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <Icon className="mb-3 h-8 w-8" />
                        <Badge className={`mb-2 ${type.color}`}>
                          {type.label}
                        </Badge>
                        <span className="text-sm text-center text-muted-foreground">
                          {type.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
            
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedType}
                className="bg-primary hover:bg-primary-hover"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTypeData = userTypes.find(t => t.value === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {selectedTypeData && (
              <Badge className={`text-lg px-4 py-2 ${selectedTypeData.color}`}>
                {selectedTypeData.label}
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-heading">Complete seu perfil</CardTitle>
          <CardDescription>
            Adicione informações para criar uma presença profissional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você..."
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, Brasil"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://..."
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Especialização</Label>
            <Input
              id="specialization"
              placeholder={getSpecializationPlaceholder(selectedType)}
              value={profileData.specialization}
              onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiência</Label>
            <Textarea
              id="experience"
              placeholder="Descreva sua experiência profissional..."
              value={profileData.experience}
              onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Conquistas</Label>
            <Textarea
              id="achievements"
              placeholder="Liste suas principais conquistas..."
              value={profileData.achievements}
              onChange={(e) => setProfileData(prev => ({ ...prev, achievements: e.target.value }))}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover"
            >
              {isSubmitting ? "Criando perfil..." : "Finalizar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTypeSetup;