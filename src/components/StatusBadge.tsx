import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { useLanguage } from "@/lib/language";
import type { VerificationStatus } from "@/lib/types";

const styles: Record<VerificationStatus, string> = {
  trust: "border-success/40 bg-success/12 text-success",
  fake: "border-destructive/40 bg-destructive/12 text-destructive",
  partial: "border-warning/40 bg-warning/12 text-warning",
};

const icons: Record<VerificationStatus, typeof CheckCircle2> = {
  trust: CheckCircle2,
  fake: XCircle,
  partial: AlertTriangle,
};

export default function StatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useLanguage();
  const Icon = icons[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(status)}
    </span>
  );
}
