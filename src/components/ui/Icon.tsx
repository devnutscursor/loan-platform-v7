'use client';

import React from 'react';
import {
  Home,
  Info,
  Phone,
  Menu,
  X,
  FileText,
  Target,
  TrendingUp,
  Calculator,
  User,
  ArrowRight,
  MessageCircle,
  RefreshCw,
  Facebook,
  Linkedin,
  Instagram,
  Search,
  Star,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Check,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Asterisk,
  Building2,
  ArrowUp,
  Calendar,
  Shield,
  Clock,
  Download,
  Share,
  Play,
  Book,
  Heart,
  Map,
  ExternalLink,
  Monitor,
  DollarSign,
  MessageSquare,
  Filter,
  UserPlus,
  Building,
  LogIn,
  Activity,
  Eye,
  Palette,
  Settings,
  Link,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

// Custom X (formerly Twitter) icon component
const XIcon = ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2, ...props }: any) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill={color}
      />
    </svg>
  );
};

// Centralized icon registry for the entire app
export const icons = {
  // Navigation
  home: Home,
  about: Info,
  contact: Phone,
  menu: Menu,
  close: X,

  // Loan Officer / Product
  apply: FileText,
  custom: Target,
  rates: TrendingUp,
  calculators: Calculator,
  profile: User,

  // Actions
  applyNow: ArrowRight,
  contactOfficer: MessageCircle,
  homePurchase: Home,
  homeRefinance: RefreshCw,

  // Social
  facebook: Facebook,
  twitter: XIcon, // X (formerly Twitter) - using custom X icon
  linkedin: Linkedin,
  instagram: Instagram,

  // Reviews / Misc
  google: Search,
  zillow: Home,
  star: Star,

  // Contact
  phone: Phone,
  email: Mail,
  location: MapPin,

  // UI
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsDown: ChevronsDown,
  chevronsUp: ChevronsUp,
  check: Check,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: X,

  // Status
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,

  // Brand
  asterisk: Asterisk,
  logo: Building2,

  // Additional
  refresh: RefreshCw,
  document: FileText,
  arrowRight: ArrowRight,
  trendingUp: TrendingUp,
  arrowUp: ArrowUp,
  calendar: Calendar,
  shield: Shield,
  clock: Clock,
  target: Target,
  
  // Extended icons
  download: Download,
  share: Share,
  play: Play,
  book: Book,
  heart: Heart,
  map: Map,
  externalLink: ExternalLink,
  monitor: Monitor,
  fileText: FileText,
  mapPin: MapPin,
  calculator: Calculator,
  x: X,
  search: Search,
  mail: Mail,
  
  // New icons for lead details
  user: User,
  dollarSign: DollarSign,
  messageSquare: MessageSquare,
  filter: Filter,
  
  // Activity icons
  userPlus: UserPlus,
  building: Building,
  logIn: LogIn,
  activity: Activity,
  eye: Eye,
  palette: Palette,
  settings: Settings,
  
  // Additional icons
  checkCircle: CheckCircle,
  alertTriangle: AlertTriangle,
  link: Link,
  alertCircle: AlertCircle,
  helpCircle: HelpCircle,
} as const;

interface IconProps {
  name: keyof typeof icons;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ 
  name, 
  size = 24, 
  className = '', 
  color,
  strokeWidth = 2 
}: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${String(name)}" not found in ui/Icon registry`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}

export const IconNames = icons;
