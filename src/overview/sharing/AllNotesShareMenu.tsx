import React from 'react'

import ShareAnnotationMenu from './components/ShareAnnotationMenu'
import { executeReactStateUITask } from 'src/util/ui-logic'
import { getPageShareUrl } from 'src/content-sharing/utils'
import type { ShareMenuCommonProps, ShareMenuCommonState } from './types'
import { runInBackground } from 'src/util/webextensionRPC'
import { getKeyName } from 'src/util/os-specific-key-names'

interface State extends ShareMenuCommonState {}

export interface Props extends ShareMenuCommonProps {
    normalizedPageUrl: string
}

export default class AllNotesShareMenu extends React.Component<Props, State> {
    static MOD_KEY = getKeyName({ key: 'mod' })
    static ALT_KEY = getKeyName({ key: 'alt' })
    static defaultProps: Partial<Props> = {
        contentSharingBG: runInBackground(),
        annotationsBG: runInBackground(),
    }

    private annotationUrls: string[]

    state: State = {
        link: '',
        loadState: 'pristine',
        shareState: 'pristine',
    }

    async componentDidMount() {
        const { annotationsBG, normalizedPageUrl } = this.props
        await executeReactStateUITask<State, 'loadState'>(
            this,
            'loadState',
            async () => {
                await this.setRemoteLink()

                const annotations = await annotationsBG.listAnnotationsByPageUrl(
                    { pageUrl: normalizedPageUrl },
                )
                this.annotationUrls = annotations.map((a) => a.url)
            },
        )
    }

    private handleLinkCopy = () => this.props.copyLink(this.state.link)

    private setRemoteLink = async () => {
        const remotePageInfoId = await this.props.contentSharingBG.ensureRemotePageId(
            this.props.normalizedPageUrl,
        )
        this.setState({ link: getPageShareUrl({ remotePageInfoId }) })
    }

    private shareAllAnnotations = async () => {
        try {
            await this.props.contentSharingBG.shareAnnotations({
                annotationUrls: this.annotationUrls,
                shareToLists: true,
            })
        } catch (err) {}

        this.props.postShareHook?.({
            isShared: true,
        })
    }

    private unshareAllAnnotations = async () => {
        try {
            await this.props.contentSharingBG.unshareAnnotations({
                annotationUrls: this.annotationUrls,
            })
        } catch (err) {}

        this.props.postShareHook?.({
            isShared: false,
        })
    }

    private handleSetShared = async () => {
        await executeReactStateUITask<State, 'shareState'>(
            this,
            'shareState',
            async () => {
                await this.shareAllAnnotations()
            },
        )
    }

    private handleSetPrivate = async () => {
        await executeReactStateUITask<State, 'shareState'>(
            this,
            'shareState',
            async () => {
                await this.unshareAllAnnotations()
            },
        )
    }

    render() {
        return (
            <ShareAnnotationMenu
                showLink
                link={this.state.link}
                onCopyLinkClick={this.handleLinkCopy}
                onClickOutside={this.props.closeShareMenu}
                linkTitleCopy="Link to page and shared notes"
                privacyOptionsTitleCopy="Set privacy for all notes on this page"
                isLoading={
                    this.state.shareState === 'running' ||
                    this.state.loadState === 'running'
                }
                privacyOptions={[
                    {
                        title: 'Shared',
                        shortcut: `shift+${AllNotesShareMenu.MOD_KEY}+enter`,
                        description: 'Shared in collections this page is in',
                        icon: 'shared',
                        onClick: this.handleSetShared,
                    },
                    {
                        title: 'Private',
                        shortcut: `${AllNotesShareMenu.MOD_KEY}+enter`,
                        description: 'Only locally available to you',
                        icon: 'person',
                        onClick: this.handleSetPrivate,
                    },
                ]}
                shortcutHandlerDict={{
                    'mod+shift+enter': this.handleSetShared,
                    'mod+enter': this.handleSetPrivate,
                }}
            />
        )
    }
}
