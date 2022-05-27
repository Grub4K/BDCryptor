import { Base } from "./base";

/**
 * @callback FormTextboxCallback
 * @param {string} value - The new value of the switch.
 *
 * @returns {void}
 */

export class FormTextbox extends Base {
  /**
   * @param {object} props - The properties for the textbox object.
   * @param {string} props.value - The value inside of the textbox.
   * @param {FormTextboxCallback} props.onChange - The callback for changes in the textbox.
   * @param {string} [props.placeholder=""] - The placeholder value inside of the textbox.
   * @param {boolean} [props.disabled=false] - If true, the item will be disabled.
   * @param {"text"|"password"} [props.type="text"] - The type of the textbox.
   * @param {boolean} [props.spellCheck=false] - If true, spellcheck is enabled.
   * @param {boolean} [props.autoComplete=false] - If true, auto complete is enabled.
   * @param {boolean} [props.autoCorrect=false] - If true, auto correct is enabled.
   * @param {boolean} [props.autoCapitalize=false] - If true, auto capitalize is enabled.
   * @param {import("react").RefObject} [props.ref] - A ref to the component.
   */
  static createNew(props) {
    const newProps = Object.assign({
      placeholder: "",
      disabled: false,
      type: "text",
      spellCheck: false,
      autoComplete: false,
      autoCorrect: false,
      autoCapitalize: false,
    }, props);
    return BdApi.React.createElement(FormTextbox, newProps);
  }

  getBaseComponent() {
    return BdApi.findModule(m => m?.defaultProps?.type === "text");
  }

  getStateFromChange(e) {
    return {value: e};
  }
}
