import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton({ className, type = 'button', ...props }, ref) {
    const classes = ['primary-button', className].filter(Boolean).join(' ')

    return <button ref={ref} type={type} className={classes} data-focus-ring="true" {...props} />
  },
)
