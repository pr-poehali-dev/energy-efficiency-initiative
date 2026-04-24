import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { VentilationSection } from "@/components/sections/ventilation-section"
import { FirefightingSection } from "@/components/sections/firefighting-section"
import { ReferenceSection } from "@/components/sections/reference-section"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"

const SECTION_IDS = ["hero", "about", "ventilation", "firefighting", "reference", "contact"]

export default function Index() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number>()
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    const el = sectionRefs.current[index]
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY + window.innerHeight / 3

        let active = 0
        sectionRefs.current.forEach((el, i) => {
          if (el && el.offsetTop <= scrollY) {
            active = i
          }
        })

        if (active !== currentSection) {
          setCurrentSection(active)
        }

        scrollThrottleRef.current = undefined
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection(0)}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img src="https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/cdb64365-d7bf-41f9-85c0-39b1dd2dc03f.png" alt="СДС" className="h-10 w-10 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-sans text-xl font-semibold tracking-tight text-foreground px-0 my-0 py-0 mx-0">СДС</span>
            <span className="font-sans text-[10px] text-foreground/60 tracking-wide -mt-0.5">Расчёты для шахт и рудников</span>
          </div>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {["Главная", "О нас", "Вентиляция", "Пожаротушение", "Справочник", "Контакты"].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative font-sans text-sm font-medium transition-colors ${
                currentSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        <MagneticButton variant="secondary" onClick={() => scrollToSection(2)}>
          Попробовать
        </MagneticButton>
      </nav>

      <div className={`relative z-10 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        {/* Hero Section */}
        <section
          id="hero"
          ref={(el) => { sectionRefs.current[0] = el }}
          className="flex min-h-screen w-full flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24"
        >
          <div className="max-w-3xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">Инженерное ПО для СДС и ГИО</p>
            </div>
            <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-6xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl">
              <span className="text-balance">
                Расчёты СДС и ГИО
              </span>
            </h1>
            <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">Профессиональный инструмент для Службы депрессионных съемок и группы инженерного обеспечения ФГУП "ВГСЧ"</span>
            </p>
            <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center">
              <MagneticButton
                size="lg"
                variant="primary"
                onClick={() => scrollToSection(2)}
              >
                Попробовать бесплатно
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1)}>
                О нас
              </MagneticButton>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Листайте вниз</p>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <AboutSection scrollToSection={scrollToSection} sectionRef={(el) => { sectionRefs.current[1] = el }} />
        <VentilationSection sectionRef={(el) => { sectionRefs.current[2] = el }} />
        <FirefightingSection sectionRef={(el) => { sectionRefs.current[3] = el }} />
        <ReferenceSection sectionRef={(el) => { sectionRefs.current[4] = el }} />
        <ContactSection sectionRef={(el) => { sectionRefs.current[5] = el }} />
      </div>
      <style>{`section { scroll-margin-top: 80px; }`}</style>
    </main>
  )
}