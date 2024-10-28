import React, { useEffect, useState } from "react";
import { getSettings, HASettings, LOCAL_STORAGE_KEY } from "./app";

// Claude did all the react stuff, i have no clue about react
const HaModal: React.FC = () => {
  const [settings, setSettings] = useState<HASettings>({
    enabled: true,
    url: "",
    webhookId: "",
  });

  const [urlError, setUrlError] = useState<string>("");

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
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
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="setting-row">
            <div className="setting-content">
              <label htmlFor="enabled">Enable Home Assistant Integration</label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={settings.enabled}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="description">Turn the extension on or off</div>
          </div>

          <div className="setting-row">
            <div className="setting-content">
              <label htmlFor="url">Home Assistant URL</label>
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
            </div>
            <div className="description">
              {urlError && <div className="error-message">{urlError}</div>}
              Enter the URL of your Home Assistant instance (e.g.,
              https://homeassistant.example.com). Due to the{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content">
                mixed content
              </a>{" "}
              policy of Chromium, the Home Assistant instance has to provide a
              valid SSL certificate.
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-content">
              <label htmlFor="webhookId">Webhook ID</label>
              <input
                type="password"
                placeholder="Enter webhook ID"
                id="webhookId"
                name="webhookId"
                value={settings.webhookId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="description">
              Enter your automation Webhook ID, see the {""}
              <a href="https://github.com/muckelba/dynamic-lights-homeassistant?tab=readme-ov-file#1-home-assistant-configuration">
                README
              </a>{" "}
              for more information
            </div>
          </div>

          <div className="button-row">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HaModal;
