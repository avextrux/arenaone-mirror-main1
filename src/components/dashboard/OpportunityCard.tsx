import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye, DollarSign, Globe, Calendar, MapPin } from "lucide-react";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils"; // Importando as funções de utilitário
import { AppOpportunity } from "@/types/app"; // Importar AppOpportunity

interface OpportunityCardProps {
  opportunity: AppOpportunity; // Usar AppOpportunity
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={opportunity.profiles.avatar_url || undefined} />
              <AvatarFallback>
                {opportunity.profiles.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{opportunity.profiles.full_name}</h4>
              <Badge className={`text-xs ${getUserTypeColor(opportunity.profiles.user_type)}`}>
                {getUserTypeLabel(opportunity.profiles.user_type)}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {opportunity.opportunity_type}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {opportunity.description}
        </p>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          {opportunity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </div>
          )}
          {opportunity.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {opportunity.salary_range}
            </div>
          )}
          {opportunity.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Deadline: {formatDate(opportunity.deadline)}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversar
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;