import { useState } from "react";
import DifficultyPicker from "../components/DifficultyPicker";
import Stage1 from "../components/Stage1";
import Stage2 from "../components/Stage2";
import Stage3 from "../components/Stage3";
import Stage4 from "../components/Stage4";
import SuccessScreen from "../components/SuccessScreen";
import FailScreen from "../components/FailScreen";

export default function Game() {
  const [screen, setScreen] = useState("pick");
  const [runCtx, setRunCtx] = useState(null);
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

   function getRemainingSeconds() {
    if (!runCtx) return 0;
    const elapsed = (Date.now() - runCtx.startedAt) / 1000;
    return Math.max(0, Math.floor(runCtx.time_limit_sec - elapsed));
  }

  function handleExpired() {
    setScreen("fail");
  }

  function handleStage1Done(data) {
    setRunCtx((prev) => ({ ...prev, n: data.n, phi: data.phi, e_options: data.e_options, remainingSec: Math.max(0, Math.floor(prev.time_limit_sec - (Date.now() - prev.startedAt) / 1000)),}));
    setScreen("stage2");
  }

  function handleStage2Done({ e, d }) {
    setRunCtx((prev) => ({ ...prev, e, d, remainingSec: Math.max(0, Math.floor(prev.time_limit_sec - (Date.now() - prev.startedAt) / 1000))}));
    setScreen("stage3");
  }

  function handleStage3Done(data) {
    setRunCtx((prev) => ({ ...prev, message: data.message, ciphertext: data.ciphertext, remainingSec: Math.max(0, Math.floor(prev.time_limit_sec - (Date.now() - prev.startedAt) / 1000))}));
    setScreen("stage4");
  }

  function handleStage4Done(data) {
    setRunCtx((prev) => ({ ...prev, elapsed_sec: data.elapsed_sec }));
    setScreen("success");
  }

  function handleRetry() {
    setRunCtx(null);
    setScreen("pick");
  }

  return (
    <>
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
    </>
  );
}
