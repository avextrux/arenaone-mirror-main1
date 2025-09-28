import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Plus, Copy, Trash2, Clock, CheckCircle, Building, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { AppClubMembership } from "@/types/app";
import { ClubDepartment, PermissionLevel, Constants } from "@/integrations/supabase/types"; // Importar Constants

interface ClubInvite extends AppClubMembership {
  clubs: { name: string } | null;
}

const ClubInviteManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [department, setDepartment] = useState<ClubDepartment>(ClubDepartment.Management); // Usar enum
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>(PermissionLevel.Admin); // Usar enum
  const [expiresInDays, setExpiresInDays] = useState("7"); // Default 7 days
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await fetchClubs();
    await fetchInvites();
    setLoading(false);
  };

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name')
      .order('name');
    if (error) {
      console.error('Error fetching clubs:', error);
      toast({ title: "Erro", description: "Não foi possível carregar a lista de clubes.", variant: "destructive" });
    } else {
      setClubs(data || []);
    }
  };

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from('club_members')
      .select(`
        *,
        clubs (name)
      `)
      .eq('status', 'pending')
      .is('user_id', null) // Only unassigned invites
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching invites:', error);
      toast({ title: "Erro", description: "Não foi possível carregar os convites.", variant: "destructive" });
    } else {
      setInvites(data as ClubInvite[] || []);
    }
  };

  const generateInviteLink = async () => {
    if (!selectedClubId || !user) {
      toast({ title: "Erro", description: "Selecione um clube e certifique-se de estar logado.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const newInviteCode = uuidv4();
      const expiresAt = addDays(new Date(), parseInt(expiresInDays)).toISOString();

      const { error } = await supabase
        .from('club_members')
        .insert([{
          club_id: selectedClubId,
          user_id: null, // Unassigned
          department: department,
          permission_level: permissionLevel,
          status: 'pending',
          invite_code: newInviteCode,
          invited_by: user.id,
          expires_at: expiresAt,
          used: false,
        }]);

      if (error) throw error;

      toast({ title: "Convite Gerado!", description: "Um novo link de convite foi criado.", });
      await fetchInvites(); // Refresh the list
    } catch (error: any) {
      console.error('Error generating invite:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível gerar o convite.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "O código de convite foi copiado para a área de transferência." });
  };

  const deleteInvite = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este convite?")) return;

    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Convite Excluído", description: "O convite foi removido com sucesso." });
      await fetchInvites();
    } catch (error: any) {
      console.error('Error deleting invite:', error);
      toast({ title: "Erro", description: error.message || "Não foi possível excluir o convite.", variant: "destructive" });
    }
  };

  const getDepartmentLabel = (dept: ClubDepartment) => {
    const labels: Record<ClubDepartment, string> = {
      [ClubDepartment.Medical]: "Médico",
      [ClubDepartment.Financial]: "Financeiro",
      [ClubDepartment.Technical]: "Técnico",
      [ClubDepartment.Scouting]: "Scouting",
      [ClubDepartment.Management]: "Diretoria",
      [ClubDepartment.Admin]: "Admin"
    };
    return labels[dept] || dept;
  };

  const getPermissionLabel = (level: PermissionLevel) => {
    const labels: Record<PermissionLevel, string> = {
      [PermissionLevel.Read]: "Leitura",
      [PermissionLevel.Write]: "Escrita",
      [PermissionLevel.Admin]: "Administrador"
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando gerenciador de convites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-red-500" />
            Gerenciar Convites de Clube
          </h1>
          <p className="text-muted-foreground">
            Crie e distribua códigos de convite para novos clubes e membros da equipe.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Gerar Novo Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="club">Clube</Label>
              <Select value={selectedClubId} onValueChange={setSelectedClubId} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um clube" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select value={department} onValueChange={(value) => setDepartment(value as ClubDepartment)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.club_department.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {getDepartmentLabel(dept)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="permissionLevel">Nível de Permissão</Label>
              <Select value={permissionLevel} onValueChange={(value) => setPermissionLevel(value as PermissionLevel)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.permission_level.map((level) => (
                    <SelectItem key={level} value={level}>
                      {getPermissionLabel(level)}
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
          </div>

          <Button onClick={generateInviteLink} disabled={!selectedClubId || isGenerating} className="w-full bg-red-500 hover:bg-red-600">
            {isGenerating ? "Gerando..." : "Gerar Convite"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Convites Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Nenhum convite ativo encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{invite.clubs?.name || 'Clube Desconhecido'}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDepartmentLabel(invite.department)} ({getPermissionLabel(invite.permission_level)})
                      </p>
                      {invite.expires_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Expira em: {format(new Date(invite.expires_at), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={invite.invite_code || ''}
                      readOnly
                      className="w-40 text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(invite.invite_code || '')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteInvite(invite.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubInviteManager;