import { autoBindMethodsForReact } from 'class-autobind-decorator';
import { partition } from 'ramda';
import React, { PureComponent } from 'react';

import { AUTOBIND_CFG, isSyncMethod, REQUEST_METHODS, RequestMethod } from '../../../common/constants';
import { Dropdown } from '../base/dropdown/dropdown';
import { DropdownButton } from '../base/dropdown/dropdown-button';
import { DropdownDivider } from '../base/dropdown/dropdown-divider';
import { DropdownItem } from '../base/dropdown/dropdown-item';
import { showPrompt } from '../modals/index';
const LOCALSTORAGE_KEY = 'insomnia.httpMethods';

interface Props {
  onChange: Function;
  method: RequestMethod;
  right?: boolean;
  className?: string;
}

@autoBindMethodsForReact(AUTOBIND_CFG)
export class MethodDropdown extends PureComponent<Props> {
  _dropdown: Dropdown | null = null;

  _setDropdownRef(n: Dropdown) {
    this._dropdown = n;
  }

  _handleSetCustomMethod() {
    let recentMethods;

    try {
      const v = window.localStorage.getItem(LOCALSTORAGE_KEY);
      // @ts-expect-error -- TSCONVERSION don't try parse if no item found
      recentMethods = JSON.parse(v) || [];
    } catch (err) {
      recentMethods = [];
    }

    // Prompt user for the method
    showPrompt({
      defaultValue: this.props.method,
      title: 'HTTP Method',
      submitName: 'Done',
      upperCase: true,
      selectText: true,
      hint: 'Common examples are LINK, UNLINK, FIND, PURGE',
      label: 'Name',
      placeholder: 'CUSTOM',
      hints: recentMethods,
      onDeleteHint: method => {
        recentMethods = recentMethods.filter(m => m !== method);
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(recentMethods));
      },
      onComplete: method => {
        // Don't add empty methods
        if (!method) {
          return;
        }

        // Don't add base methods
        if (REQUEST_METHODS.map(({ method }) => method).includes(method as RequestMethod)) {
          return;
        }

        // Save method as recent
        recentMethods = recentMethods.filter(m => m !== method);
        recentMethods.unshift(method);
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(recentMethods));
        // Invoke callback
        this.props.onChange(method);
      },
    });
  }

  _handleChange(method) {
    this.props.onChange(method);
  }

  toggle() {
    this._dropdown?.toggle(true);
  }

  render() {
    const {
      method,
      right,
      onChange,
      ...extraProps
    } = this.props;
    const [syncMethods, asyncMethods] = partition(isSyncMethod, REQUEST_METHODS);

    return (
      <Dropdown ref={this._setDropdownRef} className="method-dropdown" right={right}>
        <DropdownButton {...extraProps}>
          <span className={`http-method-${method} method-${method}`}>{method}</span>{' '}
          <i className="fa fa-caret-down space-left" />
        </DropdownButton>
        {syncMethods.map(({ method }) => (
          <DropdownItem
            key={method}
            className={`http-method-${method}`}
            onClick={this._handleChange}
            value={method}
          >
            {method}
          </DropdownItem>
        ))}

        <DropdownDivider>Async</DropdownDivider>
        {asyncMethods.map(({ method }) => (
          <DropdownItem
            key={method}
            className={`method-${method}`}
            onClick={this._handleChange}
            value={method}
          >
            {method}
          </DropdownItem>
        ))}

        <DropdownDivider />
        <DropdownItem
          className="http-method-custom"
          onClick={this._handleSetCustomMethod}
          value={method}
        >
          Custom Method
        </DropdownItem>
      </Dropdown>
    );
  }
}
