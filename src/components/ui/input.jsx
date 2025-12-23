"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const inputRef = React.useRef(null)

  const handleMouseMove = (e) => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-[2px] rounded-lg opacity-0 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(260px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(248, 113, 113, 0.75), transparent 60%)`
            : 'transparent',
          opacity: isHovered ? 1 : 0,
          filter: 'blur(10px)',
        }}
        transition={{ duration: 0.2 }}
      />
      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        type={type}
        data-slot="input"
        className={cn(
          "relative z-10 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-10 w-full min-w-0 rounded-md border bg-neutral-100 dark:bg-neutral-900 px-3 py-1 text-base shadow-sm transition-[color,box-shadow,background-color,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    </div>
  )
})

Input.displayName = "Input"

export { Input }
export default Input
