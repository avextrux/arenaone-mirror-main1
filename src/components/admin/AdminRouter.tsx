import { Routes, Route, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Construction } from "lucide-react";
import ClubInviteManager from "@/components/admin/ClubInviteManager";
import SiteModeration from "@/components/admin/SiteModeration";

const AdminRouter = () => {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="club-invites" element={<ClubInviteManager />} />
      <Route path="moderation" element={<SiteModeration />} />
      <Route path="settings" element={<UnderDevelopment page="Configurações do Admin" />} />
      <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
    </Routes>
  );
};

const AdminHome = () => (
  <div className="max-w-4xl mx-auto">
    <Card>
      <CardContent className="p-12 text-center">
        <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Bem-vindo ao Dashboard de Administração</h3>
        <p className="text-muted-foreground">
          Use a barra lateral para navegar pelas ferramentas de gerenciamento do site.
        </p>
      </CardContent>
    </Card>
  </div>
);

const UnderDevelopment = ({ page }: { page: string }) => (
  <div className="max-w-4xl mx-auto">
    <Card>
      <CardContent className="p-12 text-center">
        <Construction className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{page}</h3>
        <p className="text-muted-foreground">
          Esta funcionalidade está em desenvolvimento e estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default AdminRouter;