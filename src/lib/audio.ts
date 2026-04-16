export class DummyAISynth {
  context: AudioContext | null = null;
  isPlaying = false;
  currentTrack = 0;
  tempo = 140;
  private intervalId: number | null = null;
  private step = 0;
  
  tracks = [
    { title: "Track 1: Neon Grid Runner", color: "text-cyan-400", bg: "bg-cyan-900/20", glow: "shadow-[0_0_15px_rgba(34,211,238,0.5)]", snakeBg: "bg-cyan-400" },
    { title: "Track 2: Cyber-City Nights", color: "text-fuchsia-400", bg: "bg-fuchsia-900/20", glow: "shadow-[0_0_15px_rgba(232,121,249,0.5)]", snakeBg: "bg-fuchsia-400" },
    { title: "Track 3: Digital Sunrise", color: "text-yellow-400", bg: "bg-yellow-900/20", glow: "shadow-[0_0_15px_rgba(250,204,21,0.5)]", snakeBg: "bg-yellow-400" }
  ];

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  play() {
    if (!this.context) this.init();
    if (this.context!.state === 'suspended') {
      this.context!.resume();
    }
    this.isPlaying = true;
    this.scheduleNotes();
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setTrack(index: number) {
    this.currentTrack = index % this.tracks.length;
    this.step = 0;
    if (this.isPlaying) {
      this.scheduleNotes();
    }
  }

  nextTrack() {
    this.setTrack(this.currentTrack + 1);
  }

  prevTrack() {
    this.setTrack((this.currentTrack - 1 + this.tracks.length) % this.tracks.length);
  }

  private scheduleNotes() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    const patterns = [
      [60, 63, 67, 63, 60, 63, 67, 72, 60, 63, 67, 63, 72, 70, 67, 63], // Minor arp
      [62, 65, 69, 74, 62, 65, 69, 74, 60, 64, 67, 72, 60, 64, 67, 72], // Chill chords
      [55, 67, 55, 67, 58, 70, 58, 70, 53, 65, 53, 65, 50, 62, 50, 62]  // Jumping pattern
    ];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.context) return;
      
      const pattern = patterns[this.currentTrack];
      const note = pattern[this.step % pattern.length];
      
      // Melody
      this.playNote(note, this.currentTrack);
      
      // Drums
      if (this.currentTrack === 0) {
        if (this.step % 4 === 0) this.playKick();
        if (this.step % 2 === 1) this.playHihat();
      } else if (this.currentTrack === 1) {
        if (this.step % 8 === 0) this.playKick();
        if (this.step % 4 === 2) this.playSnare();
      } else {
        if (this.step % 4 === 0) this.playKick();
        if (this.step % 2 === 0) this.playHihat();
        if (this.step % 4 === 2) this.playSnare();
      }
      
      this.step++;
    }, (15000 / this.tempo));
  }

  private playNote(midiNote: number, track: number) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();
    
    osc.type = track === 0 ? 'sawtooth' : track === 1 ? 'sine' : 'square';
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(track === 0 ? 2000 : 800, this.context!.currentTime);
    if (track === 0) {
      filter.frequency.exponentialRampToValueAtTime(100, this.context!.currentTime + 0.2);
    }
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context!.destination);
    
    osc.frequency.setValueAtTime(freq, this.context!.currentTime);
    
    const maxGain = track === 1 ? 0.2 : 0.1;
    gain.gain.setValueAtTime(maxGain, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + (track === 1 ? 0.5 : 0.2));
    
    osc.start();
    osc.stop(this.context!.currentTime + (track === 1 ? 0.5 : 0.2));
  }

  private playKick() {
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    osc.connect(gain);
    gain.connect(this.context!.destination);
    
    osc.frequency.setValueAtTime(150, this.context!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.4, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.3);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.3);
  }

  private playSnare() {
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.context!.destination);
    
    osc.frequency.setValueAtTime(250, this.context!.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.2);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.2);
  }

  private playHihat() {
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();
    
    osc.type = 'square';
    
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context!.destination);
    
    osc.frequency.setValueAtTime(8000, this.context!.currentTime);
    gain.gain.setValueAtTime(0.05, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.05);
  }
}

export const dummySynth = new DummyAISynth();
