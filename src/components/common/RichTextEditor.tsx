/**
 * RichTextEditor Component
 * Lightweight rich text editor for campaign notes
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder,
    maxLength = 10000,
}) => {
    const { t } = useLanguage();
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        if (editorRef.current && !isPreview) {
            editorRef.current.innerHTML = value;
        }
    }, [value, isPreview]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            if (content.length <= maxLength) {
                onChange(content);
            }
        }
    };

    const insertSection = () => {
        const sectionTitle = prompt(t('notes.sectionTitle') || 'Section Title:');
        if (sectionTitle && editorRef.current) {
            editorRef.current.innerHTML += `
                <div class="notes-section">
                    <h4 class="notes-section-title">${sectionTitle}</h4>
                    <div class="notes-section-content"></div>
                </div>
            `;
            onChange(editorRef.current.innerHTML);
        }
    };



    const formatButtons = [
        { cmd: 'bold', icon: '𝗕', label: 'Bold' },
        { cmd: 'italic', icon: '𝘐', label: 'Italic' },
        { cmd: 'underline', icon: '𝗨', label: 'Underline' },
        { cmd: 'strikeThrough', icon: '𝗫', label: 'Strikethrough' },
        { type: 'separator' },
        { cmd: 'insertUnorderedList', icon: '•', label: 'Bullet List' },
        { cmd: 'insertOrderedList', icon: '1.', label: 'Numbered List' },
        { type: 'separator' },
        { cmd: 'formatBlock', value: '<h3>', icon: 'H', label: 'Heading' },
        { cmd: 'formatBlock', value: '<p>', icon: 'P', label: 'Paragraph' },
    ];

    return (
        <div className="rich-text-editor">
            {/* Toolbar */}
            {!isPreview && (
                <div className="rte-toolbar">
                    {formatButtons.map((btn, index) => {
                        if (btn.type === 'separator') {
                            return <div key={index} className="rte-separator" />;
                        }

                        return (
                            <button
                                key={index}
                                className="rte-btn"
                                onClick={() => execCommand(btn.cmd!, btn.value)}
                                title={btn.label}
                            >
                                {btn.icon}
                            </button>
                        );
                    })}
                    <div className="rte-separator" />
                    <button
                        className="rte-btn"
                        onClick={insertSection}
                        title={t('notes.addSection') || 'Add Section'}
                    >
                        📑
                    </button>
                </div>
            )}

            {/* Editor/Preview Toggle */}
            <div className="rte-header">
                <div className="rte-mode-toggle">
                    <button
                        className={`mode-toggle-btn ${!isPreview ? 'active' : ''}`}
                        onClick={() => setIsPreview(false)}
                    >
                        {t('notes.edit') || 'Edit'}
                    </button>
                    <button
                        className={`mode-toggle-btn ${isPreview ? 'active' : ''}`}
                        onClick={() => setIsPreview(true)}
                    >
                        {t('notes.preview') || 'Preview'}
                    </button>
                </div>
                {value.length > 0 && (
                    <span className="rte-char-count">
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="rte-content-wrapper">
                {!isPreview ? (
                    <div
                        ref={editorRef}
                        contentEditable
                        className="rte-editor"
                        onInput={handleInput}
                        suppressContentEditableWarning
                        data-placeholder={placeholder || t('notes.startTyping') || 'Start typing...'}
                    />
                ) : (
                    <div
                        className="rte-preview"
                        dangerouslySetInnerHTML={{ __html: value }}
                    />
                )}
            </div>
        </div>
    );
};

export default RichTextEditor;
