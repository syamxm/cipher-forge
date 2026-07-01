import { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        width: 280,
      });
    };
    document.body.appendChild(script);

    return () => script.remove();
  }, [onCredential]);

  if (!CLIENT_ID) return null;
  return <div className="google-btn" ref={ref} />;
}
