# Vaillant App Card

Eine eigenständige Home-Assistant-Karte im Stil der dunklen myVAILLANT-App. Kein offizielles Vaillant-Produkt.

## Funktionen

- Zuhause, Energie und Status in einer Karte
- Detailansichten für Heizung und Warmwasser
- Solltemperatur und gemeldete Betriebsarten ändern
- Schnellzugriff auf Warmwasser-Boost, Stoßlüften und Abwesenheit
- Vorlauf, Wasserdruck, Störungsstatus und Firmware anzeigen
- Energiesensoren mit Einheitenumrechnung und separater Anzeige der Hydraulikstation

## Installation über HACS

1. HACS öffnen → Menü → Benutzerdefinierte Repositories.
2. `https://github.com/kafast/ha-vaillant-card` eintragen und Typ **Dashboard** wählen.
3. Repository hinzufügen, Vaillant App Card suchen und herunterladen.
4. Frontend neu laden. Unter Einstellungen → Dashboards → Ressourcen prüfen, ob HACS die JavaScript-Modul-Ressource angelegt hat.
5. Falls sie fehlt, `/hacsfiles/ha-vaillant-card/vaillant-app-card.js` als JavaScript-Modul ergänzen.
6. Eine manuelle Dashboard-Karte hinzufügen:

```yaml
type: custom:vaillant-app-card
title: Haus
zone_name: Zone 1
```

Bei Wechsel von manueller Installation den alten `/local/vaillant-app-card.js`-Ressourceneintrag entfernen. Beide Versionen nicht gleichzeitig laden.

## Entitäten

Die Karte ist für die Entitäts-IDs von kafast vorkonfiguriert. Die vollständige Zuordnung steht unter `DEFAULTS` in der JavaScript-Datei. Andere Installationen können sämtliche IDs per YAML überschreiben:

```yaml
type: custom:vaillant-app-card
title: Zuhause
zone_name: Wohnzimmer
entities:
  climate: climate.meine_heizung
  water_heater: water_heater.mein_warmwasser
  outdoor: sensor.meine_aussentemperatur
  online: binary_sensor.meine_heizung_online
  trouble: binary_sensor.meine_heizung_storung
```

Die verwendeten Entitäten müssen in Home Assistant aktiviert sein. Registrierte, aber deaktivierte Entitäten reichen nicht. Fehlende Werte erscheinen als „—“; ohne aktive Steuerentität sind die zugehörigen Bedienelemente deaktiviert.

## Verhalten und Grenzen

Temperaturänderungen sind echte Befehle an die myVAILLANT-Integration. Im Zeitbetrieb kann eine Änderung als Quick Veto zeitlich begrenzt gelten. Die unterstützten Betriebsarten und Temperaturgrenzen werden aus den Entitätsattributen gelesen.

Wochenplaner und Zirkulation öffnen die HA-Entitätsdetails. Wochenpläne können im HA-Kalender bearbeitet werden; die Integration erwartet wiederkehrende Wochenpläne. Ein eigener Zeitplaneditor ist nicht enthalten.

Die Energieansicht zeigt die aktuellen Sensorstände der Integration. Es gibt keine Monats-/Jahresauswertung. Die Karte löst keine zusätzlichen Cloud-Abfragen aus.

Die Anlagendaten werden über die bestehende Home-Assistant-Sitzung gelesen. Es werden keine zusätzlichen Logins, JavaScript-Bibliotheken, Schriftarten oder externen Dienste benötigt.

## Versionen

Für Updates nach Änderungen an der Karte ein neues GitHub-Release anlegen, etwa `v1.0.1`. `vaillant-app-card.js`, `hacs.json` und diese README müssen direkt im Hauptverzeichnis liegen.

Version 1.0.0 wurde hinsichtlich JavaScript-Syntax, Browserdarstellung, mobiler Breite und Serviceaufrufen mit simulierten HA-Daten geprüft. Die Prüfung an einer echten Anlage steht noch aus.

## Quellen

- [Home Assistant Custom Cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)
- [myVAILLANT-Integration](https://github.com/signalkraft/mypyllant-component)
