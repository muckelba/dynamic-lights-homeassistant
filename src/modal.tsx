import React, { useState, useEffect } from "react";
import { getSettings, LOCAL_STORAGE_KEY } from "./app";

interface HASettings {
  enabled: boolean;
  url: string;
  token: string;
  entities: string;
}

const HaModal: React.FC = () => {
  const [settings, setSettings] = useState<HASettings>({
    enabled: true,
    url: "",
    token: "",
    entities: "",
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
    <form className="ha-modal" onSubmit={handleSubmit}>
      <div className="toggle-container">
        <label htmlFor="enabled">Enable Home Assistant Integration:</label>
        <label className="toggle-switch">
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

      <div className="form-group">
        <div className="input-container">
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

      <div className="form-group">
        <div className="input-container">
          <label htmlFor="token">Bearer Token:</label>
          <input
            type="password"
            id="token"
            name="token"
            value={settings.token}
            onChange={handleChange}
            required
          />
        </div>
        <div className="description">
          Enter your long-lived access token from Home Assistant.{" "}
          <a href="https://community.home-assistant.io/t/how-to-get-long-lived-access-token/162159/5">
            Tutorial
          </a>
        </div>
      </div>

      <div className="form-group">
        <div className="input-container">
          <label htmlFor="entities">Light Entities:</label>
          <input
            type="text"
            id="entities"
            name="entities"
            value={settings.entities}
            onChange={handleChange}
            required
          />
        </div>
        <div className="description">
          Provide a comma-separated list of Home Assistant light entities. Must
          be lights capable of color (e.g., lamp_1,lamp_2)
        </div>
      </div>

      <div className="submit-container">
        <button type="submit">Save settings</button>
      </div>
    </form>
  );
};

export default HaModal;
