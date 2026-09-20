import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Users,
  MoreHorizontal,
  Banknote,
  Gift,
  TrendingUp,
  Briefcase,
  Coins,
  Wallet,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Tag,
  CircleDollarSign,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'Gamepad2':
      return <Gamepad2 size={size} className={className} />;
    case 'HeartPulse':
      return <HeartPulse size={size} className={className} />;
    case 'GraduationCap':
      return <GraduationCap size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'Banknote':
      return <Banknote size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Coins':
      return <Coins size={size} className={className} />;
    case 'Wallet':
      return <Wallet size={size} className={className} />;
    case 'CreditCard':
      return <CreditCard size={size} className={className} />;
    case 'Smartphone':
      return <Smartphone size={size} className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} className={className} />;
    case 'CircleDollarSign':
      return <CircleDollarSign size={size} className={className} />;
    case 'MoreHorizontal':
    default:
      return <Tag size={size} className={className} />;
  }
};
