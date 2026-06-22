export default function SelloSeleccionado({ seasonName }) {
  return (
    <div className="sello">
      <span className="sello-dot">●</span>
      <span className="sello-text">
        Seleccionado{seasonName ? ` · ${seasonName}` : ' por MANCHA'}
      </span>
    </div>
  );
}
