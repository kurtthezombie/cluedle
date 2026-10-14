import { useEffect, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function AppDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.getClientRects().length > 0)
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (
          first &&
          last &&
          ((event.shiftKey && document.activeElement === first) ||
            (!event.shiftKey && document.activeElement === last))
        ) {
          event.preventDefault()
          const nextControl = event.shiftKey ? last : first
          nextControl.focus()
        }
      }}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-border bg-white p-6 text-foreground shadow-xl backdrop:bg-[#172d24]/35"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="dialog-title" className="text-xl font-semibold">
          {title}
        </h2>
        <Button
          variant="ghost"
          className="min-h-11 min-w-11"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X />
        </Button>
      </div>
      {children}
    </dialog>
  )
}
