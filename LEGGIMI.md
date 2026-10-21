# Casa – note, piano pasti e lista della spesa (v1.1, 21 ott 2026)

Web app installabile (PWA) in un solo file, stile Google Keep:
- **Note**: testo o elenchi, colori, fissate, archivio, ricerca.
- **Piano**: Lunedì–Domenica, pranzo e cena (si vedono solo i piatti). Toccando un pasto lo scegli dalle ricette o lo scrivi, con i suoi ingredienti.
- **Ricette**: elenco dei piatti con ingredienti (aggiungi, modifica, elimina); modificando una ricetta si aggiornano i pasti del piano che la usano.
- **Spesa**: generata dal piano (ingrediente ripetuto = una sola voce, con i giorni in cui serve), più articoli aggiunti a mano. "Nuova spesa" azzera le spunte.
- **Sync**: file `casa-dati.json` nel repo privato dei dati (stesso `scheda-dati` della palestra; si può riusare lo stesso token: pulsante "Usa token palestra").

Piano iniziale precompilato dallo screenshot Keep (gli ingredienti sono una mia ipotesi: correggili dal Piano). Domenica era tagliata: ho messo solo "gaggiano" a cena.

## Pubblicare
1. Nuovo repo pubblico (es. `casa`) → Add file → Upload files → carica il CONTENUTO della cartella `sito/` (6 file) → Commit.
2. Settings → Pages → Branch `main`, cartella `/ (root)` → Save.
3. Apri https://variedeventuali.github.io/casa/ → Chrome ⋮ → Aggiungi a schermata Home.
4. Tab Sync: repo `variedeventuali/scheda-dati`, token (o "Usa token palestra"). Stessa cosa sull'altro telefono.

## Aggiornare
Ricarica i file in `sito/`; cambia `APP_VERSION` in index.html e `V` in sw.js. Test: `test/casa-test.js` (Node + jsdom).

## Limiti
Non provata su telefono reale né su GitHub vero. Sync per elemento (vince la modifica più recente). Tombstone delle note eliminate restano nel file.
