import Button from "@/components/ui/Button";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  onClose,
}: Props) {
  return (
    <div
      data-testid="confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded border border-zinc-800 bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 font-mono text-xs tracking-widest text-zinc-600">{title}</p>
        <p className="mb-6 font-mono text-sm text-white">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button variant={confirmVariant} className="flex-1" onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
