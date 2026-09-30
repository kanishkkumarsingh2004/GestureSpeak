declare module "howler" {
  export class Howl {
    constructor(options: {
      src: string[];
      volume?: number;
      html5?: boolean;
      loop?: boolean;
      autoplay?: boolean;
      preload?: boolean;
      onload?: () => void;
      onloaderror?: (id: number, error: any) => void;
      onplayerror?: (id: number, error: any) => void;
    });
    play(id?: number): number;
    pause(id?: number): this;
    stop(id?: number): this;
    volume(volume?: number, id?: number): any;
    state(): "unloaded" | "loading" | "loaded";
    load(): this;
  }
}
