import { useEffect, type CSSProperties } from "react"
import { PartyPopper } from "lucide-react"

export function Celebration({
  word,
  onDone,
}: {
  word: string
  onDone: () => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4500)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="celebration">
      <div aria-hidden="true" className="celebration-confetti">
        {Array.from({ length: 48 }, (_, index) => (
          <i
            key={index}
            style={
              {
                left: `${(index * 37) % 100}%`,
                background: ["#a8d5a4", "#e6b754", "#f3e4cd", "#88b9cf"][
                  index % 4
                ],
                animationDelay: `${(index % 9) * 0.12}s`,
                "--drift": `${((index * 29) % 160) - 80}px`,
                "--spin": `${index % 2 ? 640 : -540}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div role="status" className="celebration-message">
        <PartyPopper aria-hidden="true" className="size-7 shrink-0" />
        <div>
          <p className="text-lg font-semibold">You solved it!</p>
          <p className="text-sm">{word.toUpperCase()} — all five green.</p>
        </div>
      </div>
    </div>
  )
}
