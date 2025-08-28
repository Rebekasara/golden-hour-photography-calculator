"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src="/color-experts-logo.png"
                alt="Color Experts"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Magic / Golden Hour Calculator Tool
              </span>
            </div>
          </div>

          {/* Tagline Section */}
          <div className="flex-1 text-center px-4 min-w-0">
            <p className="text-sm md:text-base text-muted-foreground font-medium truncate">
              Pioneers in photo editing & retouching services
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                window.open("https://www.colorexpertsbd.com/", "_blank")
              }}
            >
              Let's go!
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}