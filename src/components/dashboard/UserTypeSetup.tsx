import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Flag, Footprints } from "lucide-react"; // Mantendo apenas os ícones específicos do player
import { userTypeOptions, getSpecializationPlaceholder } from "@/lib/userTypeUtils"; // Importando do novo utilitário

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
    achievements: "",
    // Player specific fields
    date_of_birth: "",
    nationality: "",
    position: "",
    preferred_foot: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar userTypeOptions para remover 'club' e 'fan' se não precisarem de setup adicional aqui
  const filteredUserTypeOptions = userTypeOptions.filter(
    (type) => type.value !== "club" && type.value !== "fan"
  );

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
                {filteredUserTypeOptions.map((type) => {
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

  const selectedTypeData = userTypeOptions.find(t => t.value === selectedType);

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
          {selectedType === "player" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidade *</Label>
                  <Input
                    id="nationality"
                    placeholder="Ex: Brasileira"
                    value={profileData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Posição *</Label>
                  <Select
                    value={profileData.position}
                    onValueChange={(value) => handleInputChange("position", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goleiro">Goleiro</SelectItem>
                      <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                      <SelectItem value="Lateral Direito">Lateral Direito</SelectItem>
                      <SelectItem value="Lateral Esquerdo">Lateral Esquerdo</SelectItem>
                      <SelectItem value="Volante">Volante</SelectItem>
                      <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                      <SelectItem value="Ponta Direita">Ponta Direita</SelectItem>
                      <SelectItem value="Ponta Esquerda">Ponta Esquerda</SelectItem>
                      <SelectItem value="Atacante">Atacante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_foot">Pé Preferido</Label>
                  <Select
                    value={profileData.preferred_foot}
                    onValueChange={(value) => handleInputChange("preferred_foot", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direito">Direito</SelectItem>
                      <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                      <SelectItem value="Ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

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