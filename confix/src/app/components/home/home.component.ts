import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  
  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Make sure the Spline viewer script is loaded
    if (!document.querySelector('script[src*="@splinetool/viewer"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.9.85/build/spline-viewer.js';
      document.head.appendChild(script);
    }
  }
}