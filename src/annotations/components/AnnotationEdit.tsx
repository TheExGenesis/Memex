import * as React from 'react'
import styled from 'styled-components'

import { MarkdownPreviewAnnotationInsertMenu } from 'src/markdown-preview/markdown-preview-insert-menu'
import { FocusableComponent } from './types'
import { uninsertTab, insertTab } from 'src/common-ui/utils'
import { getKeyName } from 'src/util/os-specific-key-names'

export interface AnnotationEditEventProps {
    onEditConfirm: (shouldShare: boolean, isProtected?: boolean) => void
    onEditCancel: () => void
    onCommentChange: (comment: string) => void
}

export interface AnnotationEditGeneralProps {
    comment: string
}

export interface Props
    extends AnnotationEditEventProps,
        AnnotationEditGeneralProps {
    url: string
    rows: number
}

class AnnotationEdit extends React.Component<Props>
    implements FocusableComponent {
    static MOD_KEY = getKeyName({ key: 'mod' })
    private textAreaRef = React.createRef<HTMLTextAreaElement>()

    componentDidMount() {
        this.focusOnInputEnd()
    }

    focus() {
        this.textAreaRef.current.focus()
    }

    focusOnInputEnd() {
        const inputLen = this.props.comment.length
        this.textAreaRef.current.setSelectionRange(inputLen, inputLen)
        this.focus()
    }

    private handleInputKeyDown: React.KeyboardEventHandler = (e) => {
        e.stopPropagation()

        if (e.key === 'Enter' && e.shiftKey && e.metaKey) {
            return this.props.onEditConfirm(true, false)
        }

        if (e.key === 'Enter' && e.shiftKey && e.altKey) {
            return this.props.onEditConfirm(true, true)
        }

        if (e.key === 'Enter' && e.altKey) {
            return this.props.onEditConfirm(false, true)
        }

        if (e.key === 'Enter' && e.metaKey) {
            return this.props.onEditConfirm(false, false)
        }

        if (e.key === 'Escape') {
            this.props.onEditCancel()
            return
        }

        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault()
            insertTab({ el: this.textAreaRef.current })
        }

        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault()
            uninsertTab({ el: this.textAreaRef.current })
        }
    }

    render() {
        return (
            <>
                <MarkdownPreviewAnnotationInsertMenu
                    showPreviewBtnOnEmptyInput
                    customRef={this.textAreaRef}
                    onKeyDown={this.handleInputKeyDown}
                    value={this.props.comment}
                    updateInputValue={this.props.onCommentChange}
                    renderInput={(inputProps) => (
                        <StyledTextArea
                            {...inputProps}
                            value={this.props.comment}
                            placeholder={`Add private note. Save with ${AnnotationEdit.MOD_KEY}+enter (+shift to share)`}
                            onChange={(e) =>
                                this.props.onCommentChange(e.target.value)
                            }
                        />
                    )}
                />
            </>
        )
    }
}

export default AnnotationEdit

const StyledTextArea = styled.textarea`
    background-color: #fff;
    box-sizing: border-box;
    resize: vertical;
    font-weight: 400;
    font-size: 14px;
    color: #222;
    font-family: ${(props) => props.theme.fonts.primary};
    border-radius: 3px;
    border: none;
    padding: 10px 7px;

    &::placeholder {
        color: ${(props) => props.theme.colors.primary};
        opacity: 0.5;
    }

    &:focus {
        outline: none;
        box-shadow: none;
        border: none;
    }

    min-height: 300px;
`
