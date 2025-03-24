// Global type definitions for the project
import React from 'react';
import { Theme } from '@mui/material/styles';

// Common interfaces and types
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export type FC<P = {}> = React.FC<P>;

export type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

export type IconProps = {
  color: ButtonColor;
  variant?: 'light' | 'filled';
  size?: number;
  backgroundOpacity?: number;
  hoverEffect?: boolean;
  tooltip?: string;
};

// Add more global types as needed
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module 'antd' {
  export type FormInstance<T> = {
    validateFields: () => Promise<T>;
    getFieldsValue: () => T;
  };
}

declare module 'recharts' {
  export interface TooltipPayload {
    name: string;
    value: number;
    color: string;
  }
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module 'antd';
declare module 'recharts';

declare global {
  interface Window {
    localStorage: Storage;
    matchMedia: (query: string) => MediaQueryList;
    location: Location;
    history: History;
    screen: Screen;
    document: Document;
    navigator: Navigator;
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
    pageXOffset: number;
    pageYOffset: number;
    scrollX: number;
    scrollY: number;
    screenLeft: number;
    screenTop: number;
    screenX: number;
    screenY: number;
    alert: (message?: any) => void;
    confirm: (message?: any) => boolean;
    prompt: (message?: any, defaultText?: string) => string | null;
    open: (url?: string, target?: string, features?: string) => Window | null;
    close: () => void;
    print: () => void;
    focus: () => void;
    blur: () => void;
    getSelection: () => Selection | null;
    getComputedStyle: (elt: Element, pseudoElt?: string | null) => CSSStyleDeclaration;
    moveBy: (x: number, y: number) => void;
    moveTo: (x: number, y: number) => void;
    resizeBy: (x: number, y: number) => void;
    resizeTo: (x: number, y: number) => void;
    scroll: (options: ScrollToOptions) => void;
    scrollBy: (options: ScrollToOptions) => void;
    scrollTo: (options: ScrollToOptions) => void;
    stop: () => void;
  }
  interface MediaQueryList {
    matches: boolean;
    addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => void;
    removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => void;
  }
  interface MediaQueryListEvent {
    media: string;
    matches: boolean;
  }
}

declare const document: Document;

type CSSProperties = React.CSSProperties;

export {};
