// Simple motion wrapper for basic animations without framer-motion dependency
"use client";

import { ReactNode, HTMLAttributes, CSSProperties } from "react";

interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  layoutId?: string;
}

interface MotionButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  layoutId?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const motion = {
  div: ({
    children,
    className,
    style,
    onClick,
    initial,
    animate,
    whileHover,
    whileTap,
    transition,
    variants,
    ...props
  }: MotionProps) => {
    let computedStyle: CSSProperties = { ...style };

    if (transition?.duration) {
      computedStyle.transitionDuration = `${transition.duration}s`;
    }

    // Simple variants support - just ignore them for now
    if (variants) {
      // For simplicity, we'll just apply basic animations
      computedStyle.opacity = 1;
    }

    if (animate) {
      if (animate.rotateY !== undefined) {
        computedStyle.transform = `rotateY(${animate.rotateY})`;
      }
      if (animate.scale !== undefined) {
        computedStyle.transform = `${computedStyle.transform || ""} scale(${
          animate.scale
        })`;
      }
      if (animate.opacity !== undefined) {
        computedStyle.opacity = animate.opacity;
      }
      if (animate.y !== undefined) {
        computedStyle.transform = `${
          computedStyle.transform || ""
        } translateY(${animate.y}px)`;
      }
    }

    const hoverClass = whileHover ? "hover:scale-105 hover:shadow-lg" : "";
    const tapClass = whileTap ? "active:scale-95" : "";

    return (
      <div
        className={`transition-all duration-300 ease-in-out ${
          className || ""
        } ${hoverClass} ${tapClass}`}
        style={{
          ...computedStyle,
          transformStyle: "preserve-3d",
          // backfaceVisibility: "hidden", // Removed as per the patch request
        }}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  },

  section: ({
    children,
    className,
    style,
    variants,
    ...props
  }: MotionProps) => (
    <section
      className={`transition-all duration-300 ease-in-out ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </section>
  ),

  button: ({
    children,
    className,
    style,
    whileHover,
    whileTap,
    onClick,
    disabled,
    ...props
  }: MotionButtonProps) => {
    const hoverClass = whileHover ? "hover:scale-105" : "";
    const tapClass = whileTap ? "active:scale-95" : "";

    return (
      <button
        className={`transition-all duration-200 ease-in-out ${
          className || ""
        } ${hoverClass} ${tapClass}`}
        style={style}
        onClick={onClick}
        disabled={disabled}
        {...(props as any)}
      >
        {children}
      </button>
    );
  },

  h1: ({
    children,
    className,
    style,
    initial,
    animate,
    transition,
    ...props
  }: MotionProps) => (
    <h1
      className={`transition-all duration-300 ease-in-out ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </h1>
  ),

  h3: ({
    children,
    className,
    style,
    initial,
    animate,
    transition,
    ...props
  }: MotionProps) => (
    <h3
      className={`transition-all duration-300 ease-in-out ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </h3>
  ),

  p: ({ children, className, style, variants, ...props }: MotionProps) => (
    <p
      className={`transition-all duration-300 ease-in-out ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </p>
  ),
};

export const AnimatePresence = ({
  children,
  mode,
}: {
  children: ReactNode;
  mode?: string;
}) => {
  return <>{children}</>;
};

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
});

export const useMotionValue = (value: any) => ({
  set: () => {},
  get: () => value,
});

export const useTransform = () => ({});
export const useSpring = () => ({});

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
