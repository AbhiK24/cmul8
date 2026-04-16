"use client"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 20, height: 12 },
    md: { width: 28, height: 16 },
    lg: { width: 36, height: 20 },
  }

  const { width, height } = sizes[size]

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 28 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M7 8c0-2.5 2-4.5 4.5-4.5S16 5.5 16 8s-2 4.5-4.5 4.5S7 10.5 7 8z" />
      <path d="M12 8c0-2.5 2-4.5 4.5-4.5S21 5.5 21 8s-2 4.5-4.5 4.5S12 10.5 12 8z" />
      <line x1="1" y1="8" x2="27" y2="8" strokeWidth="1" strokeDasharray="2 2" />
      <polygon points="25,6 27,8 25,10" fill="currentColor" stroke="none" />
    </svg>
  )
}
