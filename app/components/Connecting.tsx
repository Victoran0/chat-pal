"use client"

import { motion } from "motion/react"

const Connecting = () => {

    return (
        <div className="flex items-center justify-center h-screen">
            <motion.div
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <StyleSheet />
        </div>
    )
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
    return (
        <style>
            {`
            .spinner {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                border: 4px solid #149AFB;
                border-top-color: #13EF93;
                will-change: transform;
            }
            `}
        </style>
    )
}

export default Connecting
