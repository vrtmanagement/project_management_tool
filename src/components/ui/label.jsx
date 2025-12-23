"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none text-neutral-700 dark:text-neutral-300 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
