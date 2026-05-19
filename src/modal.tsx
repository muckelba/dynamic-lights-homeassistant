import React from "react";
import axios from "axios";
import { getSettings, HASettings, LOCAL_STORAGE_KEY } from "./app";

const { useEffect, useState } = React;

type TestStatus = "idle" | "testing" | "success" | "error";

const CheckIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-13a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1zm0 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

const LoaderIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="spin"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const HaModal: React.FC = () => {
  const [settings, setSettings] = useState<HASettings>({
    enabled: true,
    url: "",
    webhookId: "",
  });

  const [urlError, setUrlError] = useState<string>("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testError, setTestError] = useState<string>("");

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  useEffect(() => {
    // Spicetify's PopupModal wrapper sometimes uses overflow-y: scroll,
    // which forces a visible scrollbar even when content fits. Patch it to auto.
    const el = document.querySelector('.ha-settings');
    if (!el) return;

    let parent: HTMLElement | null = el.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === 'scroll') {
        parent.style.overflowY = 'auto';
        break;
      }
      parent = parent.parentElement;
    }
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "url") {
      if (value && !validateUrl(value)) {
        setUrlError("URL must start with https://");
      } else {
        setUrlError("");
      }
    }

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }));

    if (testStatus !== "idle") {
      setTestStatus("idle");
      setTestError("");
    }
  };

  const handleTestConnection = async () => {
    if (!validateUrl(settings.url) || !settings.webhookId) {
      setTestStatus("error");
      setTestError("Please enter a valid URL and Webhook ID first");
      return;
    }

    setTestStatus("testing");
    setTestError("");

    const url = `${settings.url}/api/webhook/${settings.webhookId}`;

    try {
      await axios.post(
        url,
        { test: true },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );
      setTestStatus("success");
      Spicetify.showNotification("Connection successful", false);
    } catch (error) {
      setTestStatus("error");
      let message = "Failed to connect to Home Assistant";

      if (axios.isAxiosError(error)) {
        const code = error.code ? `(${error.code}) ` : "";

        if (error.response) {
          if (error.response.status === 404) {
            message = `Webhook not found ${code}(${error.response.status}): ${error.message}`;
          } else {
            message = `Server returned ${code}(${error.response.status}): ${error.message}`;
          }
        } else if (error.request) {
          message = `Connection refused ${code}- Check the DevTools console for the exact network error. Also verify your URL, SSL certificate, and that Home Assistant is reachable.`;
        } else {
          message = `${code}${error.message}`;
        }
      }

      console.error(
        "[dynamic-lights-homeassistant] Test connection failed:",
        error,
      );
      setTestError(message);
      Spicetify.showNotification(message, true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateUrl(settings.url)) {
      setUrlError("URL must start with https://");
      Spicetify.showNotification("Invalid URL: Must use HTTPS", true);
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
      Spicetify.showNotification("Settings saved successfully", false);
      Spicetify.PopupModal.hide();
    } catch (error) {
      console.error("Error saving settings:", error);
      Spicetify.showNotification("Failed to save settings", true);
    }
  };

  return (
    <div className="ha-settings">
      <form onSubmit={handleSubmit}>
        <div className="settings-card">
          <div className="setting-row toggle-row">
            <div className="setting-info">
              <label htmlFor="enabled" className="setting-title">
                Enable Integration
              </label>
              <span className="setting-desc">
                Sync your lights with album art colors
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={settings.enabled}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="input-group">
            <label htmlFor="url" className="input-label">
              Home Assistant URL
            </label>
            <input
              type="url"
              placeholder="https://homeassistant.example.com"
              id="url"
              name="url"
              value={settings.url}
              onChange={handleChange}
              required
              className={urlError ? "error" : ""}
            />
            {urlError && <span className="input-error">{urlError}</span>}
            <span className="input-hint">
              Must use HTTPS due to{" "}
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content"
                target="_blank"
                rel="noopener noreferrer"
              >
                mixed content
              </a>{" "}
              restrictions.
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="webhookId" className="input-label">
              Webhook ID
            </label>
            <input
              type="password"
              placeholder="Enter your webhook ID"
              id="webhookId"
              name="webhookId"
              value={settings.webhookId}
              onChange={handleChange}
              required
            />
            <span className="input-hint">
              From your Home Assistant automation. See the{" "}
              <a
                href="https://github.com/muckelba/dynamic-lights-homeassistant?tab=readme-ov-file#1-home-assistant-configuration"
                target="_blank"
                rel="noopener noreferrer"
              >
                README
              </a>{" "}
              for setup instructions.
            </span>
          </div>
        </div>

        {testStatus !== "idle" && (
          <div className={`alert ${testStatus}`}>
            <span className="alert-icon">
              {testStatus === "testing" && <LoaderIcon />}
              {testStatus === "success" && <CheckIcon />}
              {testStatus === "error" && <AlertIcon />}
            </span>
            <span className="alert-text">
              {testStatus === "testing" && "Testing connection..."}
              {testStatus === "success" && "Connection successful"}
              {testStatus === "error" && testError}
            </span>
          </div>
        )}

        <div className="actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleTestConnection}
            disabled={testStatus === "testing"}
          >
            {testStatus === "testing" ? (
              <>
                <LoaderIcon />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </button>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default HaModal;
