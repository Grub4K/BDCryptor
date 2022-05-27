import { FormSwitch, FormTextbox, FormTitle } from "../components";
import { PasswordModal } from "../modals";
import { State } from "../state";

export class SettingsForm extends BdApi.React.PureComponent {
  constructor(props) {
    super(props);

    this.activeRef = BdApi.React.createRef();
    this.incomingActiveRef = BdApi.React.createRef();
    this.outgoingActiveRef = BdApi.React.createRef();

    this.state = {
      password: props.password,
      active: !!props.active,
      incomingActive: !!props.incomingActive,
      outgoingActive: !!props.outgoingActive,
    };
  }

  onChange(changes) {
    this.setState(changes);
    this.props?.onChange?.(changes);
  }

  render() {
    return BdApi.React.createElement("div", null,
      FormSwitch.createNew({
        ref: this.activeRef,
        value: this.state.active,
        hideBorder: false,
        onChange: async (val) => {
          if (val) {
            try {
              const { masterPassword } = await PasswordModal.show();
              this.onChange({ masterPassword });
            } catch {
              this.activeRef.current.setState({value: false});
              val = false;
            }
          }
          this.outgoingActiveRef.current.setState({disabled: !val});
          this.incomingActiveRef.current.setState({disabled: !val});
          this.onChange({ active: val });
        },
        children: "Inject patches",
        note: "If this is disabled, all patches will be undone and the master password will be removed from cache and has to be entered again when reenabling.",
      }),
      FormSwitch.createNew({
        ref: this.incomingActiveRef,
        disabled: !this.state.active,
        value: this.state.incomingActive,
        onChange: (val) => this.onChange({ incomingActive: val }),
        children: "Decrypt incoming",
      }),
      FormSwitch.createNew({
        ref: this.outgoingActiveRef,
        disabled: !this.state.active,
        value: this.state.outgoingActive,
        hideBorder: false,
        onChange: (val) => this.onChange({ outgoingActive: val }),
        children: "Encrypt outgoing",
      }),
      FormTitle.createNew({title: `Channel password for ${State.channelId}`}),
      FormTextbox.createNew({
        type: "password",
        disabled: !this.state.active,
        value: this.state.password,
        placeholder: "Encryption Password",
        onChange: (val) => this.onChange({ password: val }),
      }),
    );
  }
}
