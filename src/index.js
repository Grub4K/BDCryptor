import Aes from "crypto-js/aes";
import Hmac from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";

import { State } from "./state";
import { SettingsModal } from "./modals";

/**
 * The main class for the Encryption plugin.
 * It contains the entry- and exit-points.
 */
export class BDCryptor {
  /**
   * Create the state and the password button.
   * Also tries to add the button to document.
   */
  async start() {
    this.state = new State();
    this.masterPassword = null;

    this.button = document.createElement("button");
    this.button.innerText = "BDC";
    this.button.style.width = "2rem";
    this.button.addEventListener("click", () => this.handleButtonClick());

    this.tryAddButton(document);
  }

  /**
   * Undo all patched methods and immediately remove the button.
   */
  stop() {
    this.unpatchIn();
    this.unpatchOut();
    this.button?.remove();
  }

  /**
   * Unpatches all incoming methods.
   */
  unpatchIn() {
    console.log("[IN ] unpatched");
    BdApi.Patcher.unpatchAll("BDCryptor.In");
  }

  /**
   * Unpatches all outgoing methods.
   */
  unpatchOut() {
    console.log("[OUT] unpatched");
    BdApi.Patcher.unpatchAll("BDCryptor.Out");
  }

  /**
   * Patches all incoming methods.
   */
  patchIn() {
    console.log("[IN ] patched");
    this.patchInUsingMessageCache();
    // This is easier to work with to debug, so I left it in.
    // this.patchInUsingMessageParser();
  }

  /**
   * Patches all outgoing methods.
   */
  patchOut() {
    console.log("[OUT] patched");
    this.patchOutUsingMessageQueue();
  }

  /**
   * Handles the button press.
   * This spawns a settings modal and evaluates the settings after its been closed.
   */
  async handleButtonClick() {
    let result;
    try {
      result = await SettingsModal.show(this.getKey(State.channelId));
    } catch {
      return;
    }

    if (result.active !== null) {
      State.active = result.active;
      if (!result.active) {
        this.unpatchIn();
        this.unpatchOut();
      } else {
        this.masterPassword = result.masterPassword;

        if (result.incomingActive === null && State.in)
          this.patchIn();

        if (result.outgoingActive === null && State.out)
          this.patchOut();
      }
    }

    if (result.password !== null) {
      if (result.password === "") {
        State.saveData(State.channelId, null);
      } else if (this.masterPassword !== undefined) {
        const encodedPassword = this.encode(result.password, this.masterPassword);
        State.saveData(State.channelId, encodedPassword);
        console.log(`Stored password for ${State.channelId}: "${result.password}" => "${encodedPassword}"`);
      }
    }

    if (result.incomingActive !== null) {
      State.in = result.incomingActive;
      if (result.incomingActive) {
        if (State.active && !this.inUnpatchers.length)
          this.patchIn();
      } else {
        this.unpatchIn();
      }
    }

    if (result.outgoingActive !== null) {
      State.out = result.outgoingActive;
      if (result.outgoingActive) {
        if (State.active && result.outgoingActive && !this.inUnpatchers.length)
          this.patchOut();
      } else {
        this.unpatchOut();
      }
    }
  }

  /**
   * Patches all incoming messages to be replaced with the decoded version.
   * Only replaces if a valid key for the messages channel was found.
   */
  patchInUsingMessageCache() {
    const MessageCache = BdApi.findModuleByProps("getMessages", "getMessage");

    BdApi.Patcher.after("BDCryptor.In", MessageCache, "getMessages",
      (_this, _args, returnValue) => {
        if (!returnValue)
          return;

        const messages = returnValue._array;
        if (!messages.length)
          return;

        // I thought this would be `channelId`??
        const key = this.getKey(messages[0].channel_id);
        if (!key)
          return;

        for (let message of messages) {
          let decodedContent = this.decode(message.content, key);
          if (decodedContent)
            message.content = decodedContent;
        }
      }
    );
  }

  /**
   * Patches all messages currently getting parsed to be replaced with the decoded version.
   * Only replaces if a valid key for the messages channel was found.
   *
   * @deprecated Use `patchInUsingMessageCache()` instead.
   */
  patchInUsingMessageParser() {
    const MessageParser = BdApi.findModuleByProps("parse", "parseTopic");

    BdApi.Patcher.before("BDCryptor.In", MessageParser, "parse",
      (_this, args) => {
        const key = this.getKey(args[2].channelId);
        if (!key)
          return;

        const decodedContent = this.decode(args[0], key);
        if (!decodedContent)
          return;

        args[0] = decodedContent;
      }
    );
  }

  /**
   * Patches all outgoing messages to be replaced with the encoded version.
   * Only replaces if a valid key for the messages channel was found.
   */
  patchOutUsingMessageQueue() {
    const MessageQueue = BdApi.findModuleByProps("handleSend", "enqueue");

    BdApi.Patcher.before("BDCryptor.Out", MessageQueue, "handleSend",
      (_this, [message]) => {
        const key = this.getKey(message.channelId);
        if (!key)
          return;

        message.content = this.encode(message.content, key);
      });
  }

  /**
   * Gets the key from the vault.
   *
   * @param {string} channelId - The channels id to get the key for.
   *
   * @returns {string|null} The key for the specified channel or `null` if none was set.
   */
  getKey(channelId) {
    if (this.masterPassword === null)
      return null;

    const encryptedKey = State.loadData(channelId);
    if (!encryptedKey)
      return null;

    return this.decode(encryptedKey, this.masterPassword);
  }

  /**
   * Decodes a message with the specified key.
   *
   * @param {string} message - The message to decode.
   * @param {string} key - The key to decode the message with.
   *
   * @returns {string|null} The decoded message or `null` if decoding failed.
   */
  decode(message, key) {
    if (!message.includes("|"))
      return null;

    if (!message.startsWith("U2FsdGVkX1"))
      message = "U2FsdGVkX1" + message;

    const [data, hmac] = message.split("|", 2);
    if (Hmac(data, key).toString(Base64) !== hmac)
    {
      console.log("HMAC mismatch");
      return null;
    }

    const decrypted = Aes.decrypt(data, key);
    try {
      return decrypted.toString(Utf8);
    } catch {
      console.log(`Failed to convert message: ${data}\n${decrypted}`);
    }
    return null;
  }

  /**
   * Encodes a message with the specified key.
   *
   * @param {string} message - The message to encode.
   * @param {string} key - The key to encode the message with.
   *
   * @returns {string} The encoded message.
   */
  encode(message, key) {
    let encrypted = Aes.encrypt(message, key).toString();
    let hmac = Hmac(encrypted, key).toString(Base64);

    if (encrypted.startsWith("U2FsdGVkX1"))
      encrypted = encrypted.substring(10);

    return `${encrypted}|${hmac}`;
  }

  /**
   * Observes the DOM for changes and inserts the Password button if missing.
   *
   * @param {MutationRecord} changes - The changes that happened to the DOM.
   */
  observer(changes) {
    if (!changes.addedNodes)
      return;

    for (let node of changes.addedNodes) {
      if (!(node instanceof Element))
        continue;

      this.tryAddButton(node);
    }
  }

  // TODO: this fails for other text areas, should specify last.
  /**
   * Tries to find and insert the Button in the specified element or deeper.
   *
   * @param {{querySelector}} element - The element to start searching for valid insertion point.
   */
  tryAddButton(element) {
    element.querySelector("[class^=channelTextArea] [class^=buttons]")
      ?.prepend(this.button);
  }
}
