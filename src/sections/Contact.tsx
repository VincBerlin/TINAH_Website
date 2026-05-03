import { useMemo, useState, type FormEvent } from 'react';
import { MessageCircle } from 'lucide-react';
import { pauseConfig } from '../lib/pause-config';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Book section (at the very bottom of the home page).
 *
 * Design direction (per user request 2026-04-21):
 *   "Original photo + the box views the same as before, neutral color,
 *    transparent."
 *
 *   → The `Book-your-pause.jpg` photo dominates the entire background.
 *   → Cards sit on top as neutral, transparent glass (bg-white/6,
 *     backdrop-blur, white/15 border) — no cream, no dark slab, just
 *     frosted glass. This reads calm and airy, and the palm leaves
 *     behind the QR are clearly visible.
 *   → Typography stays white — the photo has enough dark tones in the
 *     upper-left corner (where the form sits) and the glass cards
 *     provide enough separation for legibility.
 *
 * Layout (desktop):
 *   ┌─────────────────────────┐  ┌──┐  ┌──────────────┐
 *   │ Stay request form       │  │OR│  │ WhatsApp QR   │
 *   │ Name · Email · Dates    │  │  │  │ Scan & chat   │
 *   │ Rate (USD + LKR)        │  │  │  │               │
 *   └─────────────────────────┘  └──┘  └──────────────┘
 *
 * On mobile this stacks vertically: Form → OR → QR.
 *
 * Why id="book"?
 *   The PAUSE-NOW circle in the Hero scrolls here via
 *   `document.getElementById('book').scrollIntoView(...)`.
 */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
};

// Guest-count options shown in the dropdown. Kept intentionally small:
// the house fits small groups, so numbers beyond 4 get a "5+" bucket
// that the concierge can clarify on reply.
const GUEST_OPTIONS = ['1', '2', '3', '4', '5+'] as const;

