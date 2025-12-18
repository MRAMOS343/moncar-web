import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types';
import { 
  Bug, 
  HelpCircle, 
  Lightbulb, 
  LifeBuoy, 
  FileText,
  Clock,
  User
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const categoriaIcons: Record<TicketCategory, typeof Bug> = {
  bug: Bug,
  consulta: HelpCircle,
  sugerencia: Lightbulb,
  soporte: LifeBuoy,
  reporte: FileText,
};

const estadoVariants: Record<TicketStatus, "info" | "warning" | "success" | "outline"> = {
  abierto: 'info',
  en_progreso: 'warning',
  resuelto: 'success',
  cerrado: 'outline',
};

const estadoLabels: Record<TicketStatus, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

const prioridadVariants: Record<TicketPriority, "outline" | "info" | "warning" | "destructive"> = {
  baja: 'outline',
  media: 'info',
  alta: 'warning',
  urgente: 'destructive',
};

const prioridadLabels: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const CategoriaIcon = categoriaIcons[ticket.categoria];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1">
              <CategoriaIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {ticket.titulo}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {ticket.descripcion}
              </p>
            </div>
          </div>
          <Badge variant={prioridadVariants[ticket.prioridad]}>
            {prioridadLabels[ticket.prioridad]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={estadoVariants[ticket.estado]}>
            {estadoLabels[ticket.estado]}
          </Badge>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{ticket.usuarioNombre}</span>
          </div>

          {ticket.asignadoA && (
            <Badge variant="secondary" className="text-xs">
              Asignado: {ticket.asignadoA}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
