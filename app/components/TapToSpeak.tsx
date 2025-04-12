import React from 'react'
import { motion } from 'motion/react'
import { useChatPalStore } from '@/providers/chatpal-store-provider'

const TapToSpeak: React.FC = () => {
    const {toggleBoolean} = useChatPalStore((state) => state,)
    return (
        <motion.button 
            className="ease-in-out duration-500 hover:cursor-pointer text-[120px] absolute"  
            onClick={() => toggleBoolean("isListening", true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{scale: 1.15}}
            transition={{
                duration: 0.5,
                ease: "easeInOut"
            }}
        >
            <div className="rainbow-container">
                <div className="green"></div>
                <div className="pink"></div>
            </div>
            <motion.div 
                className="relative text-[16px] bottom-[70px] bg-gradient-to-r from-[#149AFB] via-[#13EF93] bg-[length:200%_200%] to-[#149AFB] bg-clip-text text-transparent animate-gradient font-[700]"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 0.3, 0.8],
                    x: [0, 2, -2, 0],
                    y: [0, -2, 2, 0]
                    }}
                    transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                Tap to speak
            </motion.div>
        </motion.button>
    )
}

export default TapToSpeak
