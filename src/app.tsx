import axios from "axios";
import "./styles.css";
import HaModal from "./modal";
import React from "react";

export const LOCAL_STORAGE_KEY = `ha-settings`;

interface HASettings {
  enabled: boolean;
  url: string;
  token: string;
  entities: string;
}

export function getSettings(): HASettings | null {
  const settings = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (settings !== null) {
    return JSON.parse(settings);
  }
  return null;
}

function openCredentialsModal(): void {
  Spicetify.PopupModal.display({
    title: "Set up Home Assistant connection",
    // `content:` expects a string or HTMLElement, but we are providing a React.JSX.Element. I dont know how to fix that.
    // @ts-ignore
    content: <HaModal />,
    isLarge: true,
  });
}

async function changeHALight(
  HaUrl: string,
  token: string,
  entity_id: string,
  color: [number, number, number]
): Promise<void> {
  const url = `${HaUrl}/api/services/light/turn_on`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const data = {
    entity_id: `light.${entity_id}`,
    rgb_color: color,
  };

  try {
    await axios.post(url, data, { headers });
    console.debug(`Set ${entity_id} to ${color}`);
  } catch (error) {
    console.error("Error turning on light:", error);
    Spicetify.showNotification(`Failed to change light: ${entity_id}`, true);
  }
}

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

async function handleSongChange(): Promise<void> {
  const settings = getSettings();
  if (!settings) {
    Spicetify.showNotification("No Home Assistant settings found", false, 3000);
    return;
  }

  if (!settings.enabled) {
    return;
  }

  if (!settings.url || !settings.token || !settings.entities) {
    Spicetify.showNotification(
      "Home Assistant settings incomplete",
      false,
      3000
    );
    return;
  }

  try {
    // Get color from current track
    const currentTrack = Spicetify.Player.data.item;
    const colors = await Spicetify.colorExtractor(currentTrack.uri);

    const entityArray = settings.entities
      .split(",")
      .map((value) => value.trim());

    for (const entity of entityArray) {
      await changeHALight(
        settings.url,
        settings.token,
        entity,
        hexToRgb(colors.VIBRANT) // TODO: make this configurable
      );
    }
  } catch (error) {
    console.error("Error changing lights:", error);
    Spicetify.showNotification("Failed to change lights", true);
  }
}

function main(): void {
  Spicetify.Player.addEventListener("songchange", handleSongChange);

  new Spicetify.Menu.Item(
    "Home Assistant Settings",
    false,
    openCredentialsModal,
    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-home-assistant" width="16" height="16" viewBox="0 0 24 24"><path d="M21.8,13H20V21H13V17.67L15.79,14.88L16.5,15C17.66,15 18.6,14.06 18.6,12.9C18.6,11.74 17.66,10.8 16.5,10.8A2.1,2.1 0 0,0 14.4,12.9L14.5,13.61L13,15.13V9.65C13.66,9.29 14.1,8.6 14.1,7.8A2.1,2.1 0 0,0 12,5.7A2.1,2.1 0 0,0 9.9,7.8C9.9,8.6 10.34,9.29 11,9.65V15.13L9.5,13.61L9.6,12.9A2.1,2.1 0 0,0 7.5,10.8A2.1,2.1 0 0,0 5.4,12.9A2.1,2.1 0 0,0 7.5,15L8.21,14.88L11,17.67V21H4V13H2.25C1.83,13 1.42,13 1.42,12.79C1.43,12.57 1.85,12.15 2.28,11.72L11,3C11.33,2.67 11.67,2.33 12,2.33C12.33,2.33 12.67,2.67 13,3L17,7V6H19V9L21.78,11.78C22.18,12.18 22.59,12.59 22.6,12.8C22.6,13 22.2,13 21.8,13M7.5,12A0.9,0.9 0 0,1 8.4,12.9A0.9,0.9 0 0,1 7.5,13.8A0.9,0.9 0 0,1 6.6,12.9A0.9,0.9 0 0,1 7.5,12M16.5,12C17,12 17.4,12.4 17.4,12.9C17.4,13.4 17,13.8 16.5,13.8A0.9,0.9 0 0,1 15.6,12.9A0.9,0.9 0 0,1 16.5,12M12,6.9C12.5,6.9 12.9,7.3 12.9,7.8C12.9,8.3 12.5,8.7 12,8.7C11.5,8.7 11.1,8.3 11.1,7.8C11.1,7.3 11.5,6.9 12,6.9Z" /></svg>`
  ).register();
}

export default main;
