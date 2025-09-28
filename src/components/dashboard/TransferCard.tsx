import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import { AppTransfer } from "@/types/app"; // Importar AppTransfer

interface Transfer extends AppTransfer {} // Usar AppTransfer

interface TransferCardProps {
  transfer: Transfer;
}

const formatCurrency = (amount: number | null) => { // Adicionado null check
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const TransferCard = ({ transfer }: TransferCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Jogador ID: {transfer.player_id}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Transferência registrada
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {transfer.fee && (
              <p className="font-semibold text-lg text-primary">
                {formatCurrency(transfer.fee)}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                Registrada
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(transfer.transfer_date)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferCard;