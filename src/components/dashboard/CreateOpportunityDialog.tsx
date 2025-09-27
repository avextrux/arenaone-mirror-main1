import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CreateOpportunityDialogProps {
  onOpportunityCreated: () => void;
}

const CreateOpportunityDialog = ({ onOpportunityCreated }: CreateOpportunityDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    description: "",
    opportunity_type: "",
    location: "",
    salary_range: "",
    deadline: ""
  });

  const handleCreateOpportunity = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityForm,
          poster_id: user.id
        }]);

      if (error) {
        console.error('Error creating opportunity:', error);
        toast({
          title: "Erro ao criar oportunidade",
          description: "Ocorreu um erro ao publicar a oportunidade.",
          variant: "destructive",
        });
        return;
      }

      setOpen(false);
      setOpportunityForm({
        title: "",
        description: "",
        opportunity_type: "",
        location: "",
        salary_range: "",
        deadline: ""
      });
      
      onOpportunityCreated(); // Notify parent component to refresh data
      
      toast({
        title: "Oportunidade criada!",
        description: "Sua oportunidade foi publicada com sucesso.",
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-hover">
          <Globe className="w-4 h-4 mr-2" />
          Publicar Oportunidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Oportunidade</DialogTitle>
          <DialogDescription>
            Publique uma oportunidade para conectar talentos e organizações
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Meio-campo para clube europeu"
                value={opportunityForm.title}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunity_type">Tipo</Label>
              <Select value={opportunityForm.opportunity_type} onValueChange={(value) => setOpportunityForm(prev => ({ ...prev, opportunity_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="loan">Empréstimo</SelectItem>
                  <SelectItem value="trial">Teste/Peneira</SelectItem>
                  <SelectItem value="staff">Vaga Técnica</SelectItem>
                  <SelectItem value="partnership">Parceria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes da oportunidade..."
              value={opportunityForm.description}
              onChange={(e) => setOpportunityForm(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex: Madrid, Espanha"
                value={opportunityForm.location}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_range">Faixa Salarial</Label>
              <Input
                id="salary_range"
                placeholder="Ex: €50k - €100k"
                value={opportunityForm.salary_range}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, salary_range: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={opportunityForm.deadline}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOpportunity} disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Oportunidade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityDialog;