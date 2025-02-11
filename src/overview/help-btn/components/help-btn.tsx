import React from 'react'
import { browser } from 'webextension-polyfill-ts'

import { HelpMenu, Props as HelpMenuProps } from './help-menu'
import { menuItems } from '../menu-items'
import { ClickAway } from 'src/util/click-away-wrapper'

const styles = require('./help-btn.css')

export interface Props extends HelpMenuProps {}

export interface State {
    isOpen: boolean
}

export class HelpBtn extends React.PureComponent<Props, State> {
    static defaultProps = {
        menuOptions: menuItems,
        extVersion: browser.runtime.getManifest().version,
    }

    state = { isOpen: false }

    private handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()

        this.setState((state) => ({ isOpen: !state.isOpen }))
    }

    private renderMenu() {
        if (!this.state.isOpen) {
            return null
        }

        return (
            <ClickAway
                onClickAway={() =>
                    this.setState((state) => ({ isOpen: !state.isOpen }))
                }
            >
                <HelpMenu {...this.props} />
            </ClickAway>
        )
    }

    render() {
        return (
            <div className={styles.footerBar}>
                {this.renderMenu()}
                <button onClick={this.handleClick} className={styles.btn} />
            </div>
        )
    }
}
