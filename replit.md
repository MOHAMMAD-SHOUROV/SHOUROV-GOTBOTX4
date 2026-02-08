# GoatBot V2

## Overview
GoatBot V2 is a Facebook Messenger chatbot built with Node.js. It uses a personal Facebook account to operate as a chat bot with various commands and features. Originally created by NTKhang, modified by Alihsan Shourov.

## Current State
- Project is imported and running
- Node.js 20 runtime
- Dependencies installed via npm

## Project Architecture
- **Entry point**: `index.js` - spawns `Shourov.js` as child process with auto-restart on exit code 2
- **Main bot logic**: `Shourov.js` - core bot initialization, Facebook login, command loading
- **Bot commands**: `scripts/cmds/` - individual command files
- **Bot events**: `scripts/events/` - event handler files
- **Dashboard**: `dashboard/` - web dashboard for bot management
- **Languages**: `languages/` - i18n language files
- **Logger**: `logger/` - logging utilities
- **Utils**: `utils.js` - utility functions
- **Config**: `configCommands.json`, `fca-config.json` - bot configuration

## Key Dependencies
- `fca-neokex` - Facebook Chat API
- `express` - Web server for dashboard
- `mongoose` - MongoDB driver
- `sqlite3` / `sequelize` - SQLite database
- `canvas` - Image generation
- `axios` - HTTP requests
- `socket.io` - WebSocket support

## Workflows
- **GoatBot Server**: `npm start` - Runs the bot (console output)

## Recent Changes
- 2026-02-08: Completed import migration - all packages installed, workflow configured and verified running
- 2026-02-07: Initial import to Replit environment, installed system dependencies (cairo, pango, etc.) for canvas support
