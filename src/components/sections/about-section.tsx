import { Mail, MapPin } from "lucide-react"
import { MagneticButton } from "@/components/magnetic-button"
import { useReveal } from "@/hooks/use-reveal"
import { useState, type FormEvent } from "react"

export function AboutSection({ scrollToSection, sectionRef }: { scrollToSection?: (index: number) => void; sectionRef?: (el: HTMLElement | null) => void }) {
  const { ref, isVisible } = useReveal(0.2)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({ name: "", email: "", message: "" })
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  return (
    <section
      ref={(el) => { ref.current = el; sectionRef?.(el) }}
      className="w-full px-4 py-24 md:px-12 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl space-y-24 md:space-y-32">

        {/* — О нас — */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div>
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
              }`}
            >
              <h2 className="mb-3 font-sans text-3xl font-light leading-[1.1] tracking-tight text-foreground md:mb-4 md:text-6xl lg:text-7xl">
                Точный
                <br />
                расчёт
                <br />
                <span className="text-foreground/40">за минуты</span>
              </h2>
            </div>

            <div
              className={`space-y-3 transition-all duration-700 md:space-y-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-lg">СДС — профессиональное приложение для службы депрессионных съемок</p>
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-lg">Современный инструмент с актуальными нормами и мгновенным формированием отчётов.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 md:space-y-12">
            {[
              { value: "2 400+", label: "Проектов", sublabel: "Рассчитано в приложении", direction: "right" },
              { value: "15 мин", label: "Расчёт", sublabel: "Вместо нескольких часов", direction: "left" },
              { value: "100%", label: "Нормы", sublabel: "Актуальные СП и ГОСТ", direction: "right" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex items-baseline gap-4 border-l border-foreground/30 pl-4 transition-all duration-700 md:gap-8 md:pl-8 ${
                  isVisible
                    ? "translate-x-0 opacity-100"
                    : stat.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
                }`}
                style={{
                  transitionDelay: `${300 + i * 150}ms`,
                  marginLeft: i % 2 === 0 ? "0" : "auto",
                  maxWidth: i % 2 === 0 ? "100%" : "85%",
                }}
              >
                <div className="text-3xl font-light text-foreground md:text-6xl lg:text-7xl">{stat.value}</div>
                <div>
                  <div className="font-sans text-base font-light text-foreground md:text-xl">{stat.label}</div>
                  <div className="font-mono text-xs text-foreground/60">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* — Контакты — */}
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:gap-24">
          <div className="flex flex-col justify-center">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <h2 className="mb-2 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">СДС</h2>
              <p className="font-mono text-xs text-foreground/60 md:text-base">Служба Депрессионных Съемок</p>
            </div>

            <div className="space-y-4 md:space-y-8">
              <a
                href="mailto:delo.kpsk@vgsch.mchs.gov.ru"
                className={`group block transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "250ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">Email</span>
                </div>
                <p className="text-base text-foreground transition-colors group-hover:text-foreground/70 md:text-2xl">delo.kpsk@vgsch.mchs.gov.ru</p>
              </a>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">Локация</span>
                </div>
                <p className="text-base text-foreground md:text-2xl">Копейск, Россия</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {[
                { label: "Имя", key: "name", type: "text", placeholder: "Ваше имя", delay: "200ms" },
                { label: "Email", key: "email", type: "email", placeholder: "your@email.com", delay: "350ms" },
              ].map(({ label, key, type, placeholder, delay }) => (
                <div
                  key={key}
                  className={`transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}
                  style={{ transitionDelay: delay }}
                >
                  <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">{label}</label>
                  <input
                    type={type}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    required
                    className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div
                className={`transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}
                style={{ transitionDelay: "500ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">Сообщение</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="Расскажите о вашем объекте или задаче..."
                />
              </div>

              <div
                className={`transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                style={{ transitionDelay: "650ms" }}
              >
                <MagneticButton variant="primary" size="lg" className="w-full disabled:opacity-50">
                  {isSubmitting ? "Отправка..." : "Отправить"}
                </MagneticButton>
                {submitSuccess && (
                  <p className="mt-3 text-center font-mono text-sm text-foreground/80">Сообщение отправлено!</p>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  )
}
