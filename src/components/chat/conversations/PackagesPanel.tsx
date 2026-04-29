import { useQuery } from "@tanstack/react-query";
import { Package, Phone, Mail, MapPin, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ConversationCustomer } from "./types";

interface PackagesPanelProps {
  customer: ConversationCustomer | null;
  phoneNumber: string;
  onClose?: () => void;
  /**
   * "side"  → renderiza como columna lateral fija (desktop)
   * "sheet" → renderiza como contenido de Sheet (mobile/tablet)
   */
  variant?: "side" | "sheet";
}

interface CustomerPackage {
  id: string;
  tracking_number: string;
  status: string;
  origin: string;
  destination: string;
  description: string | null;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  recibido:    { label: "Recibido",    cls: "bg-blue-100 text-blue-700" },
  bodega:      { label: "En bodega",   cls: "bg-indigo-100 text-indigo-700" },
  procesado:   { label: "Procesado",   cls: "bg-purple-100 text-purple-700" },
  despachado:  { label: "Despachado",  cls: "bg-violet-100 text-violet-700" },
  transito:    { label: "En tránsito", cls: "bg-amber-100 text-amber-700" },
  en_destino:  { label: "En destino",  cls: "bg-orange-100 text-orange-700" },
  delivered:   { label: "Entregado",   cls: "bg-emerald-100 text-emerald-700" },
  pending:     { label: "Pendiente",   cls: "bg-slate-100 text-slate-600" },
};

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount == null || amount === 0) return "—";
  const cur = (currency ?? "COP").toUpperCase();
  if (cur === "COP") return `$${Math.round(amount).toLocaleString("es-CO")}`;
  return `${cur} ${amount.toLocaleString("es-CO", { maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function PackagesPanel({ customer, phoneNumber, onClose, variant = "side" }: PackagesPanelProps) {
  const customerId = customer?.id ?? null;

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["customer-packages", customerId],
    queryFn: async (): Promise<CustomerPackage[]> => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("packages")
        .select("id, tracking_number, status, origin, destination, description, weight, freight, amount_to_collect, currency, created_at")
        .eq("customer_id", customerId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as CustomerPackage[];
    },
    enabled: !!customerId,
  });

  const totals = packages.reduce(
    (acc, pkg) => {
      acc.count++;
      if (pkg.status === "delivered") acc.delivered++;
      const cur = (pkg.currency ?? "COP").toUpperCase();
      const amt = pkg.amount_to_collect ?? 0;
      if (amt > 0) acc.toCollect[cur] = (acc.toCollect[cur] ?? 0) + amt;
      return acc;
    },
    { count: 0, delivered: 0, toCollect: {} as Record<string, number> },
  );

  const containerCls = variant === "side"
    ? "hidden lg:flex flex-col w-80 shrink-0 border-l border-border bg-card overflow-y-auto"
    : "flex flex-col h-full bg-card overflow-y-auto";

  return (
    <div className={containerCls}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
        <h3 className="text-sm font-semibold text-foreground">Información del cliente</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:bg-muted"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Customer card */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          {customer?.profile_image_url ? (
            <img src={customer.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-muted-foreground">
              {(customer?.name ?? phoneNumber).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-foreground truncate">
              {customer?.name ?? "Cliente no registrado"}
            </div>
            {!customer && (
              <div className="text-[10px] text-amber-600 mt-0.5">⚠ Número no registrado</div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">+{phoneNumber}</span>
          </div>
          {customer?.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {customer && (
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{totals.count}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{totals.delivered}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Entregadas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{totals.count - totals.delivered}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">En curso</div>
          </div>
        </div>
      )}

      {/* Amounts to collect by currency */}
      {Object.keys(totals.toCollect).length > 0 && (
        <div className="p-4 border-b border-border">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Por cobrar
          </div>
          <div className="space-y-1">
            {Object.entries(totals.toCollect).map(([cur, amt]) => (
              <div key={cur} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{cur}</span>
                <span className="font-semibold text-foreground">{fmtMoney(amt, cur)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages list */}
      <div className="flex-1">
        <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide sticky top-0 bg-card">
          Encomiendas {packages.length > 0 && `(${packages.length})`}
        </div>
        {!customer ? (
          <div className="px-4 py-8 text-xs text-muted-foreground text-center">
            Vincula este número a un cliente para ver su historial.
          </div>
        ) : isLoading ? (
          <div className="px-4 py-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="px-4 py-8 text-xs text-muted-foreground text-center">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Sin encomiendas registradas
          </div>
        ) : (
          <div className="px-2 pb-4">
            {packages.map(pkg => {
              const cfg = STATUS_LABELS[pkg.status] ?? { label: pkg.status, cls: "bg-slate-100 text-slate-600" };
              return (
                <div
                  key={pkg.id}
                  className="px-2 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-foreground truncate">
                      {pkg.tracking_number}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    <span className="truncate">{pkg.origin} → {pkg.destination}</span>
                  </div>
                  {pkg.description && (
                    <div className="text-[10px] text-muted-foreground truncate mb-1">{pkg.description}</div>
                  )}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{fmtDate(pkg.created_at)}</span>
                    {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
                      <span className="font-semibold text-foreground">
                        {fmtMoney(pkg.amount_to_collect, pkg.currency)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
