
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, LogOut, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Room } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RoomCardProps {
  room: Room;
  onStatusChange: (roomId: string, status: Room['status']) => void;
  onEarlyCheckout: (roomId: string) => void;
  onExtendStay: (roomId: string) => void;
  className?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onStatusChange,
  onEarlyCheckout,
  onExtendStay,
  className
}) => {
  const handleEarlyCheckout = () => {
    onEarlyCheckout(room.id);
    toast.success(`Early checkout set for Room ${room.roomNumber}`);
  };

  const handleExtendStay = () => {
    onExtendStay(room.id);
    toast.success(`Stay extended for Room ${room.roomNumber}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Room {room.roomNumber}</CardTitle>
            {room.today_checkout && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Checkout Today
              </Badge>
            )}
            {room.early_checkout && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Early C/O
              </Badge>
            )}
          </div>
          <StatusBadge status={room.status} />
        </div>
        <p className="text-sm text-muted-foreground">{room.type} Room</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mb-2">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            Last Cleaned: {room.lastCleaned 
              ? format(new Date(room.lastCleaned), 'MMM dd, yyyy') 
              : 'Never'}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            Priority: {Array(room.priority).fill('★').join('')}
          </span>
        </div>
        {room.notes && (
          <p className="text-sm mt-2 italic">{room.notes}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          {room.status !== 'clean' && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => onStatusChange(room.id, 'clean')}
            >
              Mark Clean
            </Button>
          )}
          {room.status !== 'dirty' && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => onStatusChange(room.id, 'dirty')}
            >
              Mark Dirty
            </Button>
          )}
        </div>
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleEarlyCheckout}
          >
            <LogOut className="mr-1 h-3 w-3" />
            Early C/O
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleExtendStay}
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Extend Stay
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
