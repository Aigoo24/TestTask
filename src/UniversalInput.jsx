import React, { Component } from "react";
import cn from "classnames";
import { Input, InputNumber, Select } from "antd";
import MaskedInput from "react-input-mask";

import { formatCharsInput } from "./maskFormat";
import maskIsValid from "./maskValidator";
import PropTypes from "prop-types";
import "./styles.css";

const { TextArea } = Input;
const { Option, OptGroup } = Select;

  class CodeEditor extends Component {
    constructor(props) {
      super(props);

      this.state = {
        value: props.value ?? ""
      };
    }

  componentDidUpdate(prevProps) {
    if (
      prevProps.value !== this.props.value &&
      this.props.value !== this.state.value
    ) {
      this.setState({
        value: this.props.value ?? ""
      });
    }
  }
  onChange = e => {
    const value = e.target.value;
    this.setState({ value });
    this.props.onChange && this.props.onChange(value);
  };

  onBlur = () => {
    this.props.onBlur && this.props.onBlur(this.state.value);
  };

  render() {
    const { className, style } = this.props;
    const { value } = this.state;

    return (
      <TextArea
        rows={this.props.rows ?? 4}
        ref={this.props.inputRef}
        value={value}
        onChange={this.onChange}
        onBlur={this.onBlur}
        className={className}
        style={style}
      />
    );
  }
}

CodeEditor.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  rows: PropTypes.number,
  allowTabs: PropTypes.bool,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.any
    })
  ])
};

