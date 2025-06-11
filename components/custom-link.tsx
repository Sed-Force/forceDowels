"use client"

import type React from "react"

import { forwardRef } from "react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

interface CustomLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  activeClassName?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, children, className = "", activeClassName = "", onClick, ...props }, ref) => {
    const pathname = usePathname()
    const isActive = pathname === href

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Dispatch a custom event that our loader can listen for
      const event = new CustomEvent("navigationStart", {
        detail: { href },
      })
      window.dispatchEvent(event)

      // Call the original onClick if provided
      if (onClick) {
        onClick(e)
      }
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={`${className} ${isActive ? activeClassName : ""}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    )
  },
)

CustomLink.displayName = "CustomLink"

export { CustomLink }
