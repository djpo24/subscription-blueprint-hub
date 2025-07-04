
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-800 active:bg-gray-900 rounded-full shadow-none border-0",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 rounded-full shadow-none border-0",
        outline:
          "border border-gray-300 bg-white text-black hover:bg-gray-50 hover:text-black active:bg-gray-100 rounded-full shadow-none",
        secondary:
          "bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300 rounded-full shadow-none border-0",
        ghost: "text-black hover:bg-gray-100 hover:text-black active:bg-gray-200 rounded-full",
        link: "text-black underline-offset-4 hover:underline hover:text-black",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-full px-4",
        lg: "h-14 rounded-full px-8",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
