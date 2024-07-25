import React, { useEffect, useState } from "react";
import { getSettings, HASettings, LOCAL_STORAGE_KEY } from "./app";

const HaModal: React.FC = () => {
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
    <form className="haModal" onSubmit={handleSubmit}>
      <div className="toggleContainer">
        <label htmlFor="enabled">Enable Home Assistant Integration:</label>
        <label className="toggleSwitch">
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

      <div className="formGroup">
        <div className="inputContainer">
          <label htmlFor="url">Home Assistant URL:</label>
          <input
            type="url"
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

      <div className="formGroup">
        <div className="inputContainer">
          <label htmlFor="webhookId">Webhook ID:</label>
          <input
            type="password"
            id="webhookId"
            name="webhookId"
            value={settings.webhookId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="description">
          Enter your automation Webhook ID. See {""}
          <a href="https://github.com/muckelba/dynamic-lights-homeassistant">
            README
          </a>
        </div>
      </div>

      <div className="submitContainer">
        <button type="submit">Save settings</button>
      </div>
    </form>
  );
};

export default HaModal;
