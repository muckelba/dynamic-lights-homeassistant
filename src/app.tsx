import axios from "axios";
import "./styles.css";
import HaModal from "./modal";
import React from "react";

export const localStorageKey = `ha-settings`;

export function getSettings() {
  const settings = localStorage.getItem(localStorageKey);
  let enabled: boolean, url: string, token: string, entities: string;

  if (settings !== null) {
    const parsedSettings = JSON.parse(settings);
    enabled = parsedSettings.enabled;
    url = parsedSettings.url;
    token = parsedSettings.token;
    entities = parsedSettings.entities;
    return { enabled, url, token, entities };
  } else {
    return null;
  }
}

function openCredentialsModal() {
  Spicetify.PopupModal.display({
    title: "Set up Homeassistant connection",
    // `content:` expects a string or HTMLElement, but we are providing a React.JSX.Element. I dont know how to fix that.
    // @ts-ignore
    content: <HaModal />,
    isLarge: true,
  });
}

function extractRGBValues(rgbString: string): [number, number, number] {
  const regex = /rgb\((\d+), (\d+), (\d+)\)/;
  const match = rgbString.match(regex);

  if (!match) {
    throw new Error("Invalid RGB string format");
  }

  const red = parseInt(match[1], 10);
  const green = parseInt(match[2], 10);
  const blue = parseInt(match[3], 10);

  return [red, green, blue];
}

async function changeHALight(
  HaUrl: string,
  token: string,
  entitiy_id: string,
  color: [number, number, number]
) {
  const url = `${HaUrl}/api/services/light/turn_on`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const data = {
    entity_id: `light.${entitiy_id}`,
    rgb_color: color,
  };

  try {
    await axios.post(url, data, { headers });
    console.log(`${entitiy_id} set to ${color}`);
  } catch (error) {
    console.error("Error turning on light:", error);
  }
}

async function main() {
  // Will be called when player changes track
  Spicetify.Player.addEventListener("songchange", async (event) => {
    const settings = getSettings();
    if (!settings) {
      Spicetify.showNotification(
        "No Homeassistant settings found, skipping light change",
        false,
        1000
      );
      return;
    } else if (!settings.enabled) {
      Spicetify.showNotification(
        "Homeassistant integration disabled, skipping light change",
        false,
        1000
      );
      return;
    } else if (
      settings.url === "" ||
      settings.token === "" ||
      settings.entities === ""
    ) {
      Spicetify.showNotification(
        "Homeassistant settings incomplete, skipping light change",
        false,
        1000
      );
      return;
    }

    let textColor = getComputedStyle(document.documentElement).getPropertyValue(
      "--spice-text"
    ); // TODO: switch to colorExtractor()
    const colorArray = extractRGBValues(textColor);

    const entityArray = settings.entities.split(",").map(function (value) {
      return value.trim();
    });

    entityArray.map(async (entity) => {
      await changeHALight(settings.url, settings.token, entity, colorArray);
    });
  });

  new Spicetify.Menu.Item(
    "Homeassistant Settings",
    false,
    openCredentialsModal,
    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-home-assistant" width="16" height="16" viewBox="0 0 24 24"><path d="M21.8,13H20V21H13V17.67L15.79,14.88L16.5,15C17.66,15 18.6,14.06 18.6,12.9C18.6,11.74 17.66,10.8 16.5,10.8A2.1,2.1 0 0,0 14.4,12.9L14.5,13.61L13,15.13V9.65C13.66,9.29 14.1,8.6 14.1,7.8A2.1,2.1 0 0,0 12,5.7A2.1,2.1 0 0,0 9.9,7.8C9.9,8.6 10.34,9.29 11,9.65V15.13L9.5,13.61L9.6,12.9A2.1,2.1 0 0,0 7.5,10.8A2.1,2.1 0 0,0 5.4,12.9A2.1,2.1 0 0,0 7.5,15L8.21,14.88L11,17.67V21H4V13H2.25C1.83,13 1.42,13 1.42,12.79C1.43,12.57 1.85,12.15 2.28,11.72L11,3C11.33,2.67 11.67,2.33 12,2.33C12.33,2.33 12.67,2.67 13,3L17,7V6H19V9L21.78,11.78C22.18,12.18 22.59,12.59 22.6,12.8C22.6,13 22.2,13 21.8,13M7.5,12A0.9,0.9 0 0,1 8.4,12.9A0.9,0.9 0 0,1 7.5,13.8A0.9,0.9 0 0,1 6.6,12.9A0.9,0.9 0 0,1 7.5,12M16.5,12C17,12 17.4,12.4 17.4,12.9C17.4,13.4 17,13.8 16.5,13.8A0.9,0.9 0 0,1 15.6,12.9A0.9,0.9 0 0,1 16.5,12M12,6.9C12.5,6.9 12.9,7.3 12.9,7.8C12.9,8.3 12.5,8.7 12,8.7C11.5,8.7 11.1,8.3 11.1,7.8C11.1,7.3 11.5,6.9 12,6.9Z" /></svg>`
  ).register();
}

export default main;
