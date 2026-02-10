# GoatBot V2

## Overview
GoatBot V2 is a Facebook Messenger chatbot built with Node.js. It uses a personal Facebook account to operate as a bot with various commands and features.

- **Version**: 1.5.35
- **Author**: NTKhang (Modified by NeoKEX)
- **Runtime**: Node.js v20
- **Bot Name**: SHOUROV-BOT
- **Prefix**: /

## Project Architecture
- `index.js` - Main entry point
- `Shourov.js` - Bot login and initialization
- `bot/` - Core bot logic (login, handler)
- `scripts/cmds/` - Bot command scripts
- `scripts/events/` - Bot event handlers
- `database/` - Database controllers and models (SQLite)
- `languages/` - Localization files (cmds, events)
- `logger/` - Logging utilities
- `dashboard/` - Web dashboard (served on port 5000)

## Recent Changes
- 2026-02-10: Initial import to Replit environment
  - Installed all npm dependencies
  - Fixed directory naming issues (trailing spaces in folder names)
  - Server running successfully on port 5000
  - SQLite database connected, commands loading

## Workflow
- **GoatBot Server**: `npm start` - Runs the bot and web dashboard on port 5000

## Notes
- The bot requires Facebook cookies/appstate for login (configured in account files)
- Auto refresh cookie mode requires email/password in config.json
- Dashboard accessible via the web preview on port 5000
