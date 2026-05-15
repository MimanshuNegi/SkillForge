  import { Component, HostListener } from '@angular/core';

  @Component({
    selector: 'app-my-landing',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
  })
  export class LandingPageComponent {

    scrollY = 0;

    features = [
      {
        title: 'Top Freelancers',
        desc: 'Find highly skilled professionals worldwide'
      },
      {
        title: 'Secure Payments',
        desc: 'Safe and reliable transactions for every project'
      },
      {
        title: 'Fast Hiring',
        desc: 'Hire talent quickly with smart matching'
      }
    ];

    stats = [
      { value: '1200+', label: 'Jobs Posted' },
      { value: '800+', label: 'Freelancers' },
      { value: '$1M+', label: 'Transactions' },
      { value: '15+', label: 'Countries' }
    ];

    @HostListener('window:scroll', [])
    onScroll() {
      this.scrollY = window.scrollY;
    }

  }
