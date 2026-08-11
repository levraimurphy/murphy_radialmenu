/*
 * Image Component - Murphy's UI
 * Simple image display with customizable height
 */
import React from 'react';
import styles from './Image.module.css';

const Image = ({ src, alt = '', height = 120, className = '', isSelected = false, onClick, ...rest }) => {
    const classNames = [styles.image, className].filter(Boolean).join(' ');
    const heightPx = Number.isFinite(height) ? height : 120;
    // Strip internal/custom props that should not reach the DOM element
    const {
        refIds,
        filterByName,
        onClickActions,
        onClickMessage,
        activeId,
        setActiveId,
        setActiveValue,
        // Add other internal-only props here as needed
        ...safeRest
    } = rest;

    // Compute sensible defaults for loading/decoding while allowing overrides
    const loadingAttr = (safeRest && Object.prototype.hasOwnProperty.call(safeRest, 'loading')) ? safeRest.loading : 'lazy';
    const decodingAttr = (safeRest && Object.prototype.hasOwnProperty.call(safeRest, 'decoding')) ? safeRest.decoding : 'async';
    const fetchPriorityAttr = (() => {
        const fp = safeRest?.fetchPriority ?? safeRest?.fetchpriority;
        if (fp) return fp;
        // Prefer low priority when lazily loading
        return loadingAttr === 'lazy' ? 'low' : undefined;
    })();
    // Avoid passing duplicates of handled attributes in the spread
    const { loading: _ld, decoding: _dc, fetchpriority: _fp1, fetchPriority: _fp2, ...restToPass } = safeRest || {};

    const handleError = (e) => {
        try {
            const img = e?.currentTarget;
            if (!img) return;
            // Avoid infinite loop if fallback also fails
            if (img.dataset && img.dataset.fallbackApplied === '1') return;
            img.dataset.fallbackApplied = '1';
            // Build a robust relative URL to the public images folder
            let fb = 'images/no_pic.png';
            try {
                const base = (typeof document !== 'undefined' && document.baseURI) ? document.baseURI : (typeof window !== 'undefined' ? window.location?.href : '');
                if (base) fb = new URL('images/no_pic.png', base).href;
            } catch { /* keep relative */ }
            img.src = fb;
        } catch {
            /* noop */
        }
        // If a custom onError was provided, call it as well
        if (typeof safeRest.onError === 'function') {
            try { safeRest.onError(e); } catch { /* noop */ }
        }
    };

    return (
        <img
            className={`${classNames} ${isSelected ? styles.selected : ''}`.trim()}
            src={src}
            alt={alt}
            style={{ height: `${heightPx}px` }}
            onClick={onClick}
            onError={handleError}
            loading={loadingAttr}
            decoding={decodingAttr}
            {...(fetchPriorityAttr ? { ['fetchpriority']: fetchPriorityAttr } : {})}
            {...restToPass}
        />
    );
};

export default Image;
