import React from 'react';
import CenterHub from '../../molecules/CenterHub';
import { computeWheel } from '../../../utils/radialGeometry';
import { icon as iconUrl, wheelTex, img } from '../../../utils/images';
import styles from './RadialMenu.module.css';

const SIZE = 400;
const C = SIZE / 2;
const RING_INNER = 116;  // visible inner edge (defined by the mask)
const RING_OUTER = 198;  // visible outer edge (defined by the mask)
const CLIP_INNER = 100;  // clip sectors OVERSHOOT the mask -> what we see are the (painted) edges of the mask
const CLIP_OUTER = 210;
const GAP = 2;           // angular spacing between tiles (thin)
const CENTER_RADIUS = 107;   // center disc slightly smaller than the hole (116) -> small gap with the tiles
const CENTER_DIAMETER = 196; // content area of the center hub
const RING_MASK = wheelTex('ring_mask.png');     // SOLID ring (no hole), irregular edges -> mask
const GRUNGE = wheelTex('ring_material.png');    // game grain (subtle overlay)
const SELECT = wheelTex('wheel_select_big.png'); // game highlight brush

// Adaptive radial wheel. menu = { menuId, title?, logo?, slots:[{ id, icon, label?, disabled?, children? }] }.
// SPACED tiles (gap): each tile = the masked game ring (no hole) clipped to its sector. N = slots.length (any N).
export default function RadialMenu({ menu, onSelect, onClose }) {
  const [stack, setStack] = React.useState([]);
  const [hovered, setHovered] = React.useState(null);

  React.useEffect(() => { setStack([]); setHovered(null); }, [menu?.menuId]);

  const current = stack.length ? stack[stack.length - 1] : menu;
  const slots = current?.slots || [];
  const path = stack.map((s) => s.fromId);

  const wheel = React.useMemo(
    () => computeWheel(slots.length, { size: SIZE, outerR: CLIP_OUTER, innerR: CLIP_INNER, gap: GAP }),
    [slots.length]
  );
  const iconSize = Math.min(56, Math.max(28, Math.round(360 / Math.max(slots.length, 1))));

  const handleSelect = (slot) => {
    if (slot.children?.length) {
      setStack((p) => [...p, { fromId: slot.id, title: slot.label, slots: slot.children }]);
      setHovered(null);
      return;
    }
    onSelect(slot.id, path, !!slot.stayOpen);
  };
  const goBack = () => { setStack((p) => p.slice(0, -1)); setHovered(null); };

  // Selection by cursor ANGLE (like an RDR wheel): the segment in the mouse direction.
  // Gaps between tiles snap to the nearest segment (round) -> no deselection / flash.
  // Only the center zone (radius < dead) shows the logo.
  const wheelRef = React.useRef(null);
  const handleMove = (e) => {
    const el = wheelRef.current;
    if (!el || slots.length === 0) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const scale = rect.width / SIZE || 1;
    const r = Math.hypot(dx, dy);
    if (r < 92 * scale) { setHovered(null); return; }
    const pie = 360 / slots.length;
    const a = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, -90 = up
    let idx = Math.round((a + 90) / pie) % slots.length;
    if (idx < 0) idx += slots.length;
    setHovered(idx);
  };
  const handleWheelClick = (e) => {
    e.stopPropagation();
    const s = hovered != null ? slots[hovered] : null;
    if (s && !s.disabled) handleSelect(s);
  };

  const hoveredSlot = hovered != null ? slots[hovered] : null;
  const cfgLogo = (typeof window !== 'undefined' && window.__RADIALMENU_CONFIG__?.logo) || 'logo.png';
  const logoSrc = img(menu?.logo || cfgLogo);

  // angles to repeat the hover brush along the arc of the hovered tile
  const hoverBrush = React.useMemo(() => {
    if (!hoveredSlot || hoveredSlot.disabled) return null;
    const g = wheel[hovered];
    const pie = 360 / Math.max(slots.length, 1);
    const K = Math.max(1, Math.ceil(pie / 22));
    const step = pie / K;
    const start = g.mid - pie / 2;
    return Array.from({ length: K }, (_, k) => start + step * (k + 0.5));
  }, [hovered, hoveredSlot, wheel, slots.length]);

  return (
    <div className={styles.backdrop} onClick={onClose} onMouseMove={handleMove}>
      <div
        ref={wheelRef}
        className={styles.wheel}
        style={{ width: SIZE, height: SIZE, cursor: hovered != null ? 'pointer' : 'default' }}
        onClick={handleWheelClick}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg}>
          <defs>
            <mask id="rm-ringmask" maskUnits="userSpaceOnUse" x="0" y="0" width={SIZE} height={SIZE}>
              <image href={RING_MASK} x="0" y="0" width={SIZE} height={SIZE} preserveAspectRatio="xMidYMid meet" />
            </mask>
            <filter id="rm-tint-red" x="-20%" y="-20%" width="140%" height="140%">
              <feColorMatrix type="matrix" values="0 0 0 0 0.784  0 0 0 0 0.008  0 0 0 0 0.008  0 0 0 3.6 0" />
            </filter>
            {slots.map((slot, i) => (
              <clipPath key={slot.id ?? i} id={`rm-w${i}`}><path d={wheel[i].path} /></clipPath>
            ))}
          </defs>

          {/* dark center (smaller than the hole -> gap with the tiles) */}
          <circle cx={C} cy={C} r={CENTER_RADIUS} className={styles.centerPanel} />

          {/* spaced tiles: solid (masked) ring clipped per sector with a gap */}
          {slots.map((slot, i) => (
            <g key={`tile-${slot.id ?? i}`} clipPath={`url(#rm-w${i})`} mask="url(#rm-ringmask)">
              <rect x="0" y="0" width={SIZE} height={SIZE} className={`${styles.tile} ${slot.disabled ? styles.tileDisabled : ''}`} />
              <image href={GRUNGE} x="0" y="0" width={SIZE} height={SIZE} className={styles.tileGrain} preserveAspectRatio="xMidYMid meet" />
            </g>
          ))}

          {/* hover: game red brush on the outer edge of the hovered tile (clip on the UN-rotated g, rotation on the image) */}
          {hoverBrush && (
            <g clipPath={`url(#rm-w${hovered})`} mask="url(#rm-ringmask)">
              {hoverBrush.map((ang, k) => (
                <image
                  key={k}
                  href={SELECT}
                  x={377} y={C - 70} width={28} height={140}
                  transform={`rotate(${ang} ${C} ${C})`}
                  filter="url(#rm-tint-red)"
                  className={styles.hlSelect}
                  preserveAspectRatio="none"
                />
              ))}
            </g>
          )}

          {/* icons */}
          {slots.map((slot, i) => (
            <g key={`ic-${slot.id ?? i}`} style={{ pointerEvents: 'none' }}>
              {slot.icon && (
                <image
                  href={iconUrl(slot.icon)}
                  x={wheel[i].iconCenter.x - iconSize / 2}
                  y={wheel[i].iconCenter.y - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  className={`${styles.icon} ${slot.disabled ? styles.iconDisabled : ''}`}
                  preserveAspectRatio="xMidYMid meet"
                />
              )}
              {slot.children?.length ? (
                <circle cx={wheel[i].iconCenter.x} cy={wheel[i].iconCenter.y + iconSize / 2 + 3} r={2.5} className={styles.subDot} />
              ) : null}
            </g>
          ))}

        </svg>
        <CenterHub
          hoveredSlot={hoveredSlot}
          canGoBack={stack.length > 0}
          onBack={goBack}
          logoSrc={logoSrc}
          diameter={CENTER_DIAMETER}
        />
      </div>
    </div>
  );
}
