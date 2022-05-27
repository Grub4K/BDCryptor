import { SettingsForm } from "../forms";
import { State } from "../state";

/**
 * @typedef {{
 *  active: boolean?,
 *  incomingActive: boolean?,
 *  outgoingActive: boolean?,
 *  password: string?,
 *  masterPassword: string?,
 * }} SettingsModalState
 */

export class SettingsModal {
  /**
   * @param {string} key - The key for the current channel, decrypted.
   *
   * @returns {Promise<SettingsModalState>} The state of the settings modal.
   */
  static show(key) {
    let state = {
      active: null,
      incomingActive: null,
      outgoingActive: null,
      password: null,
      masterPassword: null,
    };

    return new Promise((resolve, reject) => {
      BdApi.showConfirmationModal(
        "Settings",
        BdApi.React.createElement(SettingsForm, {
          password: key,
          active: State.active,
          incomingActive: State.in,
          outgoingActive: State.out,
          onChange: val => Object.assign(state, val)
        }),
        {
          confirmText: "Save",
          onConfirm: () => resolve(state),
          onCancel: () => reject(),
        }
      );
    });
  }
}
