// components/RippleLoader.tsx
import React from 'react';
import { motion } from 'motion/react';

// Define the props for the component, though none are needed for this basic version
interface RippleLoaderProps {
  className?: string; // Optional className for custom styling
  size?: number; // Optional size for the initial ripple circle
  strokeWidth?: number; // Optional border thickness
  duration?: number; // Optional animation duration
}

const RippleLoader: React.FC<RippleLoaderProps> = ({
    className = '',
    size = 50, // Default size in pixels
    strokeWidth = 2, // Default border width in pixels
    duration = 1.5, // Default animation duration in seconds
    }) => {
    // Animation variants for the ripple effect
    const rippleVariants = {
        initial: {
        scale: 0,
        opacity: 1,
        },
        animate: {
        scale: 4, // How much the ripple expands
        opacity: 0, // Fade out as it expands
        },
    };

    // Animation transition settings
    const rippleTransition = {
        duration: duration, // Control the speed of the ripple
        ease: 'easeInOut', // Type of easing for a smooth effect
        repeat: Infinity, // Make the animation loop forever
        repeatType: 'loop' as const, // Ensure it loops back to the start smoothly
        // repeatDelay: 0.5, // Optional: add a delay between loops
    };

    return (
        <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }} // Set container size based on prop
        >
        {/* The motion div creates the animated ripple */}
        <motion.div
            className="absolute rounded-full"
            style={{
            width: size,
            height: size,
            borderWidth: `${strokeWidth}px`, // Use prop for border width
            borderColor: '#149AFB', // Use prop for color
            borderStyle: 'solid',
            }}
            variants={rippleVariants} // Apply the defined variants
            initial="initial" // Start state
            animate="animate" // End state
            transition={rippleTransition} // Apply the transition settings
        />
        {/* You could optionally add a second, delayed ripple here for a more complex effect */}
        
        <motion.div
            className="absolute rounded-full"
            style={{
            width: size,
            height: size,
            borderWidth: `${strokeWidth}px`,
            borderColor: '#13EF93',
            borderStyle: 'solid',
            }}
            variants={rippleVariants}
            initial="initial"
            animate="animate"
            transition={{ ...rippleTransition, delay: duration / 2 }} // Start second ripple halfway through the first
        />
        
        </div>
    );
};

export default RippleLoader;