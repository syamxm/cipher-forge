import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Terminal from '../components/Terminal';
import { leaderboard } from '../api';
import { useAuth } from '../auth';
import '../leaderboard.css';

export default function Leaderboard() {
  const [difficulty, setDifficulty] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const data = await leaderboard.top(difficulty);
        if (isMounted) {
          setEntries(data.entries || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load leaderboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [difficulty]);

  const difficulties = ['all', 'easy', 'medium', 'hard'];

  return (
    <Terminal title="cipher-forge — leaderboard" wide>
      <div className="lb-wide">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/" className="lb-back">‹ back to game</Link>
        </div>

        <div className="lb-tabs">
          {difficulties.map(diff => (
            <button
              key={diff}
              className={`lb-tab ${difficulty === diff ? 'active' : ''}`}
              onClick={() => setDifficulty(diff)}
            >
              {diff}
            </button>
          ))}
        </div>

        {error && <div className="lb-error">{error}</div>}

        {loading ? (
          <div className="lb-loading">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="lb-empty">No scores found for this difficulty yet.</div>
        ) : (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Time</th>
                  {difficulty === 'all' && <th>Difficulty</th>}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isMe = user?.username === entry.username;
                  return (
                    <tr key={`${entry.username}-${entry.difficulty}-${entry.rank}-${idx}`} className={`lb-row ${isMe ? 'me' : ''}`}>
                      <td>{entry.rank}</td>
                      <td className="lb-player" title={entry.username}>{entry.username}</td>
                      <td>{entry.score}</td>
                      <td>{entry.elapsed_sec.toFixed(1)}s</td>
                      {difficulty === 'all' && <td>{entry.difficulty}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Terminal>
  );
}
