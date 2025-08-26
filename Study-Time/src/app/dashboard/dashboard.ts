import { Component, computed, inject, signal } from '@angular/core';
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
export class Dashboard {
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
}
