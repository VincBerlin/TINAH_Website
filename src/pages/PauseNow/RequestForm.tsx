import { useState, type FormEvent } from 'react';
import { pauseConfig } from '../../lib/pause-config';

/**
 * Anfrageformular — simpel, E-Mail-basiert, kein Backend.
 *
 * Logik:
 *   1. Wenn `pauseConfig.formEndpoint` gesetzt ist (Formspree o. ä.):
 *      POST als JSON. Formspree akzeptiert JSON, antwortet CORS-freundlich,
 *      schickt E-Mail an die bei Formspree hinterlegte Adresse.
 *   2. Wenn der Endpoint leer ist: Fallback auf `mailto:`. Der User-Mailclient
 *      öffnet sich mit prefilled Subject + Body — simpel, stabil, ohne Drittanbieter.
 *
 * Nach erfolgreichem Absenden wird das Formular komplett ausgeblendet und
 * durch eine ruhige Bestätigungsnachricht ersetzt — wie vom Brand-Team
 * vorgegeben.
 */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  notes: string;
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  checkIn: '',
  checkOut: '',
  notes: '',
};

export function RequestForm() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const submitViaEndpoint = async (endpoint: string): Promise<void> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        check_in: data.checkIn,
        check_out: data.checkOut,
        notes: data.notes,
        _subject: `Neue Anfrage: ${data.name} (${data.checkIn} – ${data.checkOut})`,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
  };

  const submitViaMailto = (): void => {
    const subject = encodeURIComponent(
      `Anfrage von ${data.name}: ${data.checkIn} – ${data.checkOut}`
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name}`,
        `E-Mail: ${data.email}`,
        `Check-in: ${data.checkIn}`,
        `Check-out: ${data.checkOut}`,
        '',
        data.notes ? `Notiz:\n${data.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
    // Öffnet Standard-Mailclient mit vorbefülltem Entwurf.
    window.location.href = `mailto:${pauseConfig.fallbackEmail}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('submitting');
    setErrorMsg('');

    try {
      if (pauseConfig.formEndpoint) {
        await submitViaEndpoint(pauseConfig.formEndpoint);
      } else {
        submitViaMailto();
      }
      setState('success');
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Unbekannter Fehler beim Absenden.'
      );
      setState('error');
    }
  };

  // --------------------------------------------------------------------
  // Erfolgs-UI — ersetzt das Formular komplett.
  // --------------------------------------------------------------------
  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-[#0B0B0C]/15 bg-white/60 backdrop-blur-sm p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0B0B0C]/20"
          >
            {/* Minimalistisches Check-Icon als reiner SVG-Strich — kein
                lucide-Import, damit die Erfolgs-UI auch dann rendert, wenn
                das Icon-Package gerade hakt. */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5 10 17.5 19 7.5" />
            </svg>
          </span>
          <h3 className="font-stencil text-xl md:text-2xl uppercase tracking-[0.14em] text-[#0B0B0C]">
            Anfrage erhalten
          </h3>
        </div>
        <p className="text-[#3F3F3F] text-base md:text-lg leading-relaxed">
          Vielen Dank für deine Anfrage! Wir haben deine Daten erhalten und
          melden uns in Kürze bei dir — meistens innerhalb weniger Stunden,
          manchmal schneller.
        </p>
        <p className="mt-4 text-[#3F3F3F]/80 text-sm">
          Falls du schneller sprechen möchtest, findest du uns daneben auf
          WhatsApp.
        </p>
      </div>
    );
  }

  const isSubmitting = state === 'submitting';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[#0B0B0C]/10 bg-white/50 backdrop-blur-sm p-6 md:p-8"
      aria-label="Unverbindliche Anfrage"
    >
      <div className="mb-6">
        <h3 className="font-stencil text-xl md:text-2xl uppercase tracking-[0.14em] text-[#0B0B0C]">
          Unverbindlich anfragen
        </h3>
        <p className="mt-2 text-sm text-[#3F3F3F]">
          Kein Channel Manager, keine Buchungsmaschine. Deine Daten gehen
          direkt per E-Mail an uns — wir antworten persönlich.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Name"
          id="name"
          type="text"
          autoComplete="name"
          required
          value={data.name}
          onChange={(v) => update('name', v)}
        />
        <Field
          label="E-Mail"
          id="email"
          type="email"
          autoComplete="email"
          required
          value={data.email}
          onChange={(v) => update('email', v)}
        />
        <Field
          label="Check-in"
          id="checkIn"
          type="date"
          required
          value={data.checkIn}
          onChange={(v) => update('checkIn', v)}
        />
        <Field
          label="Check-out"
          id="checkOut"
          type="date"
          required
          value={data.checkOut}
          onChange={(v) => update('checkOut', v)}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="notes"
          className="block text-xs font-stencil uppercase tracking-[0.18em] text-[#3F3F3F] mb-1.5"
        >
          Notiz <span className="opacity-50">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anreise, besondere Wünsche, Fragen …"
          className="w-full rounded-xl border border-[#0B0B0C]/15 bg-white px-4 py-3 text-[15px] text-[#0B0B0C] placeholder:text-[#3F3F3F]/60 focus:border-[#0B0B0C]/60 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>

      {state === 'error' && (
        <p
          role="alert"
          className="mt-4 text-sm text-[#8B1A1A] bg-[#8B1A1A]/10 border border-[#8B1A1A]/20 rounded-lg px-3 py-2"
        >
          Das Absenden hat nicht geklappt. Bitte versuche es noch einmal oder
          schreib uns direkt an {pauseConfig.fallbackEmail}.
          {errorMsg && <span className="block opacity-70 mt-1">({errorMsg})</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          mt-6 w-full sm:w-auto min-h-[48px] px-8 py-3
          rounded-full font-stencil text-sm uppercase tracking-[0.22em]
          border border-[#0B0B0C] text-[#0B0B0C]
          transition-all duration-300
          ${
            isSubmitting
              ? 'opacity-60 cursor-wait'
              : 'hover:bg-[#0B0B0C] hover:text-white'
          }
        `}
      >
        {isSubmitting ? 'Senden …' : 'Anfrage senden'}
      </button>

      <p className="mt-4 text-xs text-[#3F3F3F]/70">
        Wir speichern deine Daten nur, um dir zu antworten. Kein Newsletter,
        keine Weitergabe.
      </p>
    </form>
  );
}

// -----------------------------------------------------------------------
// Wiederverwendbares Feld — mit Label, Focus-Ring, passenden Touch-Targets
// -----------------------------------------------------------------------
interface FieldProps {
  label: string;
  id: string;
  type: 'text' | 'email' | 'date';
  required?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({
  label,
  id,
  type,
  required,
  autoComplete,
  value,
  onChange,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-stencil uppercase tracking-[0.18em] text-[#3F3F3F] mb-1.5"
      >
        {label}
        {required && <span className="text-[#0B0B0C]/60 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full min-h-[44px] rounded-xl border border-[#0B0B0C]/15 bg-white
          px-4 py-2.5 text-[15px] text-[#0B0B0C]
          placeholder:text-[#3F3F3F]/60
          focus:border-[#0B0B0C]/60 focus:outline-none focus:ring-0
          transition-colors
        "
      />
    </div>
  );
}
