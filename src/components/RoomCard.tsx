
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Room } from '@/types';
import { format } from 'date-fns';

interface RoomCardProps {
  room: Room;
  onStatusChange: (roomId: string, status: Room['status']) => void;
  onAssign: (roomId: string) => void;
  className?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onStatusChange,
  onAssign,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Room {room.roomNumber}</CardTitle>
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
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onAssign(room.id)}
          disabled={room.status === 'clean'}
        >
          Assign
        </Button>
        <div className="flex-1 flex gap-1">
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
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
