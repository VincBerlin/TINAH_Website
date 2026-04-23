import { useState, type FormEvent } from 'react';
import { pauseConfig } from '../../lib/pause-config';
import { WhatsAppQrCard } from './WhatsAppQrCard';

/**
 * Buchungsseite — dunkles Brand-Design, identisch zur Startseite.
 *
 * Layout (Desktop):
 *   ┌─────────────────────────┐  ┌──┐  ┌──────────────┐
 *   │ Anfrageformular         │  │  │  │ QR-Code →    │
 *   │ Name · E-Mail · Datum   │  │OR│  │ WhatsApp     │
 *   │ Preise (USD + LKR)      │  │  │  │ Business     │
 *   └─────────────────────────┘  └──┘  └──────────────┘
 *
 * Auf Mobile stapelt sich das: Form → OR → QR.
 *
 * Hintergrund: gleiche Atmosphäre wie die Home-Sections —
 * dunkel (#0B0B0C) mit einem subtilen Küstenmotiv in niedriger Opacity
 * und einem schweren Vignetten-Gradient, damit Text und Formular
 * sauber lesbar bleiben. Kein ablenkender Vollbild-Header, wie auf der
 * Home-Seite sind Ruhe und Raum das Designprinzip.
 */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  room: string;
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  checkIn: '',
  checkOut: '',
  room: pauseConfig.pricing[0]?.name ?? '',
};

