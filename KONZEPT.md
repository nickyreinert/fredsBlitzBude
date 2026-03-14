# Spielkonzept

## Freds Gemüse-Laden“

## 1. Überblick

„Freds Gemüse-Laden“ ist ein einfaches Aufbau- und Wirtschaftsspiel für Kinder.
Der Spieler beginnt sehr klein: mit einer einzelnen Gurke aus Omas Garten und einem kleinen Holzstand an der Straße.

Durch Verkaufen, korrektes Wechselgeld geben und kluges Investieren wächst daraus Schritt für Schritt:

* ein größerer Marktstand
* ein kleiner Laden
* ein großer Supermarkt
* später ein ganzes Einkaufszentrum

Das Spiel verbindet drei Lern- und Spielmechaniken:

1. Rechnen lernen (Wechselgeld)
2. Wirtschaft verstehen (Einkaufen und Verkaufen)
3. Kreatives Spielen (selbst gemalte Produkte)

Das Spiel beginnt bewusst sehr einfach und wird erst später komplexer.

---

# 2. Plattform / Architektur (High Level)

## Zielplattform

Primär: Webbrowser (PC, Mac, Tablet)

- PWA (Progressive Web App) für einfache Installation auf Mobilgeräten

## Technischer Ansatz

Vanilla JavaScript mit HTML5 Canvas für die Grafik. CSS für die Benutzeroberfläche.

Das Spiel läuft auf einem Server, aber die Spielstände werden lokal im Browser gespeichert (LocalStorage).

## Assets:

* selbst gemalte Bilder (Gemüse, Obst, Produkte)
* als PNG im Spiel integriert

---

# 3. Spielstart (Story)

Das Spiel beginnt bei **Oma im Garten**.

Oma sagt sinngemäß:

Hier, nimm diese Gurke aus meinem Garten und versuch sie doch draußen zu verkaufen.

Der Spieler bekommt:

* 1 Gurke
* einen kleinen Holzstand
* einen Platz an der Straße

Damit beginnt das Spiel.

---

# 4. Spielphasen

Das Spiel entwickelt sich in mehreren Phasen.

---

# Phase 1 – Straßenstand

Startausstattung:

* Holzstand
* sehr wenig Ware (1 Gurke)
* Preis muss bestimmt werden
* wenige Kunden

Beispiel Sortiment, muss erst erweitert werden - alles was in Omas Garten wachsen kann:

* Gurken
* Äpfel
* Bananen

Der Spieler:

1. bekommt Ware (zuerst von Oma)
2. legt einen Preis fest
3. wartet auf Kunden
4. kassiert Geld
5. gibt Wechselgeld zurück

Beispiel:

Preis der Gurke
2,99 €

Kunde gibt
5 €

Spieler muss berechnen:

2,01 € Wechselgeld

Das ist der zentrale Lernmechanismus des Spiels.

---

# Phase 2 – Einkauf im Großmarkt

Das was Oma liefert ist stark begrenzt, nur ein paar Gurken und so weiter. Der Spieler kann also entscheiden, ob er genug Geld hat um im Großmarkt einzukaufen, weil Oma nicht mehr alles liefern kann.

Neuer Bildschirm anstatt Omas Garten: der Großmarkt.

## Großmarkt

Dort kann der Spieler Ware einkaufen.

Beispiel Einkaufspreise:

| Produkt | Einkaufspreis |
| ------- | ------------- |
| Gurke   | 0,80 €        |
| Apfel   | 0,60 €        |
| Banane  | 0,50 €        |

Der Spieler entscheidet:

* wie viel er einkauft
* welchen Verkaufspreis er später nimmt

---

# Phase 3 – Kleiner Laden

Der Holzstand ist sehr klein und hat nur wenig Platz.

Wenn genug Geld verdient wurde, ersetzt ein kleiner Laden den Holzstand. Der Spieler muss daran denken, regelmäßig Miete zu zahlen.


Sobald ein Laden existiert, fallen Kosten an.

Beispiel:

Miete pro Tag: 20 €

Der Spieler muss also genügend Umsatz machen.



Neue Funktionen:

* Regale
* mehr Produkte
* mehr Kunden

Neue Produkte:

* Tomaten
* Orangen
* Kartoffeln
* Karotten

---

# Phase 4 – Laden erweitern

Der Spieler kann:

* mehr Fläche mieten
* mehr Regale kaufen
* mehr Produkte verkaufen

Beispiele für Upgrades:

| Upgrade       | Effekt                |
| ------------- | --------------------- |
| Neue Regale   | mehr Produkte         |
| Kühlschrank   | neue Produktarten     |
| Dekoration    | mehr Kunden           |
| bessere Kasse | schnelleres Kassieren |

---


