class AudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Record<string, HTMLAudioElement> = {};

  constructor() {
    // Preload sounds
    const sounds = ["shopify", "apple", "minimal_click", "soft_bell", "premium_ding", "luxury_chime", "digital_pulse", "elegant_glass", "success_tone", "modern_notification", "linear", "stripe"];
    sounds.forEach(name => {
      const url = `/sounds/${name}.wav`;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioCache[url] = audio;
    });
  }

  play(url: string, volumeLevel: 'Low' | 'Medium' | 'High') {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    
    try {
      const audio = this.audioCache[url] || new Audio(url);
      audio.currentTime = 0;
      audio.volume = volumeLevel === 'Low' ? 0.3 : volumeLevel === 'Medium' ? 0.6 : 1.0;
      audio.play().catch(e => console.warn('Audio playback failed (possibly blocked by browser):', e));
      this.currentAudio = audio;
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }
}

export const audioPlayer = new AudioPlayer();
