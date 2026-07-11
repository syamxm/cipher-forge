import { useEffect, useState } from "react";
import DifficultyPicker from "../components/DifficultyPicker";
import Stage1 from "../components/Stage1";
import Stage2 from "../components/Stage2";
import Stage3 from "../components/Stage3";
import Stage4 from "../components/Stage4";
import SuccessScreen from "../components/SuccessScreen";
import FailScreen from "../components/FailScreen";

const STORAGE_KEY = "cipherforge_run";
const STAGE_SCREENS = ["stage1", "stage2", "stage3", "stage4"];

function loadSaved() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.screen || !parsed?.runCtx) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearSaved() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function freshRemaining(runCtx) {
  const elapsed = (Date.now() - runCtx.startedAt) / 1000;
  return Math.max(0, Math.floor(runCtx.time_limit_sec - elapsed));
}

export default function Game() {
  const [screen, setScreen] = useState("pick");
  const [runCtx, setRunCtx] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved && STAGE_SCREENS.includes(saved.screen)) {
      const remaining = freshRemaining(saved.runCtx);
      if (remaining <= 0) {
        clearSaved();
        setScreen("fail");
      } else {
        setRunCtx({ ...saved.runCtx, remainingSec: remaining });
        setScreen(saved.screen);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (STAGE_SCREENS.includes(screen) && runCtx) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, runCtx }));
    } else {
      clearSaved();
    }
  }, [screen, runCtx, hydrated]);

  function handleStarted(data) {
    setRunCtx({
      run_id:         data.run_id,
      difficulty:     data.difficulty,
      candidates:     data.candidates,
      time_limit_sec: data.time_limit_sec,
      startedAt:      Date.now(),
      remainingSec:   data.time_limit_sec,
    });
    setScreen("stage1");
  }

  function handleExpired() {
    clearSaved();
    setScreen("fail");
  }

  function handleStage1Done(data) {
    setRunCtx((prev) => ({ ...prev, n: data.n, phi: data.phi, e_options: data.e_options, remainingSec: freshRemaining(prev) }));
    setScreen("stage2");
  }

  function handleStage2Done({ e, d }) {
    setRunCtx((prev) => ({ ...prev, e, d, remainingSec: freshRemaining(prev) }));
    setScreen("stage3");
  }

  function handleStage3Done(data) {
    setRunCtx((prev) => ({ ...prev, message: data.message, ciphertext: data.ciphertext, remainingSec: freshRemaining(prev) }));
    setScreen("stage4");
  }

  function handleStage4Done(data) {
    setRunCtx((prev) => ({ ...prev, elapsed_sec: data.elapsed_sec }));
    clearSaved();
    setScreen("success");
  }

  function handleRetry() {
    clearSaved();
    setRunCtx(null);
    setScreen("pick");
  }

  function handleExit() {
    setShowExitConfirm(true);
  }

  function confirmExit() {
    clearSaved();
    setRunCtx(null);
    setScreen("pick");
    setShowExitConfirm(false);
  }

  function cancelExit() {
    setShowExitConfirm(false);
  }

  if (!hydrated) return null;

  return (
    <>
      {STAGE_SCREENS.includes(screen) && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 18px 0" }}>
          <button className="exit-run-btn" onClick={handleExit}>
            exit run
          </button>
        </div>
      )}

      {screen === "pick" && (
        <DifficultyPicker onStarted={handleStarted} />
      )}

      {screen === "stage1" && (
        <Stage1
          runCtx={runCtx}
          remainingSec={runCtx.remainingSec}
          onDone={handleStage1Done}
          onExpired={handleExpired}
        />
      )}

      {screen === "stage2" && (
        <Stage2
          runCtx={runCtx}
          remainingSec={runCtx.remainingSec}
          onDone={handleStage2Done}
          onExpired={handleExpired}
        />
      )}

      {screen === "stage3" && (
        <Stage3
          runCtx={runCtx}
          remainingSec={runCtx.remainingSec}
          onDone={handleStage3Done}
          onExpired={handleExpired}
        />
      )}

      {screen === "stage4" && (
        <Stage4
          runCtx={runCtx}
          remainingSec={runCtx.remainingSec}
          onDone={handleStage4Done}
          onExpired={handleExpired}
        />
      )}

      {screen === "success" && (
        <SuccessScreen runCtx={runCtx} onRetry={handleRetry} />
      )}

      {screen === "fail" && (
        <FailScreen onRetry={handleRetry} />
      )}

      {showExitConfirm && (
        <div className="modal-overlay" onClick={cancelExit}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Quit current run?</p>
            <p className="modal-body">Your progress will be lost.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelExit}>cancel</button>
              <button className="btn-danger" onClick={confirmExit}>exit run</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
