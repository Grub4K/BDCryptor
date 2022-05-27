import { FormTitle, FormTextbox } from "../components";

/**
 * @typedef {{
 *  masterPassword: string?,
 * }} PasswordModalState
 */

export class PasswordModal {
  /**
   * @returns {Promise<PasswordModalState>} The state of the password modal.
   */
  static show() {
    let masterPassword = null;

    return new Promise((resolve, reject) => {
      BdApi.showConfirmationModal(
        "Enter Master Password",
        BdApi.React.createElement("div", null,
          FormTitle.createNew({title: "Master password"}),
          FormTextbox.createNew({
            type: "password",
            value: "",
            placeholder: "Master Password",
            onChange: (val) => {
              masterPassword = val;
            },
          }),
        ),
        {
          confirmText: "Decrypt",
          onConfirm: () => {
            if (!masterPassword)
              reject();
            resolve({ masterPassword });
          },
          onCancel: () => reject(),
        }
      );
    }
    );
  }
}
