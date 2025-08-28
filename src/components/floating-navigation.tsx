"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Camera, Map, Clock, Star, Menu, X, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingNavigationProps {
  onScrollToSection: (sectionId: string) => void
}

export function FloatingNavigation({ onScrollToSection }: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
        setIsOpen(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const navigationItems = [
    { id: "search", label: "Search", icon: MapPin, color: "bg-blue-500 hover:bg-blue-600" },
    { id: "map", label: "Map", icon: Map, color: "bg-green-500 hover:bg-green-600" },
    { id: "calendar", label: "Calendar", icon: Calendar, color: "bg-purple-500 hover:bg-purple-600" },
    { id: "inspiration", label: "Photos", icon: Camera, color: "bg-pink-500 hover:bg-pink-600" },
    { id: "cities", label: "Cities", icon: Star, color: "bg-yellow-500 hover:bg-yellow-600" },
    { id: "times", label: "Times", icon: Clock, color: "bg-orange-500 hover:bg-orange-600" },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsOpen(false)
  }

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Main FAB */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        )}
      >
        {/* Navigation Items */}
        <div
          className={cn(
            "flex flex-col-reverse gap-3 mb-3 transition-all duration-300 origin-bottom",
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
          )}
        >
          {navigationItems.map((item, index) => (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-12 h-12 rounded-full shadow-lg text-white border-0 transition-all duration-200",
                item.color,
                "transform hover:scale-110 active:scale-95",
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="sr-only">{item.label}</span>
            </Button>
          ))}

          {/* Scroll to Top */}
          <Button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700 text-white border-0 transition-all duration-200 transform hover:scale-110 active:scale-95"
            style={{
              transitionDelay: isOpen ? `${navigationItems.length * 50}ms` : "0ms",
            }}
          >
            <ChevronUp className="w-5 h-5" />
            <span className="sr-only">Scroll to top</span>
          </Button>
        </div>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-all duration-300",
            isOpen && "rotate-45",
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Labels for desktop */}
      <div
        className={cn(
          "fixed bottom-[4.5rem] right-20 z-40 hidden md:flex flex-col-reverse gap-3 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        {navigationItems.map((item, index) => (
          <div
            key={`label-${item.id}`}
            className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            {item.label}
          </div>
        ))}
        <div
          className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap"
          style={{
            transitionDelay: isOpen ? `${navigationItems.length * 50}ms` : "0ms",
          }}
        >
          Top
        </div>
      </div>
    </>
  )
}