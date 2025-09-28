import { Card, CardContent } from "@/components/ui/card";
import { Shield, Construction } from "lucide-react";

const SiteModeration = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Moderação do Site</h3>
          <p className="text-muted-foreground mb-4">
            Esta seção permitirá gerenciar usuários, posts e outros conteúdos da plataforma.
          </p>
          <Construction className="w-12 h-12 text-muted-foreground mx-auto mt-6" />
          <p className="text-sm text-muted-foreground mt-2">
            Funcionalidade em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteModeration;