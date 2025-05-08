
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BellRing, BellOff } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { isSupported, permission, requestPermission, sendNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handlePermissionRequest = async () => {
    setLoading(true);
    try {
      const granted = await requestPermission();
      
      if (granted) {
        toast.success('Notification permission granted!');
        // Send a test notification
        setTimeout(() => {
          sendNotification('Notifications Enabled', {
            body: 'You will now receive notifications from HouseHarmony.',
            icon: '/icons/icon-192x192.png'
          });
        }, 1000);
      } else {
        toast.error('Notification permission not granted.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('An error occurred while requesting permission.');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = () => {
    sendNotification('Test Notification', {
      body: 'This is a test notification from HouseHarmony.',
      icon: '/icons/icon-192x192.png'
    });
    toast.success('Test notification sent!');
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellOff className="mr-2 h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>Push notifications are not supported in your browser.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellRing className="mr-2 h-5 w-5" /> Notifications
        </CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== 'granted' ? (
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">
              {permission === 'denied' 
                ? 'Notifications are blocked. You need to allow them in your browser settings.' 
                : 'Enable push notifications to receive updates about room status, tasks, and schedule changes.'}
            </p>
            <Button 
              onClick={handlePermissionRequest} 
              disabled={loading || permission === 'denied'} 
              className="mt-2"
            >
              {loading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Task Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications about new tasks.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Room Status Updates</p>
                <p className="text-xs text-muted-foreground">Get notified about room status changes.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Staff Assignments</p>
                <p className="text-xs text-muted-foreground">Receive notifications about new assignments.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Button onClick={testNotification} variant="outline" className="w-full mt-4">
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
