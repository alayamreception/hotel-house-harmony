
import { useState } from 'react';
import React from 'react';

export function useTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState<React.ReactNode>(null);
  
  const showTooltip = (x: number, y: number, tooltipContent: React.ReactNode) => {
    setPosition({ x, y });
    setContent(tooltipContent);
    setIsVisible(true);
  };
  
  const hideTooltip = () => {
    setIsVisible(false);
  };
  
  // Add the missing properties
  const setTooltipContent = (tooltipContent: React.ReactNode) => {
    setContent(tooltipContent);
    setIsVisible(!!tooltipContent);
  };
  
  const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };
  
  return {
    isVisible,
    position,
    content,
    showTooltip,
    hideTooltip,
    setTooltipContent,
    TooltipProvider
  };
}
