import useScrambleReveal from "../useScrambleReveal";

export default function ScrambleReveal({ tokens, separator = " ", totalMs, onDone }) {
  const { display, lockedCount, done } = useScrambleReveal(tokens, { totalMs, onDone });

  return (
    <pre className="scramble-pre">
      {display.map((token, i) => {
        const atBoundary = !done && i === lockedCount;
        return (
          <span key={i} className={i < lockedCount ? "scramble-locked" : "scramble-dim"}>
            {i > 0 ? separator : ""}
            {atBoundary ? (
              <>
                <span className="scramble-cursor">█</span>
                {token.slice(1)}
              </>
            ) : (
              token
            )}
          </span>
        );
      })}
    </pre>
  );
}
