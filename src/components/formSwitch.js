import { Base } from "./base";

/**
 * @callback FormSwitchCallback
 * @param {boolean} value - The new value of the switch.
 *
 * @returns {void}
 */

export class FormSwitch extends Base {
  /**
   * @param {object} props - The props to pass to the underlying Component.
   * @param {boolean} props.value - If the switch is checked.
   * @param {FormSwitchCallback} props.onChange - The callback for changes on the switch.
   * @param {any} [props.children] - If the switch is checked.
   * @param {string} [props.note=""] - If the switch is checked.
   * @param {boolean} [props.hideBorder=true] - Hide the
   * @param {boolean} [props.disabled=false] - If the item should be disabled.
   * @param {import("react").RefObject} [props.ref] - A ref to the component.
   */
  static createNew(props) {
    const newProps = Object.assign({
      children: "",
      note: "",
      hideBorder: true,
      disabled: false,
    }, props);
    return BdApi.React.createElement(FormSwitch, newProps);
  }

  getBaseComponent() {
    return BdApi.findModuleByDisplayName("SwitchItem");
  }

  getStateFromChange(e) {
    return {value: e};
  }
}
