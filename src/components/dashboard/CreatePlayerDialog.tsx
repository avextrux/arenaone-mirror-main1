import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Calendar, Ruler, Weight, Footprints, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppPlayer } from "@/types/app"; // Importar AppPlayer

interface CreatePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerCreated: () => void;
  clubId: string; // The ID of the club to which the player will be added
}

const CreatePlayerDialog = ({ open, onOpenChange, onPlayerCreated, clubId }: CreatePlayerDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerForm, setPlayerForm] = useState<Partial<AppPlayer>>({ // Usar Partial<AppPlayer>
    first_name: "",
    last_name: "",
    nationality: "",
    position: "",
    date_of_birth: "",
    height: null, // Alterado para null
    weight: null, // Alterado para null
    preferred_foot: "",
    market_value: null, // Alterado para null
    contract_start: "",
    contract_end: "",
  });

  const handleCreatePlayer = async () => {
    if (!user || !clubId) {
      toast({
        title: "Erro de Autenticação/Clube",
        description: "Você precisa estar logado e vinculado a um clube para adicionar jogadores.",
        variant: "destructive",
      });
      return;
    }

    if (!playerForm.first_name || !playerForm.last_name || !playerForm.nationality || !playerForm.position || !playerForm.date_of_birth) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, Sobrenome, Nacionalidade, Posição, Data de Nascimento).",
        variant: "destructive",
      });
      return;
    }

    // Validate date of birth (player must be at least 16 years old)
    const birthDate = new Date(playerForm.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16) {
      toast({
        title: "Idade inválida",
        description: "O jogador deve ter pelo menos 16 anos.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('players')
        .insert([{
          first_name: playerForm.first_name,
          last_name: playerForm.last_name,
          nationality: playerForm.nationality,
          position: playerForm.position,
          date_of_birth: playerForm.date_of_birth,
          height: playerForm.height,
          weight: playerForm.weight,
          preferred_foot: playerForm.preferred_foot || null,
          market_value: playerForm.market_value,
          contract_start: playerForm.contract_start || null,
          contract_end: playerForm.contract_end || null,
          current_club_id: clubId,
        }]);

      if (error) throw error;

      toast({
        title: "Jogador adicionado!",
        description: `${playerForm.first_name} ${playerForm.last_name} foi adicionado ao clube.`,
      });
      onPlayerCreated();
      onOpenChange(false);
      setPlayerForm({
        first_name: "", last_name: "", nationality: "", position: "", date_of_birth: "",
        height: null, weight: null, preferred_foot: "", market_value: null, contract_start: "", contract_end: "",
      });
    } catch (error: any) {
      console.error('Error creating player:', error);
      toast({
        title: "Erro ao adicionar jogador",
        description: error.message || "Não foi possível adicionar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adicionar Novo Jogador
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para adicionar um jogador ao seu clube.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nome *</Label>
              <Input
                id="first_name"
                placeholder="Ex: Vinicius"
                value={playerForm.first_name || ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Sobrenome *</Label>
              <Input
                id="last_name"
                placeholder="Ex: Júnior"
                value={playerForm.last_name || ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidade *</Label>
              <Input
                id="nationality"
                placeholder="Ex: Brasileira"
                value={playerForm.nationality || ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, nationality: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Posição *</Label>
              <Select
                value={playerForm.position || ""}
                onValueChange={(value) => setPlayerForm(prev => ({ ...prev, position: value }))}
                disabled={isSubmitting}
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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={playerForm.date_of_birth || ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_foot">Pé Preferido</Label>
              <Select
                value={playerForm.preferred_foot || ""}
                onValueChange={(value) => setPlayerForm(prev => ({ ...prev, preferred_foot: value }))}
                disabled={isSubmitting}
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Ex: 176"
                value={playerForm.height !== null ? playerForm.height.toString() : ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : null }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Ex: 70"
                value={playerForm.weight !== null ? playerForm.weight.toString() : ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, weight: e.target.value ? parseInt(e.target.value) : null }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market_value">Valor de Mercado (€)</Label>
              <Input
                id="market_value"
                type="number"
                placeholder="Ex: 5000000"
                value={playerForm.market_value !== null ? playerForm.market_value.toString() : ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, market_value: e.target.value ? parseFloat(e.target.value) : null }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_start">Início do Contrato</Label>
              <Input
                id="contract_start"
                type="date"
                value={playerForm.contract_start || ""}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, contract_start: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_end">Fim do Contrato</Label>
            <Input
              id="contract_end"
              type="date"
              value={playerForm.contract_end || ""}
              onChange={(e) => setPlayerForm(prev => ({ ...prev, contract_end: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlayer} disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar Jogador"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlayerDialog;