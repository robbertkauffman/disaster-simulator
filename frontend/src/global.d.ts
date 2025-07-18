/// <reference types="svelte" />

// Global variables
declare const DSIM_APP_HOST: string;
declare const LeaderLine: any;

// Socket.io types
interface Socket {
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data?: any): void;
  io: {
    on(event: string, callback: (error: any) => void): void;
  };
}

// MongoDB Node types
interface MongoNodeData {
  host: string;
  type: 'Primary' | 'Secondary' | 'Unknown';
  region?: string;
  isChangingState: boolean;
  isNewPrimary: boolean;
  connectedToApp?: boolean;
  iconElm?: HTMLElement;
}

// Stats types
interface Stats {
  avg?: number;
  max?: number;
}

// Request types
interface Request {
  ts?: Date;
  operation: string;
  latency: number[];
  success?: boolean;
}

// Event types
interface ClusterEvent {
  date?: Date;
  message: string;
}
