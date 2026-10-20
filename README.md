# Vaillant App Card

Eine eigenständige Home-Assistant-Karte im Stil der dunklen myVAILLANT-App. Kein offizielles Vaillant-Produkt.

Version 1.1.0: automatische lokale Entitätszuordnung, ohne fest eingebaute IDs einer Installation.

## Funktionen

- Zuhause, Energie und Status in einer Karte
- Detailansichten für Heizung und Warmwasser mit Solltemperatur und Betriebsart
- Schnellzugriff auf Warmwasser-Boost, Stoßlüften und Abwesenheit
- Vorlauf, Wasserdruck, Störungsstatus und Firmware
- Energiesensoren mit Einheitenumrechnung; Hydraulikstation separat
- Automatische Erkennung anhand der myVAILLANT-Entitätsregistrierung
- Auswahl bei mehreren Anlagen, Heizzonen, Speichern oder Energiegeräten

## Installation über HACS

1. HACS öffnen → Menü → Benutzerdefinierte Repositories.
2. Die URL dieses GitHub-Repositorys eintragen und Typ **Dashboard** wählen.
3. Repository hinzufügen, **Vaillant App Card** suchen und herunterladen.
4. Frontend neu laden. Unter Einstellungen → Dashboards → Ressourcen prüfen, ob HACS die JavaScript-Modul-Ressource angelegt hat.
5. Falls sie fehlt, `/hacsfiles/ha-vaillant-card/vaillant-app-card.js` als JavaScript-Modul ergänzen.
6. Eine manuelle Dashboard-Karte hinzufügen:

```yaml
type: custom:vaillant-app-card
```

Optional können die Überschriften angepasst werden:

```yaml
type: custom:vaillant-app-card
title: Wärmepumpe
zone_name: Heizung
```

Bei Wechsel von manueller Installation den alten `/local/vaillant-app-card.js`-Ressourceneintrag entfernen. Beide Versionen nicht gleichzeitig laden.

### Update von Version 1.0.0

In HACS das Repository öffnen, gegebenenfalls die Informationen aktualisieren und die aktuelle Version herunterladen bzw. erneut herunterladen. Anschließend das Frontend neu laden, bei Bedarf mit geleertem Browsercache. Die minimale Kartenkonfiguration reicht aus. Vorhandene lokale `entities`-Zuordnungen haben weiterhin Vorrang.

## Automatische Zuordnung

Die Karte liest die Entitäts- und Geräteregistrierung über die vorhandene Home-Assistant-WebSocket-Verbindung. Berücksichtigt werden ausschließlich Entitäten mit der Integrationsplattform `mypyllant`. Es werden keine Vaillant-Zugangsdaten abgefragt.

Die üblichen Entitäten werden anhand ihrer technischen `unique_id` zugeordnet. Das funktioniert auch, wenn Entitäts-IDs oder Anzeigenamen in Home Assistant umbenannt wurden. Die ursprünglichen Namen der Integration dienen zur Zuordnung der Energiearten, da deren technische IDs nur undurchsichtige Indizes enthalten. Individuelle Anzeigenamen ersetzen diese ursprünglichen Namen nicht.

Ist genau eine passende Anlage bzw. aktive Zone vorhanden, wird sie automatisch ausgewählt. Bei mehreren passenden Anlagen oder Zonen muss eine Auswahl in der Karte getroffen werden. Es wird nicht einfach die erste verfügbare Steuerentität verwendet.

Der zugehörige Heizkreis wird aus der ursprünglichen Zuordnung der Integration bestimmt, sofern diese vorhanden ist. Bei mehreren Heizkreisen und fehlender Zuordnung erscheint eine Auswahl. Nummern in der Konfiguration sind die technischen Indizes der Integration, nicht zwingend die Nummern im Anzeigenamen.

Auswahlfelder können ausschließlich im **lokalen Dashboard-YAML** festgelegt werden:

```yaml
type: custom:vaillant-app-card
zone: 1
circuit: 0
water: 0
```

Die Werte sind Beispiele und müssen zur eigenen Anlage passen. Bei mehreren Systemen ist auch `system_id` möglich; bei mehreren Integrationskonten `config_entry_id`; bei mehreren Energiegeräten `energy_device_id`. Diese IDs gehören ausschließlich ins eigene Dashboard. Eine per Auswahlliste getroffene Auswahl gilt für die aktuelle Karteninstanz; nach erneutem Laden wird wieder automatisch zugeordnet. Für eine dauerhaft feste Auswahl die lokale YAML-Konfiguration verwenden.

Registrierungseinträge werden pro Home-Assistant-Verbindung gemeinsam zwischengespeichert. Zustände aktualisieren sich über Home Assistant; nach dem Umbenennen oder Hinzufügen von Entitäten kann unter **Status → Entitäten neu suchen** die Zuordnung erneuert werden. Die Karte führt dafür keine zusätzliche Vaillant-Cloud-Abfrage aus.

