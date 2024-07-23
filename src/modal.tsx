import React from "react";
import { getSettings, localStorageKey } from "./app";

const handleSubmit = () => {
  const enabled = (document.getElementById("enable-toggle") as HTMLInputElement)
    .checked;
  const url = (document.getElementById("ha-url") as HTMLInputElement)?.value;
  const token = (document.getElementById("ha-bearer-token") as HTMLInputElement)
    ?.value;
  const entities = (
    document.getElementById("ha-light-entities") as HTMLInputElement
  )?.value;

  localStorage.setItem(
    localStorageKey,
    JSON.stringify({
      enabled,
      url,
      token,
      entities,
    })
  );
  Spicetify.PopupModal.hide();
};

const HaModal = () => {
  const settings = getSettings();
  const enabled = settings ? settings.enabled : true;
  const url = settings?.url;
  const token = settings?.token;
  const entities = settings?.entities;

  return (
    <div className="ha-modal">
      <div className="toggle-container">
        <label htmlFor="enable-toggle">
          Enable Home Assistant Integration:
        </label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            id="enable-toggle"
            name="enable-toggle"
            defaultChecked={enabled}
          ></input>
          <span className="slider"></span>
        </label>
      </div>
      <div className="form-group">
        <div className="input-container">
          <label htmlFor="ha-url">Home Assistant URL:</label>
          <input type="url" id="ha-url" defaultValue={url}></input>
        </div>
        <div className="description">
          Enter the URL of your Home Assistant instance (e.g.,
          http://homeassistant.local:8123)
        </div>
      </div>

      <div className="form-group">
        <div className="input-container">
          <label htmlFor="ha-bearer-token">Bearer Token:</label>
          <input
            type="password"
            id="ha-bearer-token"
            defaultValue={token}
          ></input>
        </div>
        <div className="description">
          Enter your long-lived access token from Home Assistant
        </div>
      </div>

      <div className="form-group">
        <div className="input-container">
          <label htmlFor="ha-light-entities">Light Entities</label>
          <input
            type="text"
            id="ha-light-entities"
            defaultValue={entities}
          ></input>
        </div>
        <div className="description">
          Provide a comma seperated list of homeassistant light entities. Must
          be a light and capable of color (e.g., lamp_1,lamp_2)
        </div>
      </div>

      <div className="submit-container">
        <button onClick={handleSubmit} type="submit">
          Save settings
        </button>
      </div>
    </div>
  );
};

export default HaModal;
