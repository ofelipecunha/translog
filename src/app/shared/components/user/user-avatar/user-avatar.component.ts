import { Component, Input, computed } from '@angular/core';
import { resolveAvatarUrl } from '../../../../core/user/user-session-profile.service';

@Component({
  selector: 'app-user-avatar',
  imports: [],
  template: `
    <span
      class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      [class]="sizeClass"
    >
      @if (hasPhoto()) {
        <img [src]="photoUrl()" alt="" class="h-full w-full object-cover" />
      } @else {
        <span
          class="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        >
          <svg
            class="h-[55%] w-[55%]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M5 19.5C5.5 16.5 8.2 14.5 12 14.5C15.8 14.5 18.5 16.5 19 19.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
      }
    </span>
  `,
})
export class UserAvatarComponent {
  @Input() imagem?: string | null;
  @Input() sizeClass = 'h-11 w-11';

  readonly hasPhoto = computed(() => !!this.imagem?.trim());

  readonly photoUrl = computed(() => resolveAvatarUrl(this.imagem));
}
