export default function Splat({ width, height, top, bottom, left, right, color, rotate = 0, radius = 'r1', center = false }) {
  const style = { width, height, top, bottom, left, right };
  if (center) style.transform = 'translateY(-50%)';
  return (
    <div className="splat" style={style}>
      <div className={`splat-blob ${radius}`} style={{ background: `var(--${color})`, transform: `rotate(${rotate}deg)` }} />
      <div className="splat-core" />
    </div>
  );
}
