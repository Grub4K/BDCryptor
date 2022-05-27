# BDCryptor
A simple encryption plugin for BetterDiscord

## Installation and usage
Download the `BDCryptor.plugin.js` from the releases.

[BetterDiscord](https://betterdiscord.app/) is required for the plugin to work.
After installation the `BDCryptor.plugin.js` file needs to be placed in the plugins directory
(It can be found by selecting "Plugins" in the user settings,
then clicking "Open Plugins Folder").

After installation the plugin will have to be enabled.
There should now be a white button labeled `BDC` in the textbox.
Clicking it will open the settings dialog.

Each time the plugin is enabled and disabled (or Discord is restarted) the "Inject patches" switch will have to be flipped again, prompting for a master password.
The master password will be used to encrypt the channel passwords.

The two switches, "Decrypt incoming" and "Encrypt outgoing", are to decrypt incoming messages and encrypt outgoing messages, respectively.
Nothing will be de- or encrypted if no channel password is set.
It is safe to turn off both switches at any time.
The encrypted messages will be stored in the message cache and therefore persist as long as the cache is valid.

### Channel password
Only after enabling "Inject patches" *and* clicking save is the channel password editable.
The recipient will have to setup the plugin and set the same password to read encrypted messages.
If the master password is lost, the channel passwords cannot be restored.
It is however possible to read the encrypted messages by setting a new master password and entering the respective channel password again.

## Building
You will need nodejs with a package manager of your choice (in this case `npm`).

Running `npm install` and `npm run build` will produce a `dist/` directory hosting the `BDCryptor.plugin.js` file.

## Known issues
- These should be solved with a deeper injection point
    - Message editing sends the message unencrypted
    - Notifications are shown encrypted
    - Replies are shown encrypted

- Pings dont work since the parser fails to parse them out (?)
