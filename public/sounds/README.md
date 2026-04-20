# /public/sounds/

Hier gehört die Hintergrund-Ambient-Datei für den Sound-Button oben in der
Top-Leiste hin.

## Erwartete Datei

`ambient.mp3`

- Format: MP3 (optional zusätzlich `.ogg` für bessere Browser-Kompatibilität)
- Länge: ca. 2–4 Minuten, **seamless loopable** (kein hörbarer Schnitt beim
  Wiederholen)
- Inhalt: ruhiges Meeresrauschen mit sanftem Vogelgezwitscher im Hintergrund
- Lautstärke: normalisiert auf etwa −18 bis −14 LUFS (integrierter
  Loudness-Wert). Der Player senkt dann pro Stufe weiter ab (leise 18 %, laut
  45 %).
- Dateigröße: idealerweise < 3 MB (128 kbps MP3 reicht vollkommen aus)

## Empfohlene CC0-Quellen

- https://freesound.org  (Filter: Creative Commons 0)
- https://pixabay.com/music/  (Filter: Ambient / Nature)
- https://www.zapsplat.com  (kostenloser Account, Attribution je nach Lizenz
  prüfen)

Suchbegriffe, die gut funktionieren:

- "ocean waves birds ambient loop"
- "calm seaside dawn"
- "coastal morning ambience"

## Loop-Check

Vor dem Hochladen einmal in Audacity öffnen, Start und Ende auf gleichem
Pegel schneiden, optional ein 100 ms Crossfade zwischen Ende und Anfang, damit
der Loop unhörbar bleibt.

## Warum ist der Ordner leer?

Die Audio-Datei ist aus Lizenz-/Größe-Gründen **nicht im Repository enthalten**
und muss manuell unter diesem Pfad abgelegt werden:

```
/public/sounds/ambient.mp3
```

Fehlt die Datei, zeigt der Button sich trotzdem an, bleibt aber stumm — der
Browser loggt einen 404 in der Konsole.
