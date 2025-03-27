"use client"

import { motion, Variants } from "motion/react"

function LoadingThreeDotsJumping() {
    const dotVariants: Variants = {
        jump: {
            y: -30,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <motion.div
            animate="jump"
            transition={{ staggerChildren: -0.2, staggerDirection: -1, duration: 0.5, ease: "easeInOut" }}
            className="container"
            exit={{ opacity: 0 }}
        >   
            <motion.div variants={dotVariants} className="bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] bg-clip-text text-transparent animate-gradient text-[20px] font-[700]" >Thinking</motion.div>
            <motion.div className="dot bg-[#149AFB]" variants={dotVariants} />
            <motion.div className="dot bg-[#13EF93]" variants={dotVariants} />
            <motion.div className="dot bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] animate-gradient" variants={dotVariants} />
            <StyleSheet />
        </motion.div>
    )
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
    return (
        <style>
            {`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                will-change: transform;
            }
            `}
        </style>
    )
}

export default LoadingThreeDotsJumping
