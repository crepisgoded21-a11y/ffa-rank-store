# RankShop

Spigot/Paper plugin (1.20+) that polls a JSON API for pending rank purchases
and applies them in-game: runs your permission-plugin commands, sets a
custom nickname/color for the CUSTOM rank, and notifies the player.

## Project structure

```
rankshop-plugin/
  pom.xml
  README.md
  src/main/java/net/effectsffa/rankshop/
    RankShopPlugin.java        main class: onEnable/onDisable, polling scheduler
    PendingPurchase.java       purchase data model (id, ign, rank, nickname, color)
    ApiClient.java             HTTP polling + ack against your backend
    PendingQueue.java          disk-persisted queue for players who never joined yet
    NicknameValidator.java     server-side nickname validation (length/chars/blacklist)
    ColorUtil.java             hex -> §x conversion, legacy '&' code translation
    PurchaseProcessor.java     applies a purchase: runs commands, messages, sound
    commands/RankShopCommand.java   /rankshop reload|recolor|rename
    commands/RankCommand.java       /rank — opens the rank store GUI
    gui/RankGui.java                builds the GUI inventory from config
    gui/RankGuiHolder.java          identifies our GUI's inventory instances
    listeners/PlayerJoinListener.java   applies queued purchases on join
    listeners/RankGuiListener.java      handles GUI clicks, sends purchase link
  src/main/resources/
    plugin.yml
    config.yml
```

## Build

Requires JDK 17+ and Maven.

```
cd rankshop-plugin
mvn package
```

The built jar is at `target/RankShop-1.0.0.jar`. Drop it into your Paper/Spigot
server's `plugins/` folder and restart (or `/reload` if you're comfortable
with that on your setup).

## Configure

Edit `plugins/RankShop/config.yml` after the first run:

- `api.pending-url` / `api.ack-url` — your backend endpoints (see the main
  repo's root for the website that submits purchases to `/api/purchase`;
  your backend is responsible for turning those into entries this plugin
  can poll — see "Backend" below).
- `api.api-key` — optional bearer token sent as `Authorization: Bearer <key>`.
- `ranks.<rank>.commands` — console commands run for that rank, `%player%`
  is substituted with the buyer's IGN.
- `ranks.<rank>.nickname-command` — only needed for ranks that grant a
  custom nickname/color (e.g. CUSTOM). `%player%`, `%nickname%`, `%color%`
  are substituted; `%color%` becomes a `§x§R§R§G§G§B§B` sequence from the
  purchase's hex color.
- `nickname.*` — server-side validation (length, allowed characters,
  blacklist substrings).

## Backend contract

The plugin expects:

- `GET api.pending-url` → JSON array of purchases waiting to be applied:
  ```json
  [
    {"id": "abc123", "ign": "Notch", "rank": "vip"},
    {"id": "def456", "ign": "Steve", "rank": "custom", "nickname": "ShadowWolf", "color": "#55FF55"}
  ]
  ```
- `POST api.ack-url` with `{"id": "abc123"}` → acknowledges a purchase so it
  isn't returned again on the next poll.

Your backend is whatever turns a website purchase (`POST /api/purchase`)
into rows this endpoint serves. See the root of this repo for the static
site that posts purchases, and ask your assistant/README there for backend
hosting suggestions.

## Admin commands

All require the `rankshop.admin` permission (defaults to op).

- `/rankshop reload` — reload config.yml without restarting the server.
- `/rankshop recolor <player> <hex> [nickname]` — re-applies the
  nickname-command with a new color. If `nickname` is omitted, the
  player's current name (stripped of color codes) is reused.
- `/rankshop rename <player> <nickname> [hex]` — re-applies the
  nickname-command with a new nickname (validated server-side). `hex`
  defaults to white if omitted.

## /rank GUI

`/rank` opens an inventory menu (configured under `gui:` in config.yml) showing
each rank as an item — material, display name and lore are all configurable
per rank. Minecraft can't process PayPal payments directly, so clicking an
item sends the player a clickable chat message linking to `gui.store-url`
(your rank store site) instead of charging them in-game. No permission is
required by default — anyone can browse with `/rank`.

## Notes

- Purchases for a player who has **never joined** the server are queued to
  `plugins/RankShop/queued-purchases.yml` and applied automatically the
  next time that player joins.
- If the player is online when a purchase is applied, they get a chat
  message and a sound (both configurable, sound can be disabled).
- Hex colors and legacy `&` color codes are both supported via `ColorUtil`.
