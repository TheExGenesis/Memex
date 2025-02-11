import React, { PureComponent } from 'react'
import onClickOutside from 'react-onclickoutside'
import styled, { css } from 'styled-components'
import moment from 'moment'

import styles, { fonts } from 'src/dashboard-refactor/styles'
import colors from 'src/dashboard-refactor/colors'
import { RootState } from './types'
import { HoverBox } from 'src/common-ui/components/design-library/HoverBox'
import { SyncStatusIcon } from './sync-status-icon'
import Margin from 'src/dashboard-refactor/components/Margin'
import type { SyncStatusIconState } from '../types'
import { PrimaryAction } from 'src/common-ui/components/design-library/actions/PrimaryAction'

const StyledHoverBox = styled(HoverBox)`
    height: min-content;
    width: 230px;
    background-color: ${colors.white};
    flex-direction: column;
    box-shadow: ${styles.boxShadow.overlayElement};
`

const Separator = styled.div`
    border-bottom: 1px solid #ddd;
`

const Row = styled(Margin)`
    height: min-content;
    display: grid;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    grid-auto-flow: column;
    grid-gap: 10px;

    &:last-child {
        margin-bottom: 0px;
    }
`

const BottomRow = styled.div`
    padding: 5px 10px 5px 10px;
    display: flex;
    justify-content: center;
    cursor: pointer;
}
`

const RowContainer = styled.div`
    height: max-content;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 15px;
`

const Count = styled.span`
    font-weight: ${fonts.primary.weight.bold};
    padding-left: 5px;
`

const textStyles = `
    font-family: ${fonts.primary.name};
    color: ${colors.fonts.primary};
`

const TextBlock = styled.div<{
    bold: boolean
}>`
    height: 18px;
    ${textStyles}
    font-size: 12px;
    line-height: 15px;
    display: flex;
    align-items: center;

    ${(props) =>
        css`
            font-weight: ${props.bold
                ? fonts.primary.weight.bold
                : fonts.primary.weight.normal};
        `}
`

const HelpTextBlock = styled.span<{
    bold: boolean
}>`
    height: 18px;
    ${textStyles}
    font-size: 10px;
    line-height: 15px;
    display: flex;
    align-items: center;
    color: ${colors.midGrey};
    text-decoration: none;
`

const HelpTextBlockLink = styled.a<{
    bold: boolean
}>`
    height: 18px;
    ${textStyles}
    font-size: 10px;
    line-height: 15px;
    display: flex;
    align-items: center;
    color: ${colors.midGrey};
    padding-left: 5px;
`

const TextBlockSmall = styled.div`
    ${textStyles}
    font-weight: ${fonts.primary.weight.normal};
    color: ${(props) => props.theme.colors.darkgrey};
    font-size: 10px;
    line-height: 12px;
    text-align: left;
`

const TextContainer = styled.div`
    ${textStyles}
    flex-direction: column;
    display: flex;
    align-items: flex-start;
`

export const timeSinceNowToString = (date: Date | null): string => {
    if (date === null) {
        return 'Never'
    }

    const now = moment(new Date())
    const dt = moment(date)
    const seconds = now.diff(dt, 'seconds')
    const minutes = now.diff(dt, 'minutes')
    const hours = now.diff(dt, 'hours')
    const days = now.diff(dt, 'days')
    const years = now.diff(dt, 'years')

    if (seconds < 60) {
        return `${seconds} seconds ago`
    }
    if (minutes < 2) {
        return '1 min ago'
    }
    if (hours < 1) {
        return `${minutes} minutes ago`
    }
    if (hours < 2) {
        return `${hours} hours ago`
    }
    if (days < 1) {
        return `${hours} hours ago`
    }
    if (days < 2) {
        return 'One day ago'
    }
    if (days < 30) {
        return `${days} days ago`
    }
    if (years < 1) {
        return dt.format('MMM Do')
    }
    return dt.format('ll')
}

