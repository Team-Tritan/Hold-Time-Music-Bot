import { ActivityType, Client, VoiceState } from "discord.js";
import { token, soundclipPath } from "./config";
import fs from "fs";

import {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  joinVoiceChannel,
  AudioPlayer,
} from "@discordjs/voice";

const client = new Client({
  intents: [129],
});

let connection: any = null;

client.once("ready", () => {
  client.user?.setActivity("Hold Time Music", { type: ActivityType.Playing });

  console.log(
    "Bot is online and waiting to play hold time music to anyone who joins vc!"
  );
});

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    //@ts-ignore
    if (newState.channel && !newState.member.user.bot) {
      connection = joinVoiceChannel({
        channelId: newState.channel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator!,
      });

      const stream = fs.createReadStream(soundclipPath);
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });

      const player: AudioPlayer = createAudioPlayer();

      player.play(resource);
      connection.subscribe(player);

      player.on("stateChange", (oldState, newState) => {
        if (newState.status === "idle") {
          connection.destroy();
          connection = null;
        }
      });
    }
  }
);

client.login(token);
