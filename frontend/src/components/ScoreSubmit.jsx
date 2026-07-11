import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { leaderboard } from '../api';

export default function ScoreSubmit({ run_id, elapsed_sec, difficulty }) {
  const [status, setStatus] = useState('submitting'); // 'submitting', 'success', 'error'
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const hasSubmitted = useRef(false);

  const submitScore = async () => {
    setStatus('submitting');
    setErrorMsg(null);
    try {
      const data = await leaderboard.submit(run_id);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit score');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!hasSubmitted.current) {
      hasSubmitted.current = true;
      submitScore();
    }
    // We only want to execute this submission once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'submitting') {
    return <div className="prompt muted">recording your run…</div>;
  }

  if (status === 'error') {
    return (
      <div className="prompt muted">
        {errorMsg} <button onClick={submitScore} style={{ marginLeft: '0.5rem' }}>retry</button>
      </div>
    );
  }

  return (
    <div className="prompt">
      rank #{result?.rank} · score {result?.score}{' '}
      <Link to="/leaderboard" style={{ marginLeft: '0.5rem' }}>view leaderboard ›</Link>
    </div>
  );
}
