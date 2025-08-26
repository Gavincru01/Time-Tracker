import { Component, computed, inject, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

type Session = { id: number; date: string; minutes: number; course?: string };

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnDestroy {
  private router = inject(Router);

  // --- mock data ---
  private isoDaysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  readonly todayISO = new Date().toISOString().slice(0, 10);

  sessions = signal<Session[]>([
    { id: 1, date: this.isoDaysAgo(1), minutes: 90, course: 'Math' },
    { id: 2, date: this.isoDaysAgo(2), minutes: 45, course: 'Python' },
    { id: 3, date: this.isoDaysAgo(4), minutes: 60, course: 'Math' },
  ]);

  weeklyGoalMin = signal(600); // 10h

  // --- derived metrics ---
  private startOfWeekISO(d = new Date()) {
    const diff = (d.getDay() + 6) % 7;
    const x = new Date(d);
    x.setDate(d.getDate() - diff);
    return x.toISOString().slice(0, 10);
  }

  currentWeekMinutes = computed(() =>
    this.sessions()
      .filter((s) => s.date >= this.startOfWeekISO())
      .reduce((sum, s) => sum + s.minutes, 0)
  );

  progressPct = computed(() =>
    Math.min(100, (this.currentWeekMinutes() / this.weeklyGoalMin()) * 100)
  );

  streak = computed(() => this.computeStreak(this.sessions()));
  longestStreak = computed(() => this.computeStreak(this.sessions(), true));

  heatmapDays = computed(() => this.buildHeatmap(21)); // last 3 weeks

  // --- actions ---
  addMockSession(min = 30) {
    const arr = [...this.sessions()];
    const id = arr.length ? Math.max(...arr.map((s) => s.id)) + 1 : 1;
    arr.unshift({ id, date: this.todayISO, minutes: min, course: 'Demo' });
    this.sessions.set(arr);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  // --- helpers ---
  private computeStreak(list: Session[], longest = false) {
    const days = new Set(list.map((s) => s.date));
    let cur = 0,
      max = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (days.has(iso)) {
        cur++;
        max = Math.max(max, cur);
      } else if (!longest) break;
      else cur = 0;
    }
    return longest ? max : cur;
  }

  private buildHeatmap(days: number) {
    const byDay = new Map<string, number>();
    for (const s of this.sessions()) {
      byDay.set(s.date, (byDay.get(s.date) || 0) + s.minutes);
    }
    const out: { date: string; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, minutes: byDay.get(iso) || 0 });
    }
    return out;
  }

  // ===============================
  //          TIMER SECTION
  // ===============================
  // State (signals so the template updates automatically)
  h = signal(0);
  m = signal(0);
  s = signal(0);
  private intervalId: any = null;

  get running(): boolean {
    return this.intervalId != null;
  }

  display = computed(() => {
    const hh = String(this.h()).padStart(2, '0');
    const mm = String(this.m()).padStart(2, '0');
    const ss = String(this.s()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  });

  isZero = computed(() => this.h() === 0 && this.m() === 0 && this.s() === 0);

  private tick() {
    let s = this.s() + 1;
    let m = this.m();
    let h = this.h();
    if (s === 60) {
      s = 0;
      m += 1;
    }
    if (m === 60) {
      m = 0;
      h += 1;
    }
    this.s.set(s);
    this.m.set(m);
    this.h.set(h);
  }
  isRunning = signal(false);
  startTimer() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.isRunning.set(true); // <— now “running” is reactive
  }

  pauseTimer() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning.set(false); // <— reflect paused state
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.h.set(0);
    this.m.set(0);
    this.s.set(0);
  }

  // Keyboard shortcuts: Space = Start/Pause, R = Reset
  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      this.toggleTimer();
    } else if (e.key.toLowerCase() === 'r') {
      this.resetTimer();
    }
  }

  ngOnDestroy() {
    this.pauseTimer();
  }
}
