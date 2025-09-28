import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Plus, Copy, Trash2, Clock, CircleCheck as CheckCircle, Building, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { AppClubMembership } from "@/types/app";
import { ClubDepartment, PermissionLevel, Constants } from "@/integrations/supabase/types";
import { getDepartmentLabel, getPermissionLabel } from "@/lib/userUtils";

interface ClubInvite extends AppClubMembership {
  // Removido 'clubs' property aqui, pois não é relevante para convites não atribuídos
  // e pode causar problemas com a consulta select quando club_id é nulo.
  // A base AppClubMembership já estende Tables<'club_members'> que tem club_id.
}

const ClubInviteManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [expiresInDays, setExpiresInDays] = useState("7"); // Default 7 days
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null); // Estado para exibir o código gerado temporariamente

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('status', 'pending')
        .is('user_id', null)
        .eq('department', ClubDepartment.Management)
        .eq('permission_level', PermissionLevel.Admin)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching invites:', error);
        toast({ title: "Erro", description: "Não foi possível carregar os convites.", variant: "destructive" });
      } else {
        setInvites(data || []);
      }
    } catch (error) {
      console.error('Unexpected error in fetchInvites:', error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um erro inesperado ao buscar convites.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Certifique-se de estar logado.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const newInviteCode = uuidv4();
      const expiresAt = addDays(new Date(), parseInt(expiresInDays)).toISOString();

      const { error } = await supabase
        .from('club_members')
        .insert([{
          club_id: null,
          user_id: null,
          department: ClubDepartment.Management,
          permission_level: PermissionLevel.Admin,
          status: 'pending',
          invite_code: newInviteCode,
          invited_by: user.id,
          expires_at: expiresAt,
          used: false,
        }]);

      if (error) throw error;

      toast({ title: "Convite Gerado!", description: "Um novo link de convite para registro de clube foi criado.", });
      setGeneratedCode(newInviteCode);
      await fetchInvites();
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
            Gerenciar Convites de Registro de Clube
          </h1>
          <p className="text-muted-foreground">
            Crie e distribua códigos de convite para novos clubes se registrarem na plataforma.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Gerar Novo Convite de Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input value={getDepartmentLabel(ClubDepartment.Management)} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissionLevel">Nível de Permissão</Label>
              <Input value={getPermissionLabel(PermissionLevel.Admin)} disabled />
            </div>
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

          <Button onClick={generateInviteLink} disabled={isGenerating} className="w-full bg-red-500 hover:bg-red-600">
            {isGenerating ? "Gerando..." : "Gerar Convite de Registro"}
          </Button>
        </CardContent>
      </Card>

      {generatedCode && ( // Exibir o código gerado temporariamente
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Convites de Registro Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Nenhum convite de registro ativo encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Convite para Novo Clube</p>
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