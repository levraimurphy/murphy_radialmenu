import React from 'react';
import { icon as iconUrl } from '../../../utils/images';
import styles from './CenterHub.module.css';

// Center hub (over the dark panel drawn by RadialMenu), 3 states:
//  - hovering a slot: big icon + label below
//  - otherwise, if back is possible: the whole disc becomes a back button (game arrow)
//  - otherwise: server logo (customizable)
export default function CenterHub({ hoveredSlot, canGoBack, onBack, logoSrc, diameter }) {
  const showBack = canGoBack && !hoveredSlot;

  return (
    <div
      className={`${styles.hub} ${showBack ? styles.backMode : ''}`}
      style={{ width: diameter, height: diameter }}
      onClick={showBack ? onBack : undefined}
      role={showBack ? 'button' : undefined}
    >
      {hoveredSlot ? (
        <>
          {hoveredSlot.icon && <img className={styles.bigIcon} src={iconUrl(hoveredSlot.icon)} alt="" />}
          {hoveredSlot.label ? <div className={styles.label}>{hoveredSlot.label}</div> : null}
          {hoveredSlot.description ? <div className={styles.description}>{hoveredSlot.description}</div> : null}
        </>
      ) : showBack ? (
        <img className={styles.backIcon} src={iconUrl('_back')} alt="" />
      ) : (
        <img className={styles.logo} src={logoSrc} alt="" />
      )}
    </div>
  );
}
