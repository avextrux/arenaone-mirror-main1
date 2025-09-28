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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Copy, Calendar, Users, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { ClubDepartment, PermissionLevel, Constants, TablesInsert, UserType } from "@/integrations/supabase/types";
import { getDepartmentLabel, getPermissionLabel } from "@/lib/userUtils"; // Importando getPermissionLabel

interface CreateMemberInviteDialogProps {
  clubId: string;
  onInviteCreated: () => void;
}

const CreateMemberInviteDialog = ({ clubId, onInviteCreated }: CreateMemberInviteDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [department, setDepartment] = useState<ClubDepartment>(ClubDepartment.Technical); // Default to Technical
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>(PermissionLevel.Read); // Default to Read
  const [expiresInDays, setExpiresInDays] = useState("7"); // Default 7 days
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    if (!user || !clubId) {
      toast({ title: "Erro", description: "Certifique-se de estar logado e que o clube está selecionado.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(null);
    try {
      const newInviteCode = uuidv4();
      const expiresAt = addDays(new Date(), parseInt(expiresInDays)).toISOString();

      const payload: TablesInsert<'club_members'> = {
        club_id: clubId,
        user_id: null, // Unassigned, to be claimed by a user
        department: department,
        permission_level: permissionLevel,
        status: 'pending',
        invite_code: newInviteCode,
        invited_by: user.id,
        expires_at: expiresAt,
        used: false,
      };

      const { error } = await supabase
        .from('club_members')
        .insert([payload]);

      if (error) throw error;

      setGeneratedCode(newInviteCode);
      toast({ title: "Convite Gerado!", description: "Um novo código de convite para membro foi criado.", });
      onInviteCreated(); // Notify parent to refresh list of invites
    } catch (error: any) {
      console.error('Error generating member invite:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível gerar o convite de membro.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "O código de convite foi copiado para a área de transferência." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Convidar Novo Membro
          </DialogTitle>
          <DialogDescription>
            Gere um código de convite para um novo membro se juntar ao seu clube.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Select value={department} onValueChange={(value) => setDepartment(value as ClubDepartment)} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.club_department.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {getDepartmentLabel(dept as ClubDepartment)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permissionLevel">Nível de Permissão</Label>
            <Select value={permissionLevel} onValueChange={(value) => setPermissionLevel(value as PermissionLevel)} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.permission_level.map((level) => (
                  <SelectItem key={level} value={level}>
                    {getPermissionLabel(level as PermissionLevel)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresInDays">Expira em (dias)</Label>
            <Input
              id="expiresInDays"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              min="1"
              disabled={isGenerating}
            />
          </div>

          <Button onClick={handleGenerateInvite} disabled={isGenerating} className="w-full">
            {isGenerating ? "Gerando..." : "Gerar Código de Convite"}
          </Button>

          {generatedCode && (
            <div className="space-y-2 mt-4 p-4 border rounded-md bg-muted">
              <Label>Código de Convite Gerado</Label>
              <div className="flex items-center gap-2">
                <Input type="text" value={generatedCode} readOnly className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedCode)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                Compartilhe este código com o novo membro.
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expira em: {format(addDays(new Date(), parseInt(expiresInDays)), 'dd/MM/yyyy')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberInviteDialog;