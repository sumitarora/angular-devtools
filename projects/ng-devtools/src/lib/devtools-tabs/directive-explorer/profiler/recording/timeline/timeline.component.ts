import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AppEntry, FlamegraphNode, formatRecords, formatFlamegraphRecords, TimelineView } from './format-records';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { AppRecord } from 'protocol';

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() set records(data: AppRecord[]) {
    this.profileRecords = formatFlamegraphRecords(data);
  }

  @Input() view: 'aggregated' | 'timeline' = 'aggregated';
  @ViewChild(MatSlider) slider: MatSlider;

  profileRecords: TimelineView = {
    aggregated: {
      app: [],
      timeSpent: 0,
      source: '',
    },
    timeline: [],
  };
  currentView = 1;

  get recordsView(): AppEntry {
    if (this.view === 'timeline') {
      // null coalesce to aggregated if no data was recorded since aggregated will be empty, whereas
      // timeline will not even exist
      return this.profileRecords.timeline[this.currentView] || this.profileRecords.aggregated;
    }
    return this.profileRecords.aggregated;
  }

  frameRate(timeSpent: number) {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(64 / 2 ** multiplier);
  }

  updateView($event: MatSliderChange) {
    if ($event.value === undefined || $event.value > this.profileRecords.timeline.length) {
      return;
    }
    this.currentView = $event.value;
    this.slider.value = this.currentView;
  }

  move(number: number): void {
    const newVal = this.currentView + number;
    if (newVal > 0 && newVal < this.profileRecords.timeline.length) {
      this.currentView = newVal;
      this.slider.value = this.currentView;
    }
  }
}
