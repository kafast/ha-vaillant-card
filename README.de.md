# Vaillant App Card

[English](README.md) | **Deutsch**

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5?logo=homeassistant&logoColor=white)](#installation)
[![Home Assistant Dashboard](https://img.shields.io/badge/Home_Assistant-Dashboard-18BCF2?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/dashboards/)
[![GitHub Issues](https://img.shields.io/github/issues/kafast/ha-vaillant-card)](https://github.com/kafast/ha-vaillant-card/issues)

Steuere deine Vaillant-Heizung und dein Warmwasser direkt im Home-Assistant-Dashboard – mit einer anpassungsfähigen Oberfläche für **Smartphone, Tablet und Desktop**. Standardmäßig übernimmt die Karte das Home-Assistant-Theme. Weitere Farbstile sind wählbar; die Gestaltung ist von myVAILLANT inspiriert.

Die Karte erkennt passende Entitäten der [myVAILLANT-Integration](https://github.com/signalkraft/mypyllant-component) automatisch. Für den Einstieg genügt eine Zeile YAML. Weitere Custom Cards oder Themes sind nicht erforderlich.

> [!WARNING]
> **KI-generiert / experimentell:** Der Code wurde mit generativer KI erstellt und überarbeitet. Er ist nicht durchgehend getestet und wurde bisher nicht an einer echten Heizungsanlage validiert. Automatisierte Prüfungen mit simulierten Daten ersetzen keinen Praxistest.
>
> Bedienelemente senden echte Steuerbefehle. Prüfe Zuordnungen, angezeigte Werte und die Wirkung von Änderungen zunächst an deiner eigenen Anlage. Die Karte ist keine Sicherheitsüberwachung und darf nicht die einzige Quelle für Störungs- oder Frostschutzmeldungen sein. Sichere deine Dashboard-Konfiguration vor Updates. Es handelt sich um ein unabhängiges Community-Projekt ohne Unterstützung oder Freigabe durch Vaillant oder das Home-Assistant-Projekt.

**Zu Home Assistant hinzufügen**

[![Zu Home Assistant hinzufügen](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=kafast&repository=ha-vaillant-card&category=plugin)

Öffnet das Repository in HACS deiner Home-Assistant-Instanz. HACS muss bereits eingerichtet sein; anschließend die Karte herunterladen.

> [!NOTE]
> Eigenständiges Community-Projekt. Nicht von Vaillant entwickelt oder unterstützt. Die Karte ist eine Dashboard-Erweiterung und ersetzt nicht die myVAILLANT-Integration.

![Desktop: Heizung und Warmwasser mit Schnellaktionen und Anlagendaten](docs/preview.jpg)

*Desktop-Vorschau im Standardfarbstil Home Assistant und hellem Modus mit erfundenen Beispieldaten. Keine Verbindung zu einer echten Anlage.*

<details>
<summary>Tablet- und Smartphone-Vorschau</summary>

**Tablet:** Steuerbereiche nebeneinander, Schnellaktionen und Anlagendaten darunter.

![Tablet-Vorschau](docs/preview-tablet.jpg)

**Smartphone:** Bedienelemente untereinander, Temperatursteuerung direkt in der Übersicht und erreichbare Navigation am unteren Rand.

<img src="docs/preview-mobile.jpg" alt="Smartphone-Vorschau" width="390" />

</details>

## Inhalt

- [Funktionen](#funktionen)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Schnellstart](#schnellstart)
- [Layout auf Handy, Tablet und Desktop](#layout-auf-handy-tablet-und-desktop)
- [Farbstile und Themes](#farbstile-und-themes)
- [Konfiguration](#konfiguration)
- [Automatische Zuordnung](#automatische-zuordnung)
- [Bedienung und Grenzen](#bedienung-und-grenzen)
- [Updates](#updates)
- [Fehlerhilfe](#fehlerhilfe)
- [Datenschutz](#datenschutz)
- [Entwicklung und Support](#entwicklung-und-support)

## Funktionen

| Ansicht | Funktionen |
| --- | --- |
| **Übersicht** | Isttemperaturen, direkte Sollwertsteuerung für Heizung und Warmwasser, Schnellaktionen und ausgewählte Anlagendaten |
| **Heizung** | Ist- und Solltemperatur, Betriebsart und Zugriff auf Zeitplanung, Heizkurve und Quick-Veto-Dauer |
| **Warmwasser** | Speichertemperatur, Solltemperatur, Betriebsart und Warmwasser-Boost |
| **Schnellzugriff** | Warmwasser schnell, Stoßlüften und Abwesenheitsmodus |
| **Energie** | Elektrische Energie, Umweltertrag, erzeugte Wärme und Effizienz; Hydraulikstation separat |
| **Anlage** | Erreichbarkeit, Störungsmeldungen, Anlagendaten und Hinweise zu fehlenden Entitäten |

- Automatische Zuordnung anhand der myVAILLANT-Registrierung, auch bei umbenannten Entitäts-IDs.
- Auswahl bei mehreren Anlagen, Zonen, Warmwasserspeichern oder Energiegeräten.
- Lokale YAML-Ausnahmen für einzelne Entitäten.
- Layout nach verfügbarer Kartenbreite statt nach erkanntem Gerätetyp.
- Fünf Farbstile: Home Assistant, Vaillant, Glas, Graphit und Ozean.
- Automatischer Hell-/Dunkelmodus entsprechend Home Assistant.
- Visueller Editor für Beschriftung, Sprache, Farbstil und optionale Akzentfarben.
- Deutsche und englische Oberfläche; automatische Auswahl anhand der HA-Sprache.

## Voraussetzungen

- Home Assistant mit Dashboard-Unterstützung für Custom Cards.
- Eingerichtete [myVAILLANT-Integration von signalkraft](https://github.com/signalkraft/mypyllant-component), Plattform `mypyllant`.
- Aktivierte Entitäten für die gewünschten Funktionen: insbesondere `climate` für Heizung und `water_heater` für Warmwasser.
- Für die automatische Zuordnung muss die HA-Sitzung die Entitätsregistrierung lesen können.
- Optional: [HACS](https://www.hacs.dev/) für Installation und Updates.

Die verfügbaren Funktionen richten sich nach Anlage, Integration und aktivierten Entitäten. Eine verbindliche Mindestversion von Home Assistant ist noch nicht ermittelt; bisherige Prüfungen verwenden simulierte Anlagendaten.

## Installation

### HACS – empfohlen

Das Repository wird als **benutzerdefiniertes Dashboard-Repository** hinzugefügt; es ist nicht im HACS-Standardkatalog gelistet.

1. **HACS → ⋮ → Benutzerdefinierte Repositories** öffnen.
2. Repository-URL eintragen:

   ```text
   https://github.com/kafast/ha-vaillant-card
   ```

3. Typ **Dashboard** auswählen und hinzufügen.
4. **Vaillant App Card** in HACS suchen und herunterladen.
5. Das Home-Assistant-Frontend neu laden.

HACS verwaltet die JavaScript-Ressource normalerweise selbst. Fehlt sie unter **Einstellungen → Dashboards → Ressourcen**, folgenden Eintrag als **JavaScript-Modul** ergänzen:

```text
/hacsfiles/ha-vaillant-card/vaillant-app-card.js
```

### Manuell

1. [`vaillant-app-card.js`](https://raw.githubusercontent.com/kafast/ha-vaillant-card/main/vaillant-app-card.js) herunterladen.
2. Datei nach `/config/www/vaillant-app-card.js` kopieren; den Ordner `www` bei Bedarf erstellen.
3. Unter **Einstellungen → Dashboards → Ressourcen** hinzufügen:

   | Feld | Wert |
   | --- | --- |
   | URL | `/local/vaillant-app-card.js?v=1.4.0` |
   | Ressourcentyp | JavaScript-Modul |

4. Das Frontend neu laden.

Fehlt der Menüpunkt **Ressourcen**, im Benutzerprofil den erweiterten Modus einschalten. Bei einem erstmals angelegten `www`-Ordner kann ein HA-Neustart erforderlich sein, wenn die Datei noch nicht erreichbar ist.

<details>
<summary>Ressourcen per YAML verwalten</summary>

In die vorhandene Ressourcenliste eintragen:

```yaml
lovelace:
  resources:
    - url: /local/vaillant-app-card.js?v=1.4.0
      type: module
```

Einen vorhandenen `lovelace:`-Abschnitt nicht doppelt anlegen. Ressourcen entweder über die verwendete YAML-Konfiguration oder über die Oberfläche pflegen.

</details>

> [!IMPORTANT]
> Beim Wechsel zwischen manueller Installation und HACS den alten Ressourceneintrag entfernen. Die JavaScript-Datei nur einmal laden.

## Schnellstart

Dashboard bearbeiten → **Karte hinzufügen → Manuell** und Folgendes einfügen:

```yaml
type: custom:vaillant-app-card
```

Die Karte sucht nach passenden myVAILLANT-Entitäten. Gibt es mehrere mögliche Anlagen oder Zonen, erscheint eine Auswahl. Sollwerte lassen sich direkt in der Übersicht mit Plus/Minus ändern. **Betriebsart & Einstellungen** öffnet die jeweilige Detailansicht.

## Layout auf Handy, Tablet und Desktop

Die Karte richtet sich nach ihrem **tatsächlich verfügbaren Platz**. Ein schmaler Dashboard-Bereich verwendet auch am Desktop die kompakte Ansicht. Es gibt keine Geräteerkennung und keine getrennten mobilen Dashboards.

| Verfügbare Kartenbreite | Layout |
| --- | --- |
| Unter 620 px | Steuerbereiche untereinander; große Plus-/Minus-Tasten, kompakte Schnellaktionen, zwei ausgewählte Anlagenwerte und Navigation am unteren Rand |
| 620–1049 px | Heizung und Warmwasser nebeneinander; Schnellaktionen und Anlagendaten darunter; Navigation oben |
| Ab 1050 px | Zwei Steuerbereiche mit seitlichen Schnellaktionen und Anlagendaten; mehrspaltige Energie- und Anlagenansichten |

Auf breiteren Karten ist die Betriebsart direkt in der Übersicht erreichbar. Auf schmalen Karten wird sie über **Betriebsart & Einstellungen** geöffnet. Der Hell-/Dunkelmodus folgt dem von Home Assistant gemeldeten Modus.

### Breite im Home-Assistant-Dashboard einstellen

Die Karte kann den Platz nutzen, den ihr Home Assistant zuweist. In einer schmalen Abschnittsspalte bleibt sie entsprechend kompakt.

- **Abschnitte:** Karte über den Layout-Dialog auf die volle Abschnittsbreite setzen. Für mehr Platz auch den Abschnitt selbst auf mehrere Spalten verbreitern.
- **Eigene Wärmepumpenansicht:** Eine Panel-Ansicht stellt eine einzelne Karte über die verfügbare Breite dar.

<details>
<summary>Beispiel für eine eigene Panel-Ansicht</summary>

Diesen Eintrag in die vorhandene Liste `views` des Dashboards aufnehmen:

```yaml
- title: Wärmepumpe
  path: waermepumpe
  type: panel
  cards:
    - type: custom:vaillant-app-card
```

Das ist eine vollständige Ansicht, nicht der Inhalt einer einzelnen manuellen Karte. Bestehende Ansichten erhalten und den Eintrag ergänzen.

</details>

## Farbstile und Themes

![Vergleich der fünf Farbstile mit Beispieldaten](docs/color-schemes.jpg)

**Karte bearbeiten → Visuellen Editor anzeigen → Farbstil** öffnen und den gewünschten Stil auswählen. Optional lassen sich dort auch Akzent- und Heizungsfarbe als Hex-Werte eintragen. Weitere Konfigurationsoptionen bleiben im YAML-Editor verfügbar.

| Farbstil | `color_scheme` | Darstellung |
| --- | --- | --- |
| **Vaillant** | `vaillant` | Grüntöne und warme Heizungsakzente |
| **Home Assistant** | `home_assistant` | Hintergrund, Text, Akzent und Rahmen aus dem aktiven HA-Theme; Standard |
| **Glas** | `glass` | Transparente Flächen mit Unschärfe und Theme-Akzentfarbe |
| **Graphit** | `graphite` | Neutrale Grau- und dezente Lavendeltöne |
| **Ozean** | `ocean` | Blautöne mit hellblauen Akzenten |

Alle Stile folgen dem von Home Assistant gemeldeten Hell-/Dunkelmodus. Ohne `color_scheme` verwendet die Karte den Home-Assistant-Stil. Explizit gewählte Farbstile bleiben unverändert.

### Passend zum Home-Assistant-Standard oder aktiven Theme

```yaml
type: custom:vaillant-app-card
color_scheme: home_assistant
```

Dieser Stil nutzt unter anderem `--ha-card-background`, `--card-background-color`, `--primary-text-color`, `--secondary-text-color`, `--primary-color` und die Rahmenvariablen von Home Assistant. Änderungen am aktiven Theme können dadurch auch die Karte einfärben.

### Transparente Glasoptik

```yaml
type: custom:vaillant-app-card
color_scheme: glass
```

Ein Dashboard-Hintergrund macht den Effekt deutlich sichtbarer. Die Karte berücksichtigt vorhandene Variablen wie `--ha-card-glass-tint`, `--ha-card-backdrop-filter` und `--ha-card-border-radius`; andernfalls verwendet sie eigene transparente Flächen und einen Blur-Effekt. Zusätzliche Karten oder `card-mod` sind dafür nicht erforderlich. Browser ohne Backdrop-Filter erhalten eine deckende Ersatzdarstellung.

Für ein bereits installiertes Glass-Theme kann auch `home_assistant` passen, wenn dessen Hintergrund und Farben übernommen werden sollen. Der genaue Look hängt von den Variablen und Anpassungen des jeweiligen Themes ab.

### Eigene Akzentfarben

```yaml
type: custom:vaillant-app-card
color_scheme: home_assistant
accent_color: "#03a9f4"
heating_color: "#ff9800"
```

`accent_color` färbt aktive Elemente und die allgemeinen Akzente; `heating_color` die Heizungsakzente. Erlaubt sind Hex-Farben mit 3, 4, 6 oder 8 Stellen. Im YAML die Werte in Anführungszeichen setzen, da `#` sonst einen Kommentar einleitet. Zum Zurücksetzen die Option entfernen bzw. das Feld im visuellen Editor leeren.

## Konfiguration

Beschriftung und Farben lassen sich im visuellen Karteneditor einstellen. Für die vollständige Konfiguration, etwa Entitätszuordnungen und feste Anlagenindizes, den YAML-Editor verwenden.

| Option | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `type` | String | erforderlich | `custom:vaillant-app-card` |
| `title` | String | sprachabhängig | Überschrift der Karte; eigene Texte bleiben unverändert |
| `zone_name` | String | sprachabhängig | Anzeigename der Heizungsansicht; eigene Texte bleiben unverändert |
| `view` | String | `dashboard` | Vollständige Karte oder einzelnes Widget; siehe unten |
| `control_mode` | String | `full` | `full`, `admin` oder `read_only` |
| `control_modes` | Objekt | `{}` | Zusätzliche Regeln für `heating`, `hot_water`, `quick_actions`, `settings` |
| `show_header` | Boolean | `true` | Kartenüberschrift anzeigen |
| `language` | String | `auto` | HA-Sprache übernehmen; alternativ `de` oder `en`. Andere HA-Sprachen verwenden Englisch. |
| `color_scheme` | String | `home_assistant` | `vaillant`, `home_assistant`, `glass`, `graphite` oder `ocean` |
| `accent_color` | String | aus Farbstil/Theme | Optionale Hex-Farbe für allgemeine Akzente |
| `heating_color` | String | aus Farbstil/Theme | Optionale Hex-Farbe für Heizungsakzente |
| `auto_discover` | Boolean | `true` | Automatische Entitätszuordnung aktivieren |
| `system_id` | String | automatisch | Bestimmte myVAILLANT-Anlage auswählen |
| `config_entry_id` | String | alle myVAILLANT-Einträge | Suche auf einen Integrationseintrag beschränken |
| `zone` | Ganzzahl | automatisch/Auswahl | Technischer Index der Heizzone |
| `circuit` | Ganzzahl | automatisch/Auswahl | Technischer Index des Heizkreises |
| `water` | Ganzzahl | automatisch/Auswahl | Technischer Index des Warmwasserspeichers |
| `energy_device_id` | String | automatisch/Auswahl | HA-Geräte-ID des Energiegeräts |
| `entities` | Objekt | `{}` | Einzelne Entitätszuordnungen überschreiben |

## Einzelne Widgets und Bedienrechte

![Widgets](docs/widgets.jpg)

*Widgets mit erfundenen Beispieldaten: Heizung mit Bedienung, Warmwasser nur zur Anzeige und Schnellaktionen nur für Administratoren (Ansicht eines normalen Benutzers).*

Die vollständige Karte bleibt der Standard. Mit `view` lassen sich ihre Bereiche als einzelne Dashboard-Karten platzieren. Entitäten werden weiterhin automatisch erkannt; mehrere Widgets teilen sich die Registrierungsabfrage und erzeugen keine zusätzlichen Vaillant-Cloud-Abfragen.

| `view` | Inhalt |
| --- | --- |
| `dashboard` | Vollständige Karte mit Navigation; Standard |
| `overview` | Übersicht ohne Reiternavigation |
| `heating` | Heizungsanzeige mit optionaler Temperatur- und Betriebsartsteuerung |
| `hot_water` | Warmwasseranzeige mit optionaler Temperatur- und Betriebsartsteuerung |
| `quick_actions` | Warmwasser-Boost, Stoßlüften und Abwesenheit |
| `energy` | Energieübersicht mit Diagnose fehlender Werte |
| `efficiency` | Einzelne Effizienzanzeige aus der Integration |
| `power` | Optionale Momentanleistung eines frei gewählten Sensors |
| `system` | Vollständige Anlagen- und Wartungsansicht |
| `system_data` | Kompakte Anlagendaten: Vorlauf, Druck, Außentemperatur, Effizienz |

Beispiel: Heizungs-Widget, das nur Administratoren bedienen können:

```yaml
type: custom:vaillant-app-card
view: heating
control_mode: admin
```

Beispiel: Warmwasser ausschließlich anzeigen, ohne Plus/Minus oder Betriebsartauswahl:

```yaml
type: custom:vaillant-app-card
view: hot_water
control_mode: read_only
```

Beispiel: einzelne Effizienzanzeige:

```yaml
type: custom:vaillant-app-card
view: efficiency
control_mode: read_only
```

Optional entfernt `show_header: false` die Kartenüberschrift. Eigene `title`-Beschriftungen, Sprache, Farbstile und manuelle Zuordnungen funktionieren auch bei Widgets. Widget-Auswahl, allgemeiner Bedienmodus und Bereichsregeln sind im visuellen Editor verfügbar.

### Optionale momentane elektrische Leistung

Im visuellen Editor **Leistungssensor · optional** auswählen oder den Sensor per YAML zuordnen:

```yaml
type: custom:vaillant-app-card
entities:
  power: sensor.example_heat_pump_power
```

Der Sensor kann aus myVAILLANT, einem separaten Stromzähler, MQTT oder einer anderen HA-Integration stammen. Vorhandene W-/kW-Sensoren werden im Editor vorgeschlagen; eine zukünftige Entitäts-ID kann auch manuell eingetragen werden. Die Beispiel-ID später durch den eigenen Sensor ersetzen.

Ohne `entities.power` bzw. mit `null` bleibt die optionale Anzeige ausgeblendet. Mit konfiguriertem Sensor erscheint sie in Übersicht, Energie- und Anlagenansicht sowie im Anlagendaten-Widget. Die kompakte Übersicht priorisiert dann Leistung und Wasserdruck; die Vorlauftemperatur bleibt in der vollständigen Anlagenansicht erhalten. Zum Ausblenden das Sensorfeld leeren; andere Entitätszuordnungen bleiben bestehen.

Die Einheit des Sensors muss **W** oder **kW** sein. Die Karte rechnet für die Darstellung um und erhält einen echten Nullwert. Fehlende, nicht verfügbare, nicht numerische oder mit falscher Einheit gelieferte Werte erscheinen als „—“, nicht als 0. Ein Sensor in A, Wh oder kWh ist kein Sensor für momentane Leistung. Aus dem optionalen Wert werden keine Energiesummen oder COP-Werte berechnet. Die Aktualisierung folgt der jeweiligen Sensorintegration; die Karte fragt den Sensor nicht zusätzlich ab.

Einzelnes Widget nur zur Anzeige:

```yaml
type: custom:vaillant-app-card
view: power
control_mode: read_only
entities:
  power: sensor.example_heat_pump_power
```

Das einzelne Leistungs-Widget benötigt keinen Zugriff auf die myVAILLANT-Registrierung. Solange der Sensor noch nicht verfügbar ist, zeigt es einen entsprechenden Hinweis. Andere Widgets und die vollständige Karte verwenden weiterhin ihre übliche automatische Zuordnung.

### Anzeigen oder bedienen

| `control_mode` | Verhalten |
| --- | --- |
| `full` | Anzeigen und bedienen, soweit Entität und Integration dies unterstützen; Standard |
| `admin` | Nur angemeldete HA-Administratoren erhalten Bedienelemente; alle anderen sehen Werte |
| `read_only` | Reine Anzeige für alle, einschließlich Administratoren |

Im Anzeigemodus werden die Bedienelemente entfernt. Die Karte sendet keine Steuerbefehle und öffnet keine nativen Entitätsdialoge, über die Einstellungen geändert werden könnten. Navigation und lokale Auswahl einer Anlage bleiben möglich. Fehlende Benutzerinformationen werden bei `admin` als fehlende Admin-Berechtigung behandelt.

Die Moduswahl gilt für die ganze Karte. Einzelne Bereiche können zusätzlich eingeschränkt werden:

```yaml
type: custom:vaillant-app-card
control_mode: full
control_modes:
  heating: full
  hot_water: admin
  quick_actions: admin
  settings: admin
```

- `heating`: Heizungs-Solltemperatur und Betriebsart.
- `hot_water`: Warmwasser-Solltemperatur und Betriebsart.
- `quick_actions`: Warmwasser-Boost, Stoßlüften und Abwesenheit, auch in Detailansichten.
- `settings`: Öffnen nativer Entitätsdialoge für weitere Einstellungen und Messwerte.

Bereichsregeln können den allgemeinen Modus nur weiter einschränken: `control_mode: read_only` bleibt auch mit `heating: full` eine reine Anzeige. Ein HA-Benutzerwechsel aktualisiert die Darstellung.

> [!IMPORTANT]
> **Das ist eine Bedienbeschränkung innerhalb der Karte, keine serverseitige Zugriffskontrolle.** Andere Dashboards, HA-Dialoge oder direkte Serviceaufrufe werden dadurch nicht gesperrt. Wer die Kartenkonfiguration bearbeiten kann, kann diese Regeln ändern. Für echte Berechtigungen ist die Home-Assistant-Authentifizierung und -Autorisierung zuständig. Auch zwei getrennte Anzeige-/Bedien-Dashboards allein schaffen keine serverseitige Sperre.

### Warum Bedienung oder Energie fehlen können

Steuerung ist grundsätzlich vorgesehen. Ist der Online-Sensor `off`, sperrt die Karte Befehle und zeigt den Grund an. Nicht verfügbare Steuerentitäten, fehlende Temperaturfunktionen oder erreichte Sollwertgrenzen können einzelne Bedienelemente ebenfalls sperren. Den Rohzustand des Online-Sensors und die Steuerung im normalen HA-Entitätsdialog vergleichen, bevor die Ursache einer bestimmten Komponente zugeordnet wird.

Die Karte zeigt die von der Integration gelieferten Energiesensoren an. Stehen sie bereits in HA auf `unavailable`, kann die Karte keine Energie daraus berechnen. Ein numerischer Wert von 0 wird als 0 angezeigt; daraus allein lässt sich nicht erkennen, ob Vaillant noch keine aktuellen Daten geliefert hat. Der Effizienzwert kann unabhängig davon vorhanden sein. Er ist der gemeldete Integrationswert, keine von der Karte selbst ermittelte momentane COP-Messung.

Fehlende oder stehengebliebene Energiewerte trotz funktionierender App sind im Integrationsprojekt [gemeldet](https://github.com/signalkraft/mypyllant-component/discussions/374). Die [Versionshinweise](https://github.com/signalkraft/mypyllant-component/releases) dokumentieren Verbesserungen am Energieimport in 0.9.17 und Statistik-Korrekturen in 0.9.18. Die eigene Integrationsversion und Protokollfehler prüfen; eine ältere Meldung beweist nicht dieselbe Ursache an der eigenen Anlage.

### Sprache

Ohne Angabe folgt die Oberfläche der Home-Assistant-Sprache. Deutsch und Englisch sind verfügbar; andere Sprachen fallen auf Englisch zurück. Alternativ im visuellen Editor oder per YAML festlegen:

```yaml
type: custom:vaillant-app-card
language: de
```

Code, Bezeichner und Kommentare sind auf Englisch; deutsche UI-Texte stehen in einem separaten Übersetzungswörterbuch.

### Eigene Beschriftung

```yaml
type: custom:vaillant-app-card
title: Heizung und Warmwasser
zone_name: Erdgeschoss
```

### Zone und Heizkreis festlegen

```yaml
type: custom:vaillant-app-card
zone: 1
circuit: 0
water: 0
```

Die Indizes sind Beispiele. Sie müssen zur eigenen Integration passen und stimmen nicht zwingend mit den sichtbaren Zonennummern überein. Die lokale Auswahl im YAML bleibt nach einem Neuladen erhalten; eine Auswahl über die Dropdowns gilt für die aktuelle Karteninstanz.

### Einzelne Entitäten ersetzen

```yaml
type: custom:vaillant-app-card
entities:
  room: sensor.example_room_temperature
  outdoor: sensor.example_outdoor_temperature
```

Lokale Zuordnungen unter `entities` haben Vorrang vor der automatischen Erkennung. `null` deaktiviert die betreffende Zuordnung; das zugehörige Anzeigeelement wird dadurch nicht automatisch ausgeblendet.

<details>
<summary>Alle Schlüssel für Entitätszuordnungen</summary>

| Bereich | Schlüssel |
| --- | --- |
| Steuerung | `climate`, `water_heater` |
| Raum und Außen | `room`, `humidity`, `outdoor` |
| Sollwerte und Betriebsart | `heating_target`, `heating_mode`, `water_target` |
| Vorlauf und Speicher | `flow`, `flow_target`, `system_flow`, `tank` |
| Anlagenstatus | `pressure`, `online`, `trouble`, `operating_state`, `circuit_state` |
| Schnellzugriff | `boost`, `ventilation`, `away` |
| Heizungseinstellungen | `heating_curve`, `veto_duration` |
| Kalender | `heating_calendar`, `water_calendar`, `circulation_calendar` |
| Elektrische Energie | `electric_heating`, `electric_water` |
| Umweltertrag | `environment_heating`, `environment_water` |
| Erzeugte Wärme | `heat_heating`, `heat_water` |
| Hydraulikstation | `hydraulic_electric`, `hydraulic_heat` |
| Momentane elektrische Leistung | `power` (optional; manuell gewählter Sensor) |
| Effizienz und Firmware | `efficiency`, `firmware`, `firmware_update` |

Die Werte sind die jeweiligen Entitäts-IDs aus der eigenen HA-Installation. Private Zuordnungen gehören ins lokale Dashboard-YAML, nicht in öffentliche Beispiele.

</details>

<details>
<summary>Vollständig manuelle Konfiguration</summary>

```yaml
type: custom:vaillant-app-card
auto_discover: false
entities:
  climate: climate.example_heating
  water_heater: water_heater.example_hot_water
```

Weitere Werte können mit den oben aufgeführten Schlüsseln ergänzt werden. Sämtliche Entitäts-IDs in diesen Beispielen sind erfunden.

</details>

## Automatische Zuordnung

Die Karte liest die Home-Assistant-Entitätsregistrierung und berücksichtigt die Plattform `mypyllant`. Allgemeine Integrationskennungen ordnen Heizung, Warmwasser und Sensoren zu; private IDs müssen nicht in den Quellcode eingetragen werden.

Für die Energiearten verwendet die Erkennung die ursprünglichen Namen der Integration. Umbenannte Entitäts-IDs und eigene Anzeigenamen bleiben davon unabhängig. Bei mehreren Energiegeräten erfolgt eine Auswahl; deren Messwerte werden nicht beliebig zusammengezählt.

Deaktivierte Entitäten können erkannt werden, liefern aber keine Zustände. Die Erkennung aktiviert sie nicht. Für fehlende Werte erscheint „—“ oder ein Hinweis; ohne aktive Steuerentität bleiben die zugehörigen Bedienelemente gesperrt.

Nach dem Hinzufügen oder Umbenennen einer Entität **Anlage → Entitäten neu suchen** verwenden. Zustandsänderungen kommen über die bestehende HA-Verbindung; die Karte fordert keine zusätzlichen Vaillant-Cloud-Aktualisierungen an.

## Bedienung und Grenzen

| Funktion | Verhalten |
| --- | --- |
| **Plus/Minus** | Direkt in Übersicht und Details verfügbar. Sendet eine echte Solltemperaturänderung. Grenzen und Schrittweite stammen aus der Entität; ohne Schrittweite gelten 0,5 °C für Heizung und 1 °C für Warmwasser. |
| **Betriebsart** | Bietet die von der Entität gemeldeten Modi an. `heat_cool` wird gemäß der myVAILLANT-Zuordnung als „Manuell“ bezeichnet. |
| **Quick Veto** | Im Zeitbetrieb kann eine Temperaturänderung nur vorübergehend gelten. Die Karte ändert die Dauer nicht automatisch. |
| **Heizkurve / weitere Einstellungen** | Öffnet die jeweiligen Home-Assistant-Entitätsdetails. |
| **Wochenplaner / Zirkulation** | Öffnet die Kalender-Entitätsdetails. Bearbeitung im HA-Kalender; dort wöchentliche Wiederholung wählen. Kein eigener Zeitplaneditor. |
| **Energie** | Zeigt aktuelle Sensorstände mit Umrechnung von Wh/kWh/MWh. Keine Monats- oder Jahresauswertung. Hydraulikstation separat. |

Ein erfolgreich gesendeter Befehl bestätigt noch nicht die Änderung an der Anlage. Die Karte wartet auf die Zustandsrückmeldung; bleibt die Temperaturbestätigung aus, zeigt sie nach 45 Sekunden wieder den gemeldeten Wert und einen Hinweis.

## Updates

**HACS:** Die Karte in HACS öffnen und eine angebotene Aktualisierung herunterladen. Falls nötig, die Repository-Informationen aktualisieren und **erneut herunterladen**. Danach das Frontend neu laden.

**Manuell:** Die JavaScript-Datei ersetzen und den Versionsparameter der Ressourcen-URL anpassen, damit der Browser die neue Datei lädt.

**Neu in 1.4.0:** Englische Quelltexte, deutsche und englische Oberfläche, Sprachauswahl im Editor und zweisprachige Dokumentation. Hinweise zur KI-Erstellung und zu Testgrenzen sind oben hervorgehoben.

**Neu in 1.3.1:** Home Assistant ist der Standardfarbstil. Das gilt auch im visuellen Editor. Für die bisherige Farbgebung ausdrücklich `color_scheme: vaillant` setzen.

**Neu in 1.3.0:** Fünf auswählbare Farbstile, HA-Theme-Farben, Glasoptik und visueller Editor für Beschriftung und Farben. Explizit gewählte Farbstile behalten Vorrang.

**Neu in 1.2.0:** Responsive Ansichten, direkte Sollwertsteuerung in der Übersicht, angepasste Navigation und Hell-/Dunkelmodus. Die bestehende Kartenkonfiguration bleibt gültig.

**Wechsel von 1.0.0 auf 1.1.0:** Die festen Installations-IDs entfallen. Die minimale Konfiguration aus dem Schnellstart genügt; bestehende lokale `entities`-Zuordnungen behalten Vorrang.

## Fehlerhilfe

| Problem | Prüfen / beheben |
| --- | --- |
| `Custom element doesn't exist: vaillant-app-card` | Ressource prüfen: richtige URL, Typ **JavaScript-Modul**, Datei erreichbar. Frontend neu laden, gegebenenfalls Browsercache leeren. |
| Keine Anlage gefunden | myVAILLANT-Integration eingerichtet und geladen? Plattform `mypyllant`? Bei mehreren Anlagen die Auswahl in der Karte beachten. |
| Automatische Zuordnung nicht möglich | **Entitäten neu suchen** verwenden. Kann die Sitzung die Registrierung nicht lesen, lokale Zuordnungen unter `entities` angeben. |
| Werte fehlen oder stehen auf „—“ | Unter **Einstellungen → Geräte & Dienste → Entitäten** nach myVAILLANT filtern, deaktivierte Entitäten einblenden und benötigte aktivieren. |
| Plus/Minus ausgegraut | Steuerentität aktiv und verfügbar? Unterstützt sie die Temperatursteuerung? Ist bereits der minimale/maximale Sollwert erreicht? Meldet die Anlage sich offline? |
| Alte Oberfläche nach einem Update | In HACS erneut herunterladen, Frontend neu laden und Browsercache prüfen. Doppelte Ressourcen entfernen. |
| Energieanzeige fehlt oder ist veraltet | Energieentitäten und deren Zustand direkt in HA prüfen. Mehrere Energiegeräte gegebenenfalls auswählen. Zeitraum und Aktualisierung hängen von der Integration ab. |
| Am Desktop erscheint die kompakte Ansicht | Die Karte hat weniger als 620 px Breite. Abschnitt verbreitern oder Panel-Ansicht verwenden. |
| Neuer Farbstil/Editor fehlt | Aktuelle Version in HACS erneut herunterladen und das Frontend neu laden; veraltete Ressourcen und Browsercache prüfen. |
| Glasoptik wirkt kaum transparent | `color_scheme: glass` gesetzt? Mit Dashboard-Hintergrund prüfen; ein Theme kann Tint/Blur überschreiben. Ohne Backdrop-Filter verwendet die Karte eine deckende Ersatzdarstellung. |
| Dropdown-Auswahl nach Neuladen weg | Gewünschte Anlage, Zone oder Gerätezuordnung im lokalen Karten-YAML festlegen. |

## Datenschutz

Die automatische Zuordnung erfolgt in der vorhandenen Home-Assistant-Sitzung im Browser. Die Karte hält die Zuordnung im Arbeitsspeicher, speichert sie nicht im lokalen Browserspeicher und übermittelt keine Anlagendaten an GitHub oder einen zusätzlichen Dienst. Das eigene Speicher- und Cloud-Verhalten von HA und myVAILLANT bleibt davon unberührt.

Der aktuelle Quellcode enthält keine persönlichen Entitäts-IDs, System-IDs, Seriennummern, Messwerte oder Zugangsdaten einer konkreten Installation. Die Vorschau und die Tests verwenden Beispieldaten. Frühere Commits können frühere Inhalte weiterhin enthalten.

## Entwicklung und Support

Für die Karte sind keine zusätzlichen Laufzeitbibliotheken erforderlich. Prüfungen mit Node.js:

```sh
node --test tests/discovery.test.cjs
node --check vaillant-app-card.js
```

Automatische Zuordnung, getrennte Sollwertbestätigungen, Serviceziele, Container-Layouts, Farbstile, visueller Editor und Browserdarstellung wurden mit simulierten Daten geprüft. Die Ansichten wurden bei 320, 390, 820 und 1400 px Fensterbreite sowie als schmale Karte in einem breiten Desktopfenster geprüft. Die Sprachprüfungen umfassen Auswahl, Fallback, Beschriftungen und den Erhalt eigener Namen. Widget- und Bedienmodus-Prüfungen decken gesperrte Befehle im Anzeigemodus, Admin-Erkennung, Benutzerwechsel, Bereichsregeln und Konfigurationserhalt im Editor ab. Diese begrenzten Prüfungen belegen keine Kompatibilität mit jeder HA-Version, jedem Browser, Theme oder Anlagentyp. Eine Prüfung an einer echten Anlage steht noch aus.

Fehler und Verbesserungsvorschläge können über [GitHub Issues](https://github.com/kafast/ha-vaillant-card/issues) gemeldet werden. Hilfreich sind HA-Version, Version der myVAILLANT-Integration, Kartenversion sowie die Schritte zur Reproduktion. Private IDs, Seriennummern, Zugangsdaten und persönliche Screenshots vorher entfernen bzw. unkenntlich machen.

### Verwendete Schnittstellen und Design

- [Home Assistant Custom Cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)
- [Home Assistant Entitätsregistrierung](https://github.com/home-assistant/core/blob/dev/homeassistant/components/config/entity_registry.py)
- [myVAILLANT-Integration](https://github.com/signalkraft/mypyllant-component)
- Gestaltung inspiriert von der myVAILLANT-App; keine offiziellen Vaillant-Bilddateien oder Logos enthalten.