export function Contact() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Scroll-getriebene Entrance-Animation. Formular-Karte kommt von
  // links, WhatsApp-Karte von rechts, Überschrift ebenfalls von links
  // — alle drei landen gleichzeitig bei entrance = 1.
  //
  // 2026-04-26: Exit-Progress wird jetzt mitgenutzt (User-Request:
  // „passe die dynamik auf jeder section auf der landing page
  // gleichmäßig an"). Damit driftet die Section beim Verlassen sanft
  // weiter in Bewegungsrichtung — exakt wie Rooms.tsx
  // (`translateX(-exit * 12vw)`) — und die Opazität folgt der
  // seitenweiten Konvention `entrance - exit * 0.75`.
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  // Exit-Fade abgemildert (User-Request 2026-04-28: „kein Text darf
  // verschwinden beim Scrollen"). Floor bei 0.25, damit das Booking-
  // Formular auch beim weiterscrollen lesbar bleibt.
  const sectionOpacity = Math.max(0.25, entrance - exit * 0.35);

  // Es gibt keinen Room-Picker mehr — der Preis bezieht sich auf den
  // ersten Tier aus pauseConfig (Standard-Tagessatz). Tier-Auswahl
  // haben wir bewusst entfernt, die Konzierge klärt Details auf Reply.
  const selectedTier = pauseConfig.pricing[0];

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // WhatsApp deeplink with URL-encoded greeting. useMemo so the URLs
  // are not rebuilt on every render.
  //
  // QR: dark modules on white tile keeps scan reliability across all
  // phone cameras — we place the QR on a small opaque white square
  // inside the otherwise transparent glass card.
  const { chatUrl, qrUrl } = useMemo(() => {
    const message = encodeURIComponent(pauseConfig.whatsappPrefill);
    const chatUrl = `https://wa.me/${pauseConfig.whatsappNumber}?text=${message}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      chatUrl,
    )}&size=260x260&margin=8&ecc=M&color=0B0B0C&bgcolor=FFFFFF`;
    return { chatUrl, qrUrl };
  }, []);

  const [imgFailed, setImgFailed] = useState(false);

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
        guests: data.guests,
        price_usd: selectedTier?.nightlyUsd,
        price_lkr: selectedTier?.nightlyLkr,
        _subject: `New request from ${data.name} (${data.checkIn} to ${data.checkOut}, ${data.guests} guests)`,
      }),
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
  };

  const submitViaMailto = (): void => {
    const subject = encodeURIComponent(
      `Request from ${data.name} (${data.checkIn} to ${data.checkOut})`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Check in: ${data.checkIn}`,
        `Check out: ${data.checkOut}`,
        `Guests: ${data.guests}`,
        selectedTier
          ? `Rate: USD ${selectedTier.nightlyUsd} / LKR ${selectedTier.nightlyLkr.toLocaleString(
              'en-US',
            )} per night`
          : '',
        '',
        'Sent from thisisnotahotel.com',
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
    <>
      <section
        ref={ref}
        id="book"
        data-nav-theme="dark"
        className="relative w-screen h-screen-safe overflow-hidden text-white scroll-mt-0"
        style={{ zIndex: 80, backgroundColor: '#B84A1F' }}
        aria-label="It's an experience, not a booking — request your pause"
      >
        {/* Background — Brand-Terracotta (User-Request 2026-04-26).
            Vorher: Sri-lankisches Handwebmuster (vertikale Streifen
            in #1F1D1A / #D8CEB7).
            Jetzt: solide Brand-Orange #B84A1F als selbstbewusste
            Aussage ganz am Ende der Seite — der gleiche Ton, den
            wir auch im Hero („Pause"-Schrift) und in der § I —
            An-Introduction-Headline („It's a house.") nutzen.
            So wird die Buchungs-Sektion als finale Brand-Geste
            gelesen und schließt den Farb-Kreis der Page.

            Aufbau in Layern (User-Request 2026-04-26 — kein Verlauf):
              1) Solide Fläche #B84A1F (auf der section selbst gesetzt,
                 fungiert als Failsafe falls Overlay nicht lädt).
              2) Sehr dezenter radialer Highlight in einem helleren
                 Ton (warmes Orange #D26A3C, ~25 % Opazität),
                 zentriert hinter dem Formular — gibt Tiefe, ohne
                 die Fläche fleckig zu machen.

            ENTFERNT 2026-04-26 (User-Request: „auf der bookingseite
            den verlauf der farbe rausnehmen . kein verlauf der farbe
            in die andere section"):
              - Top-Fade #0B0B0C → transparent (h-40)
              - Bottom-Fade #0B0B0C → transparent (h-32)
            Beide Fades blendeten die Orange-Fläche oben/unten in das
            dunkle Schwarz der Nachbarsections (Testimonial oben,
            Footer unten) hinein. Jetzt hat die Orange-Section harte
            Kanten — der Farbsprung ist beabsichtigt, das Brand-Orange
            soll als bewusster Block stehen, nicht als weicher Fade. */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {/* Solide Brand-Orange als Basis-Fläche. */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: '#B84A1F' }}
          />
          {/* Warmer Highlight — radial, deutlich heller als das Base-
              Orange. Sitzt zentriert hinter den Karten, gibt der
              Fläche subtile Modellierung. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(232,138,82,0.32) 0%, rgba(232,138,82,0.12) 45%, rgba(232,138,82,0) 80%)',
            }}
          />
        </div>

        {/* Content — absolutely filling the section and vertically
            centered via `justify-center`, so when the user scrolls to
            #book the form lands in the MIDDLE of the viewport, exactly
            like the other home sections (Experience, Details). No
            previous-section text bleeds in because the section itself
            is one viewport tall (h-screen-safe) and overflow-hidden.

            Top/bottom padding reserves clearance for the fixed TopBar
            above (~96px) and breathing room above the footer strip
            below; the remaining space is split equally top/bottom by
            `justify-center`. */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-[6vw] pt-24 md:pt-28 pb-12 md:pb-16">
          {/* Eyebrow + H2. Slides in from the LEFT on scroll entry to
              match the form card underneath — eyebrow and heading
              share one motion axis so the whole top block reads as a
              single gesture.

              Copy-Update 2026-04-26 (User-Request):
                Vorher H2: „Request your pause."
                Jetzt H2:  „It's an experience,"
                            „Not a booking."
                Zwei zentrierte Stencil-Zeilen untereinander —
                Brand-Statement statt Funktions-Label. Die zweite
                Zeile ist bewusst gleich gross: kein Lead/Sub,
                sondern ein Satz auf zwei Atemzüge. Die erste Zeile
                trägt das Komma als „warte, da kommt noch was"-
                Signal, die zweite landet die Pointe. */}
          <div
            className="max-w-[960px]"
            style={{
              transform: `translateX(${(1 - entrance) * -14 - exit * 10}vw)`,
              opacity: sectionOpacity,
              willChange: 'transform, opacity',
            }}
          >
            {/* Eyebrow „§ VI — Request" (User-Request 2026-04-29):
                vorher zwei Zeilen — Stencil „§ VI — The Booking"
                oben + Mono „REQUEST" darunter. Jetzt ein einziger
                Eyebrow mit „§ VI — Request" als Wortlaut. „The
                Booking" entfällt, „Request" wandert in den Eyebrow. */}
            <div
              className="font-stencil uppercase inline-flex items-center mb-2"
              style={{
                fontSize: 11,
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.85)',
                gap: 14,
              }}
            >
              <span
                aria-hidden
                className="inline-block h-px w-8"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
              />
              § VI — Request
            </div>
            {/* H2 als zwei gestapelte Zeilen.
                aria-label gibt dem Screenreader die zusammenhängende
                Aussage als einen Satz, damit die Pause durch das
                Komma natürlich klingt. */}
            <h2
              className="mt-1.5 font-stencil uppercase text-white text-[clamp(28px,3.6vw,52px)] leading-[1.02] tracking-[0.06em]"
              aria-label="It's an experience, not a booking."
            >
              <span className="block">It&apos;s an experience,</span>
              <span className="block">Not a booking.</span>
            </h2>
          </div>

          {/* Symmetric 1fr / auto / 1fr grid. Reason: the user wants the
              „OR" divider to sit exactly in the horizontal centre of the
              viewport, on the same vertical axis as the Home button in
              the TopBar. With equal-width side columns and equal gaps,
              the centre of the `auto` middle column lands at 50vw. */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-5 lg:gap-8 items-stretch">
            {/* LEFT — Form. No duplicate "Request" eyebrow here, the
                section heading already names it.
                Slides in from the LEFT as the section enters the
                viewport; lands at its resting position when
                entrance = 1. */}
            <div
              style={{
                transform: `translateX(${(1 - entrance) * -30 - exit * 14}vw)`,
                opacity: sectionOpacity,
                willChange: 'transform, opacity',
              }}
            >
              {state === 'success' ? (
                <SuccessPanel email={data.email} />
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4 md:p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]"
                  aria-label="Stay request form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Name"
                      id="bk-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={data.name}
                      onChange={(v) => update('name', v)}
                    />
                    <Field
                      label="Email"
                      id="bk-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={data.email}
                      onChange={(v) => update('email', v)}
                    />
                    <Field
                      label="Check in"
                      id="bk-checkin"
                      type="date"
                      required
                      value={data.checkIn}
                      onChange={(v) => update('checkIn', v)}
                    />
                    <Field
                      label="Check out"
                      id="bk-checkout"
                      type="date"
                      required
                      value={data.checkOut}
                      onChange={(v) => update('checkOut', v)}
                    />
                  </div>

                  {/* Guest-count picker + live rate inline on one row.
                      Saves ~100px of vertical space versus stacking
                      the price into its own card underneath. */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <div>
                      <label
                        htmlFor="bk-guests"
                        className="block text-[10px] font-stencil uppercase tracking-[0.22em] text-[#D9D9D9] mb-1.5"
                      >
                        Guests
                      </label>
                      <select
                        id="bk-guests"
                        value={data.guests}
                        onChange={(e) => update('guests', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[15px] text-white focus:border-white/50 focus:outline-none focus:ring-0 transition-colors"
                      >
                        {GUEST_OPTIONS.map((count) => (
                          <option
                            key={count}
                            value={count}
                            className="bg-[#0B0B0C] text-white"
                          >
                            {count === '1' ? '1 guest' : `${count} guests`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedTier && <PriceInline tier={selectedTier} />}
                  </div>

                  {state === 'error' && (
                    <p
                      role="alert"
                      className="mt-4 text-sm text-[#FF9A9A] bg-[#FF5A5A]/10 border border-[#FF5A5A]/30 rounded-lg px-3 py-2"
                    >
                      We could not send your request. Please try again or email{' '}
                      <a
                        href={`mailto:${pauseConfig.fallbackEmail}`}
                        className="underline underline-offset-2 text-white"
                      >
                        {pauseConfig.fallbackEmail}
                      </a>
                      .
                      {errorMsg && (
                        <span className="block opacity-70 mt-1">
                          ({errorMsg})
                        </span>
                      )}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        min-h-[44px] px-7 py-2.5
                        rounded-full font-stencil text-xs uppercase tracking-[0.22em]
                        border border-white bg-white text-[#0B0B0C]
                        transition-all duration-300
                        ${
                          isSubmitting
                            ? 'opacity-60 cursor-wait'
                            : 'hover:bg-transparent hover:text-white'
                        }
                      `}
                    >
                      {isSubmitting ? 'Sending …' : 'Send request'}
                    </button>
                    <p className="text-[11px] text-[#D9D9D9]/90 leading-snug">
                      We only store your details to reply.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* MIDDLE — OR divider; horizontal on mobile, vertical on desktop. */}
            <div
              aria-hidden
              className="flex lg:flex-col items-center justify-center gap-3 lg:gap-4"
            >
              <span className="block h-px w-full lg:h-full lg:w-px bg-white/20" />
              <span className="shrink-0 font-stencil uppercase text-[11px] tracking-[0.28em] text-[#D9D9D9]">
                OR
              </span>
              <span className="block h-px w-full lg:h-full lg:w-px bg-white/20" />
            </div>

            {/* RIGHT — QR code to WhatsApp Business. No outer eyebrow,
                the inner "WhatsApp Business" caption inside the card
                provides enough context and saves vertical space.
                Slides in from the RIGHT as the section enters the
                viewport, mirroring the form card's entrance. */}
            <div
              className="flex flex-col"
              style={{
                transform: `translateX(${(1 - entrance) * 30 + exit * 14}vw)`,
                opacity: sectionOpacity,
                willChange: 'transform, opacity',
              }}
            >
              <div className="flex-1 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4 md:p-5 flex flex-col items-center text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9D9D9]">
                  WhatsApp · Scan &amp; chat
                </span>

                <div className="mt-3 relative">
                  {!imgFailed ? (
                    // QR on its own white tile — needed for reliable
                    // camera scans; the surrounding glass card stays
                    // transparent so the palm leaves remain visible.
                    <div className="rounded-xl bg-white p-2.5">
                      <img
                        src={qrUrl}
                        alt="QR code to start a WhatsApp chat with This Is Not A Hotel"
                        width={140}
                        height={140}
                        className="block w-[130px] h-[130px] md:w-[150px] md:h-[150px]"
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgFailed(true)}
                      />
                    </div>
                  ) : (
                    <div
                      role="img"
                      aria-label="QR code unavailable. Please use the button below."
                      className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-xl border border-dashed border-white/25 bg-white/5 flex items-center justify-center text-xs text-[#D9D9D9] px-4"
                    >
                      QR not available. Tap the button below.
                    </div>
                  )}
                </div>

                <p className="mt-3 text-[13px] text-[#D9D9D9] leading-snug max-w-[26ch]">
                  Scan with your phone camera. The chat opens with a friendly
                  message ready to send.
                </p>

                <a
                  href={chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 min-h-[40px] px-5 py-2 rounded-full border border-white bg-transparent text-white font-stencil text-[11px] uppercase tracking-[0.22em] hover:bg-white hover:text-[#0B0B0C] transition-colors duration-300"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — dark strip below the Book section.
          Instagram-Icon zentral zwischen Wordmark und Legal-Nav
          (User-Request 2026-04-28: Instagram in der Site-Unterleiste
          ganz unten). */}
      <footer
        id="contact"
        className="relative z-10 bg-[#0B0B0C] py-8 px-[6vw]"
        aria-label="Site footer"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span
            className="font-stencil text-[13px] uppercase tracking-[0.22em] text-white"
            aria-label="This Is Not A Hotel"
          >
            THIS IS NOT A HOTEL
            <sup className="text-[0.8em] align-top ml-[0.2em] tracking-normal">
              ™
            </sup>
          </span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/thisisnotahotelsl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram · This Is Not A Hotel"
              className="text-[#D9D9D9] hover:text-white transition-colors"
              style={{ lineHeight: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <span className="text-[#D9D9D9] text-xs">
              © 2026 All rights reserved.
            </span>
          </div>
          <nav aria-label="Legal" className="flex gap-6">
            <a
              href="/privacy"
              className="text-[#D9D9D9] text-xs hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[#D9D9D9] text-xs hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="/imprint"
              className="text-[#D9D9D9] text-xs hover:text-white transition-colors"
            >
              Imprint
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

/* --------- Small local building blocks --------- */

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
        className="block text-[10px] font-stencil uppercase tracking-[0.22em] text-[#D9D9D9] mb-2"
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
        // lang="en" auf date-Inputs zwingt Firefox / iOS Safari auf das
        // englische Datum-Format (YYYY-MM-DD). Chrome respektiert die
        // OS-Locale unabhängig davon — das ist Browser-Verhalten, nicht
        // App-Bug. Der Submit-Wert ist immer ISO-8601, egal welche
        // Locale die UI darstellt.
        lang={type === 'date' ? 'en' : undefined}
        placeholder={type === 'date' ? 'YYYY-MM-DD' : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full min-h-[44px] rounded-xl border border-white/15 bg-white/[0.04]
          px-4 py-2.5 text-[15px] text-white
          placeholder:text-[#D9D9D9]/55
          focus:border-white/50 focus:outline-none focus:ring-0
          transition-colors
        "
      />
    </div>
  );
}

/**
 * Compact price chip — sits inline next to the Room selector.
 * Shows only the essentials (USD rate + LKR companion) so the form
 * can keep the price visible without spending an entire row on it.
 * The full tier description was moved out of this chip: it was
 * eating vertical space and duplicating info that the room name
 * already implies (e.g. "Ocean View Suite").
 */
function PriceInline({
  tier,
}: {
  tier: {
    name: string;
    nightlyUsd: number;
    nightlyLkr: number;
  };
}) {
  return (
    <div className="sm:self-stretch flex items-end">
      <div className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 min-h-[44px] flex flex-col justify-center">
        <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-[#D9D9D9]">
          Rate · night
        </span>
        <div className="mt-0.5 flex items-baseline gap-x-2">
          <span className="font-stencil uppercase text-[17px] leading-none tracking-[0.06em] text-white">
            ${tier.nightlyUsd.toLocaleString('en-US')}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9D9D9]">
            USD
          </span>
          <span aria-hidden className="h-3 w-px bg-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9D9D9]">
            LKR {tier.nightlyLkr.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
}

function SuccessPanel({ email }: { email: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]"
    >
      <h3 className="font-stencil uppercase text-lg tracking-[0.14em] text-white">
        Request received
      </h3>
      <p className="mt-3 text-[#D9D9D9] text-base leading-relaxed">
        Thank you, we got your request. We will reply personally to{' '}
        <strong className="text-white">{email || 'your email'}</strong> within
        a few hours.
      </p>
      <p className="mt-3 text-[#D9D9D9]/90 text-sm">
        If you'd rather talk now, scan the QR on the right to open WhatsApp.
      </p>
    </div>
  );
}