export function PauseNowBooking() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedTier =
    pauseConfig.pricing.find((tier) => tier.name === data.room) ??
    pauseConfig.pricing[0];

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
        room: data.room,
        price_usd: selectedTier?.nightlyUsd,
        price_lkr: selectedTier?.nightlyLkr,
        _subject: `New stay request — ${data.name} (${data.checkIn} → ${data.checkOut})`,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
  };

  const submitViaMailto = (): void => {
    const subject = encodeURIComponent(
      `Stay request — ${data.name}: ${data.checkIn} → ${data.checkOut}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Check-in: ${data.checkIn}`,
        `Check-out: ${data.checkOut}`,
        `Room: ${data.room}`,
        selectedTier
          ? `Rate: USD ${selectedTier.nightlyUsd} / LKR ${selectedTier.nightlyLkr.toLocaleString('en-US')} per night`
          : '',
        '',
        'Sent from thisisnotahotel.com/pause',
      ]
        .filter(Boolean)
        .join('\n'),
    );
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
          : 'Unknown error while sending your request.',
      );
      setState('error');
    }
  };

  const isSubmitting = state === 'submitting';

  return (
    <section
      aria-label="Book your stay"
      className="relative w-full min-h-screen overflow-hidden bg-[#0B0B0C] text-white"
    >
      {/* Atmosphärischer Hintergrund — gleiche Bild-Familie wie die
          Home-Sections, damit der Übergang Home → /pause sich wie eine
          weitere Section anfühlt, nicht wie ein anderer Auftritt.
          Sehr niedrig deckend; der Gradient vorne zieht den Kontrast
          stark zurück, damit Form-Labels und Inputs klar lesbar bleiben. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <img
          src="/images/location-coast.jpg"
          alt=""
          className="w-full h-full object-cover opacity-[0.18]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C] via-[#0B0B0C]/85 to-[#0B0B0C]" />
      </div>

      <div className="relative z-10 px-[6vw] pt-[22vh] md:pt-[24vh] pb-24">
        {/* Hero-Block — Eyebrow + H1 in derselben Typografie und Größen-
            staffelung wie die Section-Headlines auf der Home-Seite. */}
        <div className="max-w-[960px]">
          <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[#B7B7B7]">
            Pause now · Stay request
          </span>
          <h1 className="mt-4 font-stencil uppercase text-white text-[clamp(36px,5.5vw,72px)] leading-[1.02] tracking-[0.06em]">
            Book<br />your <span className="italic not-italic">pause</span>.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[#B7B7B7] text-base md:text-lg leading-relaxed">
            No channel managers, no booking engines. Send us your dates and we
            reply personally — usually within a few hours. Or scan the QR and
            message us straight on WhatsApp Business.
          </p>
        </div>

        <div className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.9fr)] gap-10 lg:gap-12 items-stretch">
          {/* LINKS — Formular */}
          <section aria-labelledby="request-heading">
            <h2
              id="request-heading"
              className="font-stencil uppercase text-[clamp(20px,2.2vw,28px)] tracking-[0.14em] text-white"
            >
              Request a stay
            </h2>

            {state === 'success' ? (
              <SuccessPanel email={data.email} />
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 md:p-8"
                aria-label="Stay request form"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Name"
                    id="pn-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={data.name}
                    onChange={(v) => update('name', v)}
                  />
                  <Field
                    label="Email"
                    id="pn-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={data.email}
                    onChange={(v) => update('email', v)}
                  />
                  <Field
                    label="Check-in"
                    id="pn-checkin"
                    type="date"
                    required
                    value={data.checkIn}
                    onChange={(v) => update('checkIn', v)}
                  />
                  <Field
                    label="Check-out"
                    id="pn-checkout"
                    type="date"
                    required
                    value={data.checkOut}
                    onChange={(v) => update('checkOut', v)}
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="pn-room"
                    className="block text-[10px] font-stencil uppercase tracking-[0.22em] text-[#B7B7B7] mb-2"
                  >
                    Room
                  </label>
                  <select
                    id="pn-room"
                    value={data.room}
                    onChange={(e) => update('room', e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white focus:border-white/50 focus:outline-none focus:ring-0 transition-colors"
                  >
                    {pauseConfig.pricing.map((tier) => (
                      <option
                        key={tier.name}
                        value={tier.name}
                        className="bg-[#0B0B0C] text-white"
                      >
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preis-Anzeige — synchron mit Room-Auswahl, USD + LKR. */}
                {selectedTier && <PriceBlock tier={selectedTier} />}

                {state === 'error' && (
                  <p
                    role="alert"
                    className="mt-4 text-sm text-[#FF8B8B] bg-[#8B1A1A]/15 border border-[#8B1A1A]/40 rounded-lg px-3 py-2"
                  >
                    Couldn't send your request. Please try again or email us at{' '}
                    <a
                      href={`mailto:${pauseConfig.fallbackEmail}`}
                      className="underline underline-offset-2 text-white"
                    >
                      {pauseConfig.fallbackEmail}
                    </a>
                    .
                    {errorMsg && (
                      <span className="block opacity-70 mt-1">({errorMsg})</span>
                    )}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    mt-6 w-full sm:w-auto min-h-[48px] px-8 py-3
                    rounded-full font-stencil text-xs uppercase tracking-[0.22em]
                    border border-white/50 text-white
                    transition-all duration-300
                    ${
                      isSubmitting
                        ? 'opacity-60 cursor-wait'
                        : 'hover:bg-white hover:text-[#0B0B0C] hover:border-white'
                    }
                  `}
                >
                  {isSubmitting ? 'Sending …' : 'Send request'}
                </button>

                <p className="mt-4 text-[11px] text-[#B7B7B7]/70 leading-relaxed">
                  We only store your details to reply. No newsletter, no
                  sharing.
                </p>
              </form>
            )}
          </section>

          {/* MITTE — vertikaler „OR"-Divider auf Desktop,
              horizontaler Divider auf Mobile. */}
          <div
            aria-hidden
            className="flex lg:flex-col items-center justify-center gap-3 lg:gap-4"
          >
            <span className="block h-px w-full lg:h-full lg:w-px bg-white/15" />
            <span className="shrink-0 font-stencil uppercase text-[11px] tracking-[0.28em] text-[#B7B7B7]">
              OR
            </span>
            <span className="block h-px w-full lg:h-full lg:w-px bg-white/15" />
          </div>

          {/* RECHTS — QR-Code zu WhatsApp Business mit Prefill-Text. */}
          <WhatsAppQrCard />
        </div>
      </div>

      {/* Bottom fade — wie auf allen Home-Sections.
          Schließt die Seite visuell sauber ab. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent"
      />
    </section>
  );
}

/* --------- Kleine lokale Bausteine --------- */

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
        className="block text-[10px] font-stencil uppercase tracking-[0.22em] text-[#B7B7B7] mb-2"
      >
        {label}
        {required && <span className="text-white/60 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full min-h-[44px] rounded-xl border border-white/15 bg-white/[0.03]
          px-4 py-2.5 text-[15px] text-white
          placeholder:text-[#B7B7B7]/50
          focus:border-white/50 focus:outline-none focus:ring-0
          transition-colors
          [color-scheme:dark]
        "
      />
    </div>
  );
}

function PriceBlock({
  tier,
}: {
  tier: { name: string; nightlyUsd: number; nightlyLkr: number; description: string };
}) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#B7B7B7]">
        Rate · per night
      </span>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-stencil uppercase text-[clamp(22px,2.6vw,30px)] tracking-[0.06em] text-white">
          ${tier.nightlyUsd.toLocaleString('en-US')}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B7B7B7]">
          USD
        </span>
        <span aria-hidden className="h-4 w-px bg-white/20" />
        <span className="font-stencil uppercase text-[clamp(18px,2.2vw,24px)] tracking-[0.06em] text-white">
          {tier.nightlyLkr.toLocaleString('en-US')}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B7B7B7]">
          LKR
        </span>
      </div>
      <p className="mt-2 text-xs text-[#B7B7B7] leading-relaxed">
        {tier.description}
      </p>
    </div>
  );
}

function SuccessPanel({ email }: { email: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md p-8 md:p-10"
    >
      <h3 className="font-stencil uppercase text-lg md:text-xl tracking-[0.14em] text-white">
        Request received
      </h3>
      <p className="mt-3 text-[#B7B7B7] text-base md:text-lg leading-relaxed">
        Thank you — we got your request. We'll reply personally to{' '}
        <strong className="text-white">{email || 'your email'}</strong> within a
        few hours.
      </p>
      <p className="mt-4 text-[#B7B7B7]/80 text-sm">
        If you'd rather talk now, scan the QR on the right to open WhatsApp.
      </p>
    </div>
  );
}
