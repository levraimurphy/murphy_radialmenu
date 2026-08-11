import React from 'react';
import styles from './Text.module.css';

/*
 Text atom
 - Full-width text line using Hapna-Regular
 - Props:
    text?: string (defaults to 'Text')
    size?: 'small' | 'medium' | 'large' | number (px)
    color?: string (css color)
*/
export default function Text({ text = 'Text', size = 'medium', color = '#ffffff', className = '', style = {} }) {
    const sizeClass = typeof size === 'string' ? (styles[size] || styles.medium) : null;
    const inlineStyle = typeof size === 'number' ? { fontSize: size + 'px', lineHeight: Math.round(size * 1.25) + 'px' } : {};
    return (
        <div className={`${styles.text} ${sizeClass || ''} ${className || ''}`} style={{ color, ...inlineStyle, ...style }}>
            {text}
        </div>
    );
}
