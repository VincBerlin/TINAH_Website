/**
 * Konfiguration der PAUSE-NOW-Unterseite (Booking-Subpage).
 *
 * Alles an einem Ort — wenn sich WhatsApp-Nummer, Preise oder E-Mail
 * ändern, passt du NUR diese Datei an. Kein Hunt-and-Peck durch JSX.
 *
 * Sicherheit:
 *   Hier stehen nur ÖFFENTLICHE Werte (Telefonnummer fürs Hotel,
 *   Preis-Anker, Formspree-Endpoint). Keine Secrets — die würden sowieso
 *   im Client-Bundle landen und wären damit kein Secret mehr. Formspree-
 *   Endpoints sind per Design public und vom Anbieter mit Rate-Limiting
 *   und CAPTCHA-Fallback geschützt.
 */

export interface PricingTier {
  name: string;
  nightlyUsd: number;
  nightlyLkr: number;
  description: string;
  includes: string[];
}

export interface PauseConfig {
  /**
   * WhatsApp-Business-Nummer des Hotels im internationalen Format
   * OHNE + oder Leerzeichen (wa.me erwartet das so).
   * Beispiel Sri Lanka: "94771234567"
   */
  whatsappNumber: string;
  /** Vorbefüllte WhatsApp-Nachricht. URL-Encoding übernimmt die Komponente. */
  whatsappPrefill: string;
  /**
   * Formspree-Endpoint (oder kompatibel: Getform, Basin, Web3Forms).
   * Kostenlose Tiers reichen für < 50 Anfragen/Monat locker aus.
   * Leer lassen → Form fällt auf `mailto:` zurück (öffnet Mailclient).
   */
  formEndpoint: string;
  /**
   * Fallback-Empfänger, falls formEndpoint leer ist. Wird für den
   * mailto:-Link benutzt.
   */
  fallbackEmail: string;
  /** Hotel-Koordinaten für Google Maps Embed (ohne API-Key). */
  hotelCoords: { lat: number; lon: number };
  /** Place-ID für exakten Pin. Liefert Google Maps bei „Teilen → Einbetten". */
  hotelPlaceQuery: string;
  /** Preise pro Zimmertyp — Richtwerte, „ab"-Preise pro Nacht. */
  pricing: PricingTier[];
  /**
   * Nominaler Wechselkurs USD → LKR.
   * Wird auf der Buchungsseite angezeigt (nicht für Checkout verwendet).
   * Bei Bedarf an aktuellen Markt anpassen (Stand: Mitte 2026, ~1 USD ≈ 305 LKR).
   */
  usdToLkr: number;
}

export const pauseConfig: PauseConfig = {
  // WhatsApp-Business-Nummer — bitte echte Nummer eintragen (ohne + und Leerzeichen).
  whatsappNumber: '94770000000',
  whatsappPrefill:
    "Hi This Is Not A Hotel — I'd like to ask about availability. My preferred dates are: [DD.MM.YYYY – DD.MM.YYYY]. Name: [your name]. Thank you!",
  formEndpoint: '', // z. B. 'https://formspree.io/f/xxxxxxx'
  fallbackEmail: 'hello@thisisnotahotel.com',
  hotelCoords: { lat: 6.0038471, lon: 80.7490338 },
  hotelPlaceQuery: 'This+Is+Not+A+Hotel,+Mawella+Beach,+Sri+Lanka',
  usdToLkr: 305,
  pricing: [
    {
      name: 'Ocean View Suite',
      nightlyUsd: 195,
      nightlyLkr: 59_475,
      description:
        'Ocean view, private balcony, king-size bed — the quietest room in the house.',
      includes: ['Breakfast', 'Yoga deck access', 'Beach towels'],
    },
    {
      name: 'Garden Room',
      nightlyUsd: 150,
      nightlyLkr: 45_750,
      description:
        'Tropical garden at your door. Peacocks at breakfast included.',
      includes: ['Breakfast', 'Bike rental', 'Welcome tea'],
    },
    {
      name: 'Couples Retreat',
      nightlyUsd: 235,
      nightlyLkr: 71_675,
      description:
        'Two-room suite with outdoor shower. For long, quiet stays.',
      includes: ['Breakfast', 'Private bay shuttle', 'Spa voucher'],
    },
  ],
};
