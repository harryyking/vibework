import React from 'react';
import { TextProps } from 'react-native';
import { cn } from '@/lib/utils';
import { Text, type TextVariantProps } from './text'; // Import your shadcn-like Text and its variant props

// Extend props for full compatibility (RN TextProps + Text variants)
interface CustomTextProps extends TextProps, TextVariantProps {
  children: React.ReactNode;
  asChild?: boolean;
  // Add any other custom props if needed
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  className,
  variant = 'default',
  asChild = false,
  ...props
}) => {
  return (
    <Text
      className={cn('font-Figtree', className)} // Applies custom font via Tailwind class; merges with passed className
      variant={variant} // Pass through for shadcn variants (e.g., h1, p)
      asChild={asChild}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;