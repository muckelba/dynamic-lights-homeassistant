import React, { useEffect, useState } from "react";
import { getSettings, HASettings, LOCAL_STORAGE_KEY } from "./app";

const HaModal: React.FC = () => {
  // Claude did all the react stuff, i have no clue about react
  const [settings, setSettings] = useState<HASettings>({
    enabled: true,
    url: "",
    webhookId: "",
  });

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
                placeholder="http://homeassistant.local:8123"
                id="url"
                name="url"
                value={settings.url}
                onChange={handleChange}
                required
              />
            </div>
            <div className="description">
              Enter the URL of your Home Assistant instance (e.g.,
              http://homeassistant.local:8123)
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
