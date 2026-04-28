import { useState, type FormEvent } from 'react';
import { CalendarCheck, CheckCircle2, Clock, Mail, Send } from 'lucide-react';

/**
 * Drei-stufiger Buchungs-Flow:
 *
 *   1. REQUEST   — Gast sendet eine Datumsanfrage (Formular)
 *   2. PENDING   — System bestätigt den Eingang als "Anfrage", Eigentümer prüft
 *   3. CONFIRMED — finale Bestätigung (z. B. nach E-Mail-Link der Bestätigung)
 *
 * Das Frontend simuliert Schritt 2/3. In Produktion:
 *   - Step 1 postet an ein Backend (z. B. Formspree, Resend, eigener Endpoint)
 *   - Step 2 ist der Zustand nach erfolgreicher Übermittlung
 *   - Step 3 wird durch den Bestätigungs-Link aus der E-Mail des Eigentümers
 *     ausgelöst (URL-Parameter `?booking=confirmed`)
 */

type Step = 'request' | 'pending' | 'confirmed';

interface BookingPayload {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
}

const initialPayload: BookingPayload = {
  name: '',
  email: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  message: '',
};

export function BookingFlow() {
  const [step, setStep] = useState<Step>(() => {
    if (typeof window === 'undefined') return 'request';
    const params = new URLSearchParams(window.location.search);
    return params.get('booking') === 'confirmed' ? 'confirmed' : 'request';
  });
  const [payload, setPayload] = useState<BookingPayload>(initialPayload);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);



  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // minimale Validierung – bei echter Anbindung durch Zod/API-Schema ersetzen
    if (!payload.name.trim() || !payload.email.trim() || !payload.checkIn) {
      setErrorMsg('Bitte Name, E-Mail und Anreisedatum angeben.');
      return;
    }
    if (payload.checkOut && payload.checkOut < payload.checkIn) {
      setErrorMsg('Das Abreisedatum muss nach dem Anreisedatum liegen.');
      return;
    }

    setSubmitting(true);

    try {
      // Hier würde der echte API-Call hin:
      //   await fetch('/api/booking-requests', { method: 'POST', body: JSON.stringify(payload) });
      // Für das Demo-Frontend nur eine kurze Verzögerung.
      await new Promise((r) => setTimeout(r, 700));
      setStep('pending');
    } catch {
      setErrorMsg('Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setPayload(initialPayload);
    setStep('request');
  };

  return (
    <section aria-label="Aufenthalt anfragen" className="w-full max-w-[520px]">
      <StepIndicator step={step} />

      {step === 'request' && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Header
            eyebrow="Buchung anfragen"
            title="Bereit zur Pause?"
            text="Datum wählen, abschicken – wir bestätigen Ihnen die Verfügbarkeit innerhalb weniger Stunden."
          />

          <div>
            <Label htmlFor="bf-name">Name</Label>
            <Input
              id="bf-name"
              type="text"
              required
              autoComplete="name"
              value={payload.name}
              onChange={(v) => setPayload({ ...payload, name: v })}
              placeholder="Ihr Name"
            />
          </div>

          <div>
            <Label htmlFor="bf-email">E-Mail</Label>
            <Input
              id="bf-email"
              type="email"
              required
              autoComplete="email"
              value={payload.email}
              onChange={(v) => setPayload({ ...payload, email: v })}
              placeholder="ihre@email.de"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bf-checkin">Anreise</Label>
              <Input
                id="bf-checkin"
                type="date"
                required
                value={payload.checkIn}
                onChange={(v) => setPayload({ ...payload, checkIn: v })}
              />
            </div>
            <div>
              <Label htmlFor="bf-checkout">Abreise</Label>
              <Input
                id="bf-checkout"
                type="date"
                value={payload.checkOut}
                onChange={(v) => setPayload({ ...payload, checkOut: v })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bf-guests">Personen</Label>
            <select
              id="bf-guests"
              value={payload.guests}
              onChange={(e) => setPayload({ ...payload, guests: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#0B0B0C]/15 rounded-sm text-[#0B0B0C] focus:outline-none focus:border-[#0B0B0C] transition-colors"
            >
              <option value="1">1 Gast</option>
              <option value="2">2 Gäste</option>
              <option value="3">3 Gäste</option>
              <option value="4">4 Gäste</option>
            </select>
          </div>

          <div>
            <Label htmlFor="bf-message">Nachricht (optional)</Label>
            <textarea
              id="bf-message"
              rows={3}
              value={payload.message}
              onChange={(e) => setPayload({ ...payload, message: e.target.value })}
              placeholder="Wünsche, Fragen, besondere Anlässe …"
              className="w-full px-4 py-3 bg-white border border-[#0B0B0C]/15 rounded-sm text-[#0B0B0C] placeholder:text-[#3F3F3F]/50 focus:outline-none focus:border-[#0B0B0C] transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <p role="alert" className="text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-8 py-4 bg-[#0B0B0C] text-white font-stencil text-sm uppercase tracking-[0.22em] rounded-sm hover:bg-[#1a1a1a] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? 'Wird gesendet …' : 'Anfrage senden'}
            <Send className="w-4 h-4" aria-hidden />
          </button>

          <p className="text-xs text-[#3F3F3F]/80">
            Keine Buchung, keine Kartendaten – zuerst bestätigen wir die Verfügbarkeit.
          </p>
        </form>
      )}

      {step === 'pending' && (
        <div className="space-y-6">
          <Header
            eyebrow="Anfrage eingegangen"
            title="Wir prüfen Ihre Daten."
            text="Ihre Anfrage liegt beim Eigentümer zur Bestätigung. Sie erhalten innerhalb weniger Stunden eine E-Mail mit dem Ergebnis."
          />

          <StatusCard
            icon={<Clock className="w-5 h-5" aria-hidden />}
            title="Status: Anfrage – wartet auf Bestätigung"
            body={
              <>
                Anreise: <strong>{formatDate(payload.checkIn)}</strong>
                {payload.checkOut && (
                  <>
                    {' · '}Abreise: <strong>{formatDate(payload.checkOut)}</strong>
                  </>
                )}
                <br />
                {payload.guests} {Number(payload.guests) === 1 ? 'Gast' : 'Gäste'}
              </>
            }
          />

          <StatusCard
            icon={<Mail className="w-5 h-5" aria-hidden />}
            title="Nächster Schritt"
            body={
              <>
                Wir senden die Bestätigung an <strong>{payload.email}</strong>. Mit dem
                Link in der E-Mail schließen Sie die Buchung ab.
              </>
            }
          />

          <button
            type="button"
            onClick={resetFlow}
            className="text-xs font-stencil uppercase tracking-[0.22em] text-[#3F3F3F] underline underline-offset-4 hover:text-[#0B0B0C]"
          >
            Neue Anfrage stellen
          </button>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="space-y-6">
          <Header
            eyebrow="Bestätigt"
            title="Ihre Buchung steht."
            text="Willkommen bei This Is Not A Hotel™. Die Details finden Sie auch in der Bestätigungs-E-Mail."
          />

          <StatusCard
            icon={<CheckCircle2 className="w-5 h-5" aria-hidden />}
            title="Status: Bestätigt"
            body={
              <>
                Wir freuen uns auf Ihren Aufenthalt. Einen Tag vor Anreise erhalten Sie
                die Check-in-Details per E-Mail.
              </>
            }
          />

          <button
            type="button"
            onClick={resetFlow}
            className="text-xs font-stencil uppercase tracking-[0.22em] text-[#3F3F3F] underline underline-offset-4 hover:text-[#0B0B0C]"
          >
            Weitere Anfrage stellen
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Kleine, lokale UI-Bausteine ---------- */

function Header({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#3F3F3F]">
        {eyebrow}
      </span>
      {/* Brand-Schrift Allerta Stencil (Brand Guideline 2026-04-27).
          Tracking auf 0.06em — Stencil-Glyphen brauchen positiven
          Letter-Spacing damit die Cuts klar lesbar bleiben. uppercase
          weil Stencil ausschließlich für Großbuchstaben gezeichnet
          ist. */}
      <h2 className="font-stencil uppercase text-[clamp(32px,4.5vw,56px)] text-[#0B0B0C] leading-[1.0] tracking-[0.06em] mt-3">
        {title}
      </h2>
      <p className="text-[#3F3F3F] text-base mt-3 max-w-[400px]">{text}</p>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#3F3F3F] mb-2"
    >
      {children}
    </label>
  );
}

function Input(props: {
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <input
      id={props.id}
      type={props.type}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      required={props.required}
      autoComplete={props.autoComplete}
      className="w-full px-4 py-3 bg-white border border-[#0B0B0C]/15 rounded-sm text-[#0B0B0C] placeholder:text-[#3F3F3F]/50 focus:outline-none focus:border-[#0B0B0C] transition-colors"
    />
  );
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-white border border-[#0B0B0C]/10 rounded-sm p-4">
      <span className="mt-0.5 text-[#0B0B0C]">{icon}</span>
      <div>
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#3F3F3F] mb-1">
          {title}
        </span>
        <span className="text-sm text-[#0B0B0C] leading-relaxed">{body}</span>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['request', 'pending', 'confirmed'];
  const currentIdx = order.indexOf(step);
  const labels: Record<Step, string> = {
    request: 'Anfrage',
    pending: 'Prüfung',
    confirmed: 'Bestätigt',
  };

  return (
    <ol className="flex items-center gap-3 mb-8" aria-label="Buchungsschritte">
      {order.map((s, i) => {
        const reached = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <li key={s} className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full border text-[11px] font-stencil ${
                reached
                  ? 'bg-[#0B0B0C] text-white border-[#0B0B0C]'
                  : 'bg-transparent text-[#3F3F3F] border-[#0B0B0C]/20'
              }`}
              aria-current={current ? 'step' : undefined}
            >
              {s === 'confirmed' && reached ? (
                <CheckCircle2 className="w-4 h-4" aria-hidden />
              ) : s === 'pending' && reached ? (
                <Clock className="w-4 h-4" aria-hidden />
              ) : s === 'request' && reached ? (
                <CalendarCheck className="w-4 h-4" aria-hidden />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`font-stencil text-[11px] uppercase tracking-[0.22em] ${
                reached ? 'text-[#0B0B0C]' : 'text-[#3F3F3F]'
              }`}
            >
              {labels[s]}
            </span>
            {i < order.length - 1 && <span className="w-6 h-px bg-[#0B0B0C]/15" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
