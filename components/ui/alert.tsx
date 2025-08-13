import * as React from "react"
import { cn } from "@/lib/utils"

type AlertVariant = "default" | "destructive"

function variantClasses(variant: AlertVariant = "default") {
  if (variant === "destructive") {
    return "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
  }
  return "bg-background text-foreground"
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
      variantClasses(variant),
      className,
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
