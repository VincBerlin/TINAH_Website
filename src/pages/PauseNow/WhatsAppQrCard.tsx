import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { pauseConfig } from '../../lib/pause-config';

/**
 * QR-Code → WhatsApp Business des Hotels. Dunkles Brand-Design
 * konsistent mit der Startseite.
 *
 * Der QR selbst bleibt auf weißem Grund gerendert — dunkle QR-Codes
 * auf dunklem Hintergrund sind zwar theoretisch scanbar, aber viele
 * Smartphone-Kameras scheitern daran. Deshalb umrahmen wir den
 * schwarz-auf-weißen QR mit einer weißen Karte, eingebettet in die
 * dunkle Seitenkomposition.
 *
 * Bildquelle ist die öffentliche API von `api.qrserver.com` (GoQR.me),
 * die seit Jahren stabil läuft, kein API-Key braucht und CDN-gepuffert ist.
 * Wenn die Ressource nicht lädt, blenden wir den QR aus und zeigen den
 * sichtbaren „Open WhatsApp"-Button als garantierte Zweitspur.
 */
export function WhatsAppQrCard() {
  const [imgFailed, setImgFailed] = useState(false);

  const { chatUrl, qrUrl } = useMemo(() => {
    const message = encodeURIComponent(pauseConfig.whatsappPrefill);
    // wa.me ist WhatsApps offizieller Deeplink-Dienst. Öffnet WhatsApp
    // Business direkt mit vorbefülltem Text — sowohl auf Mobile als
    // auch in WhatsApp Web auf dem Desktop.
    const chatUrl = `https://wa.me/${pauseConfig.whatsappNumber}?text=${message}`;
    // 260×260 ist eine gute Größe für Smartphone-Kamera-Scans aus
    // ~30–50 cm Entfernung. Höhere ECC-Stufe (M) toleriert kleine
    // Bildfehler / Druckraster.
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      chatUrl,
    )}&size=260x260&margin=8&ecc=M&color=0B0B0C&bgcolor=FFFFFF`;
    return { chatUrl, qrUrl };
  }, []);

  return (
    <section aria-labelledby="qr-heading" className="flex flex-col">
      <h2
        id="qr-heading"
        className="font-stencil uppercase text-[clamp(20px,2.2vw,28px)] tracking-[0.14em] text-white"
      >
        Scan &amp; chat
      </h2>

      <div className="mt-6 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 md:p-8 flex flex-col items-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#B7B7B7]">
          WhatsApp Business
        </span>

        <div className="mt-5 relative">
          {!imgFailed ? (
            // Weiße Karte um den QR — garantiert Scanbarkeit auch auf
            // kontrastschwachen Kameras und wirkt im dunklen Layout wie
            // ein beleuchtetes Schild.
            <div className="rounded-xl bg-white p-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]">
              <img
                src={qrUrl}
                alt="QR code to start a WhatsApp chat with This Is Not A Hotel"
                width={220}
                height={220}
                className="block w-[200px] h-[200px] md:w-[220px] md:h-[220px]"
                loading="lazy"
                decoding="async"
                onError={() => setImgFailed(true)}
              />
            </div>
          ) : (
            <div
              role="img"
              aria-label="QR code unavailable — use the button below"
              className="w-[200px] h-[200px] md:w-[220px] md:h-[220px] rounded-xl border border-dashed border-white/25 bg-white/[0.03] flex items-center justify-center text-xs text-[#B7B7B7] px-4"
            >
              QR not available — tap the button below to open WhatsApp.
            </div>
          )}
        </div>

        <p className="mt-5 text-sm text-[#B7B7B7] leading-relaxed max-w-[30ch]">
          Scan with your phone's camera — a WhatsApp chat opens with a
          pre-filled message. Just add your dates and send.
        </p>

        {/* Sichtbare Zweitspur: Klickbar auf Desktop (öffnet WhatsApp Web)
            und auf Mobile (öffnet die WhatsApp-App). */}
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full border border-white/50 text-white font-stencil text-xs uppercase tracking-[0.22em] hover:bg-white hover:text-[#0B0B0C] hover:border-white transition-colors duration-300"
        >
          <MessageCircle className="w-4 h-4" aria-hidden />
          <span>Open WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