# Phase 6 – Laden kaufen

Wenn genug Geld verdient wurde, kann der Spieler den Laden komplett kaufen.

Vorteil:

Keine Miete mehr.

Dadurch steigt der Gewinn.

---

# Phase 7 – Laden vergrößern

Der Laden kann immer größer werden. Entweder Fläche kaufen oder mieten. 

Neue Bereiche entstehen:

* Obstabteilung
* Gemüseabteilung
* Kühlabteilung
* mehrere Kassen
* Lagerraum

---

# Phase 8 – Eigener Garten

Später bekommt der Spieler einen eigenen Garten.

Dort kann er selbst Gemüse anbauen.

Beispiele:

| Pflanze  | Wachstumszeit |
| -------- | ------------- |
| Karotten | kurz          |
| Tomaten  | mittel        |
| Kürbis   | lang          |

Die Ernte kann im Laden verkauft werden.

Vorteil:

Keine Einkaufskosten.

---

# Phase 9 – Eigenes Einkaufszentrum

In späteren Leveln baut der Spieler ein kleines Einkaufszentrum.

Neue Geschäfte können entstehen:

* Spielzeugladen
* Bäckerei
* Eisdiele

Diese generieren zusätzliches Einkommen.

---

# 5. Produkte

Am Anfang gibt es nur wenige Produkte.

Später wächst das Sortiment stark.

## Obst

* Apfel
* Banane
* Orange
* Traube
* Erdbeere

## Gemüse

* Gurke
* Tomate
* Karotte
* Kartoffel
* Kürbis

Alle Produkte können durch **selbst gemalte Bilder** dargestellt werden.

Die Zeichnungen werden:

* fotografiert
* digitalisiert
* im Spiel verwendet

---

# 6. Kunden

Kunden erscheinen zufällig.

Unterschiedliche Kundentypen:

| Kunde           | Verhalten                 |
| --------------- | ------------------------- |
| normaler Kunde  | kauft ein Produkt         |
| Familie         | kauft mehrere Produkte    |
| schneller Kunde | wenig Geduld              |
| reicher Kunde   | zahlt mit großen Scheinen, kommt selten |


# 6b - Zeitlicher Verlauf

Es gibt einen einfachen Tag- und Nachtwechsel. Kunden kommen nur tagsüber. Damit ist das Spiel auch zeitlich begrenz und man muss etwas warten auf den nächsten Tag. 

Das wird auch visuell dargestellt durch den Wechsel von Tag- und Nacht-Hintergrund. Die Sonne bewegt sich über den Himmel, bis sie untergeht. Dann kommen keine Kunden mehr, der Sternenhimmel ist zu sehen. Am nächsten Tag geht die Sonne wieder auf und die Kunden kommen zurück.

---

# 7. Wechselgeld-Mechanik

Kunden geben zufällige Geldbeträge:

* 2 €
* 5 €
* 10 €
* 20 €

Der Spieler berechnet das Wechselgeld.

Beispiel:

Preis
3,40 €

Kunde gibt
10 €

Richtiges Wechselgeld
6,60 €

---

# 8. Levelsystem

Das Spiel enthält etwa 100 Level.

Beispiele:

| Level | Neuer Inhalt      |
| ----- | ----------------- |
| 1     | Straßenstand      |
| 5     | neue Produkte     |
| 10    | Großmarkt         |
| 20    | kleiner Laden     |
| 30    | Kühlschrank       |
| 50    | Garten            |
| 70    | großer Supermarkt |
| 100   | Einkaufszentrum   |

---

# 9. Verwendung von Geld

Der Spieler kann Geld ausgeben für:

* neue Ware
* Laden-Upgrades
* größere Fläche
* Garten
* persönliche Belohnungen

Beispiele für Belohnungen:

* Lego
* Fußball
* Fahrrad

Diese haben keine große Spielwirkung, dienen als Motivation.

---

# 10. Spielziele

Kleine Ziele:

* genug Geld verdienen
* Laden erweitern
* neue Produkte freischalten

Große Ziele:

* Laden kaufen
* Garten besitzen
* Supermarkt bauen
* Einkaufszentrum besitzen

---

# 11. Spielstil

Das Spiel soll sein:

* freundlich
* bunt
* humorvoll

Grafikstil:

* Kinderzeichnungen
* einfache Figuren
* große Buttons

Damit ein siebenjähriges Kind es problemlos spielen kann.

---

# 12. Zusammenfassung

Spielstart:

1 Gurke
1 Holzstand
Omas **Garten**

Spielende:

großer Supermarkt
eigenes Einkaufszentrum
viele Geschäfte

Der Kern des Spiels bleibt immer gleich:

Einkaufen
Verkaufen
Wechselgeld berechnen
Laden wachsen lassen
