import { Applemusic } from "@styled-icons/simple-icons/";
import { Playlist } from "../utils";

const API_URL = "https://api.music.apple.com/v1/me/library/playlists";

export const initAppleMusicKit = () => {
  document.addEventListener("musickitloaded", function () {
    //@ts-ignore
    MusicKit.configure({
      developerToken: process.env.REACT_APP_APPLE_DEVELOPER_TOKEN,
      app: {
        name: "Playswish.co",
        build: "1.0beta1",
        version: "1.0beta1",
      },
    });
  });
};

export const layout = {
  style: {
    background:
      "linear-gradient(180deg, rgba(234,66,73,1) 0%, rgba(217,62,82,1) 100%)",
    color: "white",
    fontFamily: "",
  },
  displayName: "Apple Music",
  logo: Applemusic,
};

export const login = async () => {
  //@ts-ignore
  const music = MusicKit ? MusicKit.getInstance() : "";
  return music.authorize().then((user: any) => user);
};

export const logout = () => {
  //@ts-ignore
  const music = MusicKit ? MusicKit.getInstance() : "";
  music.unauthorize();
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  //@ts-ignore
  const music = MusicKit ? MusicKit.getInstance() : "";
  const playlists: any = await fetch(API_URL, {
    headers: {
      "Music-User-Token": music.musicUserToken,
      Authorization: `Bearer ${music.developerToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const { data } = await playlists.json();

  return await Promise.all(
    data.map(async (pls: any) => await parsePlaylist(pls))
  );
};

const parsePlaylist = async (playlist: any): Promise<Playlist> => {
  //@ts-ignore
  const music = MusicKit ? MusicKit.getInstance() : "";

  const { name: title, id } = playlist.attributes;

  const pls = await (id.startsWith("p.")
    ? music.api.library.playlist(id)
    : music.api.playlist(id));

  const songs = pls.relationships.tracks.data.map(
    ({ attributes, id }: any) => ({
      artist: attributes.artistName,
      name: attributes.name,
      id,
      img: attributes.artwork.url,
    })
  );

  return { title, songs, id };
};
