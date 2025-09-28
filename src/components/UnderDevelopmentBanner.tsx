import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface UnderDevelopmentBannerProps {
  featureName: string;
}

const UnderDevelopmentBanner = ({ featureName }: UnderDevelopmentBannerProps) => {
  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
      <CardContent className="p-4 flex items-center gap-3">
        <Construction className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <p className="text-sm font-medium">
          <span className="font-bold">{featureName}</span> está em desenvolvimento e estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  );
};

export default UnderDevelopmentBanner;