class TextInputWithActions extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = { actionsWidth: 0, value: this.props.value, oldValue: "" };
  }

  recalcActionsWidth() {
    if (!this.actionsNode) {
      return;
    }

    const actionsWidth = this.actionsNode.clientWidth;
    if (actionsWidth !== this.state.actionsWidth) {
      this.setState({
        actionsWidth
      });
    }
  }

  setActionsNode = node => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.actionsNode = node;

    if (!node) {
      return;
    }

    this.recalcActionsWidth();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.recalcActionsWidth();
      });

      this.resizeObserver.observe(node);
    }
  };

  setFocus = () => {
    if (this.props.autoFocus) {
      this.input.current?.focus?.();
    }
  };

  componentDidMount() {
    this.setFocus();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.value !== this.props.value &&
      this.props.value !== this.state.value
    ) {
      this.setState({
        value: this.props.value
      });
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  onChange = e => {
    const value = e.target.value;
    this.setValue(value);
  };

  setValue = value => {
    this.setState({ value });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  onBlur = e => {
    if (this.props.readOnly) {
      return;
    }
    const value = e.target.value;
    this.setBlur(value);
  };

  onBlurSelect = () => {
    if (this.props.readOnly) {
      return;
    }

    this.setBlur(this.state.value);
  };

  onChangeNumber = value => {
    value = this.props.prepareNumber
      ? this.props.prepareNumber(value)
      : value;

    this.setValue(value);
  };

  onBlurNumber = e => {
    if (this.props.readOnly) {
      return;
    }
    let value = e.target.value;
    value = this.props.prepareNumber ? this.props.prepareNumber(value) : value;
    if (value || this.state.oldValue !== "") {
      this.setBlur(value);
    }
  };

  setBlur = value => {
    this.props.onChange && this.props.onChange(value);

    if (value !== this.state.oldValue) {
      this.props.onEndEditing && this.props.onEndEditing(value);
    }

    this.setState({
      value,
      oldValue: value
    });
  };


  onKeyDown = e => {
    this.props.onKeyDown && this.props.onKeyDown(e);

    if (!this.props.allowTabs) {
      return;
    }

    if (e.key === "Tab" && !e.shiftKey) {
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (typeof start !== "number" || typeof end !== "number") {
        return;
      }

      e.preventDefault();

      const value = target.value;
      const newValue =
        value.slice(0, start) +
        "\t" +
        value.slice(end);

      this.setValue(newValue);

      requestAnimationFrame(() => {
        target.selectionStart = start + 1;
        target.selectionEnd = start + 1;
      });
    }
  };

  onChangeMasked = e => {
    let { mask } = this.props;
    const value = e.target.value;

    if (value === mask.replace(/[^-]/g, "_")) {
      this.setValue("");
    } else {
      this.setValue(value);
    }
  };

  getPlaceHolderMask = mask => {
    const charsEditableMask = Object.keys(formatCharsInput).join("");
    let placeholder = "";
    let shielding = false;

    for (let i = 0; i < mask.length; i++) {
      if (shielding) {
        shielding = false;
        placeholder += mask[i];
        continue;
      }

      if (mask[i] == "\\") {
        shielding = true;
        continue;
      }

      if (charsEditableMask.includes(mask[i])) {
        placeholder += "_";
        continue;
      }

      placeholder += mask[i];
    }

    return placeholder;
  };

  renderSelectOption = o => {
    return (
      <Option value={o.value} label={o.label}>
        {o.label}
        {o.subLabel && (
          <span className="optionSubLabel">{o.subLabel}</span>
        )}
      </Option>
    );
  };

  render() {
    const {
      wrapperClassName,
      className,
      style,
      actionsClassName,
      actions,
      type,
      theme,
      multiline,
      script,
      minRows = 1,
      maxRows = 20,
      config,
      onEndEditing,
      allowTabs,
      subType,
      t,
      isAdditional,
      ...otherProps
    } = this.props;

    // Эти props нужны только внутри компонента и не должны попадать в DOM.
    void onEndEditing;
    void allowTabs;
    void t;
    void isAdditional;

    let { mask, options, ...props } = otherProps;

    mask = mask && maskIsValid(mask) ? mask : undefined;

    const value =
      this.props.value !== undefined
        ? this.props.value
        : this.state.value ?? "";

    const textInputContainer =
      type === "number" ? "" : "textInputContainer";

    const containerCN = cn(wrapperClassName, textInputContainer, {
      inputMas: !multiline && !!mask
    });
    let inputCN = cn(className, {
      inputReadOnly: this.props.readOnly,
      [theme]: !!theme,
      readOnly: this.props.readOnly
    });

    let actionsCN;

    const { actionsWidth } = this.state;
    let inputStyle = { ...(style || {}) };
    const actionsStyle = {};
    actionsCN = "inputWithActions";

    if (!actions || actions.length == 0) {
      actionsStyle.visibility = "hidden";
    } else if (actionsWidth) {
      inputStyle.paddingRight = actionsWidth;
    }

    let control;
    if (type === "number") {
      if (this.props.readOnly) {
        control = (
          <span className={inputCN}>
            {this.props.formatter
              ? this.props.formatter(value)
              : value}
          </span>
        );
      } else {
        control = (
          <InputNumber
            ref={this.input}
            onKeyDown={this.onKeyDown}
            className={inputCN}
            value={value}
            onChange={this.onChangeNumber}
            onBlur={this.onBlurNumber}
            style={style}
            {...props}
          />
        );
      }
    } 
    else if (mask) {
      control = (
        <MaskedInput
          formatChars={formatCharsInput}
          onKeyDown={this.onKeyDown}
          mask={mask}
          {...props}
          placeholder={this.getPlaceHolderMask(mask)}
          value={value}
          style={inputStyle}
          className={inputCN}
          onChange={this.onChangeMasked}
          onBlur={this.onBlur}
          disabled={this.props.readOnly}
        >
          {inputProps => <Input {...inputProps} ref={this.input} />}
        </MaskedInput>
      );
    } else if (script) {
      control = (
        <CodeEditor
          inputRef={this.input}
          {...props}
          value={value}
          style={inputStyle}
          className={inputCN}
          onChange={this.setValue}
          onBlur={this.setBlur}
          subType={subType}
          rows={config?.get?.("rows") ?? 4}
        />
      );
    } else if (options) {
      inputStyle = {...inputStyle,width: "100%"};
      const valueInOptions = options.some(o => {
        if (o.value === value) {
          return true;
        }

        if (
          Array.isArray(o.options) &&
          o.options.some(option => option.value === value)
        ) {
          return true;
        }

        return false;
      });
      if (!valueInOptions && value) {
        inputCN = cn(inputCN, "invalidValue");
      }

      control = (
        <Select
          ref={this.input}
          {...props}
          className={inputCN}
          style={inputStyle}
          value={value}
          onChange={this.setValue}
          onBlur={this.onBlurSelect}
          onInputKeyDown={this.onKeyDown}
          showSearch={true}
          bordered={false}
          showArrow={false}
          dropdownMatchSelectWidth={300}
          filterOption={(input, option) =>
            (option.label || "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {options.map(o => {
            if (Array.isArray(o.options)) {
              return (
                <OptGroup key={o.value} label={o.label}>
                  {o.options.map(o => {
                    return this.renderSelectOption(o);
                  })}
                </OptGroup>
              );
            } else {
              return this.renderSelectOption(o);
            }
          })}
        </Select>
      );
    } else if (multiline) {
      control = (
        <TextArea
          ref={this.input}
          {...props}
          value={value}
          spellCheck="false"
          rows={4}
          autoSize={{
            minRows: props.readOnly ? 1 : minRows,
            maxRows: maxRows
          }}
          className={cn(inputCN, "textArea")}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
      );
    } else if (this.props.children) {
      control = (
        <div style={inputStyle} className={cn("ant-input", inputCN)}>
          {this.props.children}
        </div>
      );
    } else {
      control = (
        <Input
          ref={this.input}
          {...props}
          config={config}
          value={value}
          style={inputStyle}
          className={inputCN}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
      );
    }
    return (
      <div className={containerCN}>
        {control}
        {(actions &&
          actions.length && (
            <ul
              className={cn(actionsClassName, actionsCN)}
              ref={this.setActionsNode}
              style={actionsStyle}
            >
              {actions.map((node, i) => (
                <li key={i}>{node}</li>
              ))}
            </ul>
          )) ||
          null}
      </div>
    );
  }
}

