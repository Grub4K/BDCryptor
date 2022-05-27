// Man, I really hate react

// TODO: Accept `ref` as param
export class Base extends BdApi.React.PureComponent {
  constructor(props) {
    super(props);

    this.state = Object.assign({}, props);
    delete this.state.onChange;
  }

  /**
   * Gets the base React Component to inherit from.
   * @abstract
   *
   * @return {Object}
   */
  getBaseComponent() {
    throw new Error("Must be implemented in a Subtype");
  }

  /**
   * Generates the state from the change that happened.
   * @abstract
   *
   * @param {object} value - The updated value.
   */
  getStateFromChange(value) {
    value;
    throw new Error("Must be implemented in a Subtype");
  }

  render() {
    const props = Object.assign({}, this.props, this.state, {
      onChange: (e) => {
        this.setState(this.getStateFromChange(e));
        this.props.onChange?.(e, this);
      }
    });
    return BdApi.React.createElement(this.getBaseComponent(), props);
  }
}
