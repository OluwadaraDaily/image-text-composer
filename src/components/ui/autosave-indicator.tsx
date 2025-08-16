'use client';

import { useAutosave, type AutosaveStatus } from '@/hooks/useAutosave';
import { CheckCircle, AlertCircle, Loader2, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutosaveIndicatorProps {
  className?: string;
}

export function AutosaveIndicator({ className }: AutosaveIndicatorProps) {
  const { status, lastSaveTime } = useAutosave();

  const getStatusConfig = (status: AutosaveStatus) => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          className: 'text-blue-600 animate-spin',
        };
      case 'saved':
        return {
          icon: CheckCircle,
          text: 'Saved',
          className: 'text-green-600',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          className: 'text-red-600',
        };
      default:
        return {
          icon: Cloud,
          text: lastSaveTime ? 'Autosaved' : 'Ready',
          className: 'text-gray-500',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const formatLastSave = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-sm font-medium',
      className
    )}>
      <Icon className={cn('h-4 w-4', config.className)} />
      <span className={config.className}>
        {config.text}
      </span>
      {status === 'idle' && lastSaveTime && (
        <span className="text-xs text-gray-400 ml-1">
          {formatLastSave(lastSaveTime)}
        </span>
      )}
    </div>
  );
}