TextInputWithActions.propTypes = {
  value: PropTypes.any,
  wrapperClassName: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  actionsClassName: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.node),
  type: PropTypes.string,
  theme: PropTypes.string,
  multiline: PropTypes.bool,
  script: PropTypes.bool,
  minRows: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool
  ]),
  maxRows: PropTypes.number,
  config: PropTypes.shape({
    get: PropTypes.func
  }),
  onChange: PropTypes.func,
  onEndEditing: PropTypes.func,
  onKeyDown: PropTypes.func,
  allowTabs: PropTypes.bool,
  subType: PropTypes.string,
  t: PropTypes.any,
  isAdditional: PropTypes.bool,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  prepareNumber: PropTypes.func,
  formatter: PropTypes.func,
  mask: PropTypes.string,
  options: PropTypes.array,
  children: PropTypes.node
};

class UniversalInput extends Component {
  state = {
    shouldProcess: false
  };

  onChange = value => {
    this.props.onChange && this.props.onChange(value);
    this.props.eventable && this.setState({ shouldProcess: true });
  };

  onEndEditing = value => {
    this.props.onEndEditing && this.props.onEndEditing(value);
    this.setState({ shouldProcess: false });
  };

  render() {
    const {
      updateProcess,
      eventable,
      actions,
      onEndEditing,
      t,
      ...props
    } = this.props;

    // Не передаём служебные props дальше в TextInputWithActions.
    void eventable;
    void onEndEditing;
    void t;
    
    let { shouldProcess } = this.state;
    const inProcess = updateProcess && updateProcess.get("inProcess");

    const newActions = [...(actions || [])];
    if (shouldProcess || inProcess) {
      newActions.push(
        <span
          className={cn("actionIcon", {
            ["actionIconGray"]: inProcess
          })}
          title={inProcess ? "" : "ready to send"}
        >
        </span>
      );
    }
    return (
      <TextInputWithActions
        {...props}
        onEndEditing={this.onEndEditing}
        onChange={this.onChange}
        actions={newActions}
      />
    );
  }
}

UniversalInput.propTypes = {
  onChange: PropTypes.func,
  onEndEditing: PropTypes.func,
  eventable: PropTypes.bool,
  actions: PropTypes.arrayOf(PropTypes.node),
  updateProcess: PropTypes.shape({
    get: PropTypes.func
  }),
  t: PropTypes.any
};

export default UniversalInput