### Deaktivierte Entitäten

Automatische Erkennung aktiviert keine Entitäten. Registrierte, aber deaktivierte Entitäten können zugeordnet werden, liefern jedoch keine aktuellen Werte. Sie erscheinen als „—“ oder nicht verfügbar. Ohne aktive Steuerentität bleiben die zugehörigen Bedienelemente gesperrt.

Unter Einstellungen → Geräte & Dienste → Entitäten nach myVAILLANT filtern und benötigte Entitäten aktivieren. Für den Start werden eine `climate`-Entität für die Heizzone und eine `water_heater`-Entität benötigt. Zusätzliche Sensoren, Schalter, Kalender und Zahlenentitäten können nach Bedarf aktiviert werden.

## Manuelle Ausnahmen

Einzelne Zuordnungen können im lokalen Karten-YAML überschrieben werden. `null` schaltet eine Zuordnung aus. Die Schlüssel stehen in `ENTITY_KEYS` am Anfang der JavaScript-Datei.

```yaml
type: custom:vaillant-app-card
entities:
  room: sensor.example_room_temperature
  outdoor: sensor.example_outdoor_temperature
```

Falls die Registrierung nicht lesbar ist, erscheint ein Hinweis. Für eine vollständig manuelle Konfiguration kann die Erkennung abgeschaltet werden:

```yaml
type: custom:vaillant-app-card
auto_discover: false
entities:
  climate: climate.example_heating
  water_heater: water_heater.example_hot_water
```

Die IDs sind erfundene Beispiele. Es gibt keinen automatischen Fallback auf beliebige Sensoren außerhalb der myVAILLANT-Integration.

## Verhalten und Grenzen

Temperaturänderungen sind echte Befehle an die myVAILLANT-Integration. Im Zeitbetrieb kann eine Änderung als Quick Veto zeitlich begrenzt gelten. Unterstützte Betriebsarten und Temperaturgrenzen werden aus den Entitätsattributen gelesen. Eine per Dienstaufruf übermittelte Änderung gilt erst mit der Zustandsrückmeldung als bestätigt.

Wochenplaner und Zirkulation öffnen die HA-Entitätsdetails. Wochenpläne können im HA-Kalender bearbeitet werden; die Integration erwartet wiederkehrende Wochenpläne. Ein eigener Zeitplaneditor ist nicht enthalten.

Die Energieansicht zeigt aktuelle Sensorstände. Es gibt keine Monats-/Jahresauswertung. Mehrdeutige Energiegeräte werden nicht addiert. Die Hydraulikstation wird separat angezeigt. Bei einer bislang nicht unterstützten Integrationsversion können einzelne automatische Zuordnungen fehlen; lokale Overrides sind dafür vorgesehen.

## Datenschutz

Der aktuelle Quellcode enthält keine Entitäts-IDs, Anlagennamen, System-IDs, Seriennummern, Messwerte, Zugangsdaten oder Tokens einer konkreten Installation. Technische Namen und myVAILLANT-ID-Muster sind allgemeine Schnittstellenbezeichnungen.

Die Erkennung und die Darstellung erfolgen innerhalb der bestehenden Home-Assistant-Sitzung im Browser. Entitätsdaten werden im Arbeitsspeicher gehalten. Die Karte überträgt sie nicht an GitHub oder einen zusätzlichen Dienst und legt sie nicht im lokalen Browserspeicher ab. Home Assistant und die myVAILLANT-Integration behalten ihr eigenes Speicher- und Cloud-Verhalten.

Individuelle Konfigurationen, Diagnoseausgaben oder persönliche Screenshots nicht als Beispiele ins öffentliche Repository aufnehmen. Frühere Git-Commits können frühere Inhalte weiterhin enthalten; das Ersetzen einer Datei löscht die Historie nicht.

## Entwicklung und Prüfung

Keine zusätzlichen Laufzeitbibliotheken erforderlich. Tests mit Node.js:

```sh
node --test tests/discovery.test.cjs
node --check vaillant-app-card.js
```

Die automatischen Tests verwenden ausschließlich erfundene Daten. Sie prüfen Zuordnung, Mehrdeutigkeiten, deaktivierte Entitäten, Registerrechte, lokale Overrides und Serviceziele. Die Prüfung an einer echten Anlage steht noch aus.

## Quellen

- [Home Assistant Custom Cards](https://contributors.home-assistant.io/frontend/custom-ui/card/)
- [Home Assistant Entitätsregistrierung](https://github.com/home-assistant/core/blob/dev/homeassistant/components/config/entity_registry.py)
- [myVAILLANT-Integration](https://github.com/signalkraft/mypyllant-component)
