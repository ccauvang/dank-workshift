# Dank Memer Work Help

A Discord helper bot that makes playing [**Dank Memer**](https://dankmemer.lol/) easier.

> [!CAUTION]
> This project is not affiliated with Dank Memer.

Supports both prefix and slash commands.

Each feature is opt-in per user.

## Invite the bot

Want to use the bot without hosting it yourself? Invite it to your server:

### Invite [**Dank Memer Work Help**](https://discord.com/oauth2/authorize?client_id=991659233940623420&permissions=274878295104&redirect_uri=https://tryitands.ee&response_type=code&scope=bot+applications.commands)

After inviting, run `d.help` or `/help` to get started.

The bot needs these permissions: View Channel, Send Messages, Send Messages in Threads, Embed Links, Attach Files, Add Reactions, Use External Emojis, Read Message History, and Manage Messages.

## Host it on your own server

Prefer a private copy? Host the bot yourself.

### Requirements

- Node.js (current LTS recommended)
- A Discord bot token
- Server Members and Message Content privileged intents enabled in the Developer Portal

### Setup

1. Clone and install:

   ```bash
   git clone https://github.com/ccauvang/dank-workshift.git
   cd dank-workshift
   npm install
   mkdir database
   ```

2. Create a `.env` file:

   ```env
   TOKEN=your_bot_token
   IDBOTDISCORD=dank_memer_bot_user_id
   PREFIX=d.
   LANGUAGE=en
   TEST_GUILD_ID=your_test_server_id
   ```

3. Start the bot:

   ```bash
   npm start
   ```

> [!NOTE]
> Slash commands are registered to `TEST_GUILD_ID` only. For global registration, edit `events/clientReady.js` and use the commented-out line.

## Languages

The bot currently supports **English** and **Vietnamese**. Server admins switch language with `d.setlanguage` or `/setlanguage`.

Want another language? You can add it to the project, or keep it for your own private copy. The steps are the same:

1. Copy `locales/en.json` to `locales/<code>.json` (for example `locales/fr.json`) and translate the values. Keep the keys and the `{placeholders}` unchanged.
2. Add the code to the `locales` array in `util/i18n.js`:

   ```js
   locales: ['vi', 'en', 'fr'],
   ```

3. Add the language option in `core/setting/setlanguage.js`, inside `languageOptions`:

   ```js
   {
       label: ie.__(`${this.category}.${this.name}.languageOptions.fr.label`),
       description: ie.__(`${this.category}.${this.name}.languageOptions.fr.description`),
       value: 'fr'
   }
   ```

4. Add the matching `label` and `description` under `setting.setlanguage.languageOptions.fr` in every locale file.

### Contribute a language

1. Fork the repo and make the changes above.
2. Open a pull request with your new `locales/<code>.json` and the small code edits.

### Private use

1. Host the bot yourself (see [Host it on your own server](#host-it-on-your-own-server)) and make the changes above.
2. Set your language as the default in `.env`:

   ```env
   LANGUAGE=fr
   ```

   Or pick it per server with `/setlanguage`.

## License

Licensed under the [GNU General Public License v3.0](LICENSE). You can use, modify, and share this project. If you share a copy or a modified version, you must keep it under GPL-3.0 and provide the source.

Earlier versions, before the `LICENSE` file was added, were released under the ISC license.

Author: [ccauvang](https://github.com/ccauvang).
