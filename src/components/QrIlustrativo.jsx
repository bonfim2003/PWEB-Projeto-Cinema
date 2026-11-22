function hash(codigo) {
  let h = 2166136261;
  for (let i = 0; i < codigo.length; i++) {
    h ^= codigo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomSequence(seed, count) {
  let state = seed || 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out.push(state / 4294967296);
  }
  return out;
}

const SIZE = 21;
const CELL = 8;

export default function QrIlustrativo({ codigo, className = "" }) {
  const seed = hash(codigo || "afterglow");
  const rand = randomSequence(seed, SIZE * SIZE);
  const isFinder = (x, y) =>
    (x < 7 && y < 7) || (x > SIZE - 8 && y < 7) || (x < 7 && y > SIZE - 8);

  const cells = [];
  let r = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (isFinder(x, y)) continue;
      if (rand[r++] > 0.52) {
        cells.push(<rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} />);
      }
    }
  }

  const finder = (x, y) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x * CELL} y={y * CELL} width={CELL * 7} height={CELL * 7} />
      <rect
        x={(x + 1) * CELL}
        y={(y + 1) * CELL}
        width={CELL * 5}
        height={CELL * 5}
        fill="#F3EBDD"
      />
      <rect
        x={(x + 2) * CELL}
        y={(y + 2) * CELL}
        width={CELL * 3}
        height={CELL * 3}
        fill="#343344"
      />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE * CELL} ${SIZE * CELL}`}
      role="img"
      aria-label={`QR Code ilustrativo da reserva ${codigo}`}
      className={className}
      fill="#343344"
    >
      <rect width={SIZE * CELL} height={SIZE * CELL} fill="#F3EBDD" />
      {cells}
      {finder(0, 0)}
      {finder(SIZE - 7, 0)}
      {finder(0, SIZE - 7)}
    </svg>
  );
}