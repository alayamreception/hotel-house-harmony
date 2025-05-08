
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { toast } from 'sonner';

interface PwaInstallPromptProps {
  onClose: () => void;
}

export function PwaInstallPrompt({ onClose }: PwaInstallPromptProps) {
  const { isInstallable, promptToInstall } = usePwaInstall();
  
  const handleInstall = async () => {
    try {
      const installed = await promptToInstall();
      if (installed) {
        toast.success('App installed successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install the app');
    }
  };
  
  if (!isInstallable) {
    return null;
  }
  
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Install HouseHarmony</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Get the full app experience</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          Install HouseHarmony on your device for faster access and offline capabilities.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleInstall} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Install App
        </Button>
      </CardFooter>
    </Card>
  );
}
