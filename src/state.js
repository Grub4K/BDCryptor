/**
 * The saved state for the settings.
 */
export class State {
  static _active = false;

  static get active() {
    return this._active;
  }

  static set active(val) {
    this._active = val;
  }

  static get in() {
    return this.loadData("in", false);
  }

  static set in(val) {
    this.saveData("in", val);
  }

  static get out() {
    return this.loadData("out", false);
  }

  static set out(val) {
    this.saveData("out", val);
  }

  static get channelId() {
    return BdApi.findModuleByProps("getLastSelectedChannelId")?.getChannelId() ?? null;
  }

  static saveData(key, value=null) {
    if (value === null)
      BdApi.deleteData("BDCryptor", key);
    else
      BdApi.saveData("BDCryptor", key, value);
  }

  static loadData(key, fallback=null) {
    let value = BdApi.loadData("BDCryptor", key);
    if (value === undefined) {
      this.saveData(key, fallback);
      return fallback;
    }
    return value;
  }
}
