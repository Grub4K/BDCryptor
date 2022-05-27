import { Base } from "./base";

export class FormTitle extends Base {
  /**
   * @param {object} props - The props to pass to the underlying Component.
   * @param {string} props.title - The title of that section.
   */
  static createNew(props) {
    return BdApi.React.createElement(FormTitle, {
      children: props.title || "",
      onChange: () => {},
    });
  }

  getBaseComponent() {
    return BdApi.findModuleByDisplayName("FormTitle");
  }

  getStateFromChange() {
    return {};
  }
}
