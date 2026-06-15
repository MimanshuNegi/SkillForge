import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-landing',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements AfterViewInit {

  scrollY = 0;
  isLoggedIn = false;

  @ViewChild('bgVideo') video!: ElementRef;

  constructor(private auth: AuthService) {
    this.isLoggedIn = this.auth.getLoginStatus();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrollY = window.scrollY;
  }

  ngAfterViewInit() {
    const vid = this.video?.nativeElement;
    if (vid) {
      vid.muted = true;
      vid.play().catch(() => {
        setTimeout(() => { vid.play().catch(() => {}); }, 500);
      });
    }
  }

  // Smooth scroll to section
  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  faqs = [
    { q: 'Is SkillForge free to use?', a: 'Yes! Creating an account and browsing jobs is completely free. No hidden charges.' },
    { q: 'How does the OTP login work?', a: 'After entering your password, a 6-digit OTP is sent to your registered email. Enter it to verify your identity.' },
    { q: 'Can I be both a Client and Freelancer?', a: 'Currently, each account is tied to a single role chosen during registration — Client, Freelancer, or Admin.' },
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. Enter your username, verify via OTP, and set a new password.' },
    { q: 'How are proposals managed?', a: 'Freelancers submit proposals with bid amounts. Clients can accept or reject proposals from their dashboard.' },
    { q: 'Is my data secure?', a: 'Absolutely. We use JWT tokens, OTP verification, Spring Security, and role-based access control to protect your data.' }
  ];
}