export interface SyncStatusMenuProps extends RootState {
    isLoggedIn: boolean
    isCloudEnabled: boolean
    outsideClickIgnoreClass?: string
    pendingLocalChangeCount: number
    pendingRemoteChangeCount: number
    onLoginClick: React.MouseEventHandler
    onMigrateClick: React.MouseEventHandler
    onClickOutside: React.MouseEventHandler
    syncStatusIconState: SyncStatusIconState
    onToggleDisplayState: React.MouseEventHandler
}

class SyncStatusMenu extends PureComponent<SyncStatusMenuProps> {
    handleClickOutside = this.props.onClickOutside

    private renderTitleText(): string {
        const { syncStatusIconState, lastSuccessfulSyncDate } = this.props
        if (syncStatusIconState === 'green' && lastSuccessfulSyncDate) {
            return 'Everything is synced'
        }

        if (!lastSuccessfulSyncDate && syncStatusIconState === 'green') {
            return 'Nothing to sync yet'
        }

        return 'Syncing changes...'
    }

    private renderLastSyncText(): string {
        const { syncStatusIconState, lastSuccessfulSyncDate } = this.props
        if (syncStatusIconState === 'green' && lastSuccessfulSyncDate) {
            console.log(lastSuccessfulSyncDate)
            return 'Last sync: ' + timeSinceNowToString(lastSuccessfulSyncDate)
        }
        if (!lastSuccessfulSyncDate && syncStatusIconState === 'green') {
            return 'Save your first page or annotation'
        }
        return 'in progress'
    }

    private renderStatus() {
        const {
            isLoggedIn,
            isCloudEnabled,
            onLoginClick,
            onMigrateClick,
            syncStatusIconState,
        } = this.props

        if (!isLoggedIn) {
            return (
                <RowContainer>
                    <Row>
                        <TextBlock bold>
                            You're not logged in and syncing
                        </TextBlock>
                        <PrimaryAction label="Login" onClick={onLoginClick} />
                    </Row>
                </RowContainer>
            )
        }

        if (!isCloudEnabled) {
            return (
                <RowContainer>
                    <Row>
                        <TextBlock bold>
                            You haven't migrated to Memex Cloud
                        </TextBlock>
                        <PrimaryAction
                            label="Migrate"
                            onClick={onMigrateClick}
                        />
                    </Row>
                </RowContainer>
            )
        }

        return (
            <RowContainer>
                <Row>
                    <SyncStatusIcon color={syncStatusIconState} />
                    <TextContainer>
                        <TextBlock bold>{this.renderTitleText()}</TextBlock>
                        <TextBlockSmall>
                            {this.renderLastSyncText()}
                        </TextBlockSmall>
                    </TextContainer>
                </Row>
            </RowContainer>
        )
    }

    render() {
        const {
            isDisplayed,
            pendingLocalChangeCount,
            pendingRemoteChangeCount,
        } = this.props

        if (!isDisplayed) {
            return null
        }

        return (
            <StyledHoverBox width="min-content" right="50px" top="45px">
                {this.renderStatus()}
                <Separator />
                <RowContainer>
                    <Row>
                        <Count>{pendingLocalChangeCount}</Count>
                        <TextBlock> pending local changes</TextBlock>
                    </Row>
                    <Row>
                        <Count>
                            {pendingRemoteChangeCount
                                ? pendingRemoteChangeCount
                                : 0}
                        </Count>
                        <TextBlock> pending remote changes</TextBlock>
                    </Row>
                </RowContainer>
                <Separator />
                <BottomRow>
                    <HelpTextBlock> Report sync problems:</HelpTextBlock>
                    <HelpTextBlockLink
                        target="_blank"
                        href="https://worldbrain.io/faq/new-sync"
                    >
                        {' '}
                        Forum
                    </HelpTextBlockLink>
                    <HelpTextBlockLink
                        target="_blank"
                        href="mailto:support@worldbrain.io"
                    >
                        {' '}
                        Email
                    </HelpTextBlockLink>
                </BottomRow>
            </StyledHoverBox>
        )
    }
}

export default onClickOutside(SyncStatusMenu)
