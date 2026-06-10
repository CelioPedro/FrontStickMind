import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { LEGACY_EXPERIENCE } from '../../experience/legacy-experience.config';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly legacyExperience = {
    ...LEGACY_EXPERIENCE,
    iframeSrc: this.sanitizer.bypassSecurityTrustResourceUrl(
      LEGACY_EXPERIENCE.iframeSrc,
    ),
  };
}
