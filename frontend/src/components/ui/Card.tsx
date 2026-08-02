import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  hoverEffect?: boolean;
  glass?: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glass = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl border border-border bg-card p-6 text-foreground shadow-apple-sm transition duration-200 ${
        glass ? 'glass' : ''
      } ${hoverEffect ? 'hover:shadow-apple-md hover:border-border/80' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
