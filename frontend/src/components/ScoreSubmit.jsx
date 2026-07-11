import { useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboard } from '../api';

export default function ScoreSubmit({ run_id }) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

  if (status === 'idle' || status === 'submitting') {
    return (
      <button
        onClick={submitScore}
        disabled={status === 'submitting'}
        style={{ width: '100%', marginTop: '8px' }}
      >
        {status === 'submitting' ? 'recording your run…' : 'Submit Score'}
      </button>
    );
  }

  if (status === 'error') {
    return (
      <div className="error">
        {errorMsg}{' '}
        <button onClick={submitScore} style={{ marginLeft: '8px' }}>
          retry
        </button>
      </div>
    );
  }

  return (
    <div className="prompt">
      rank #{result?.rank} · score {result?.score}{' '}
      <Link to="/leaderboard" style={{ marginLeft: '0.5rem' }}>
        view leaderboard ›
      </Link>
    </div>
  );
}
