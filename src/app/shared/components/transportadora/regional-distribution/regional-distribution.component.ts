import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryMapComponent } from '../../ecommerce/country-map/country-map.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-regional-distribution',
  imports: [CommonModule, CountryMapComponent, DropdownComponent, DropdownItemComponent],
  templateUrl: './regional-distribution.component.html',
})
export class RegionalDistributionComponent {
  isOpen = false;

  readonly regions = [
    { name: 'Sudeste', entregas: '4.820 entregas', percent: 42, img: '/images/country/country-01.svg', alt: 'Sudeste' },
    { name: 'Sul', entregas: '2.910 entregas', percent: 25, img: '/images/country/country-02.svg', alt: 'Sul' },
    { name: 'Centro-Oeste', entregas: '1.760 entregas', percent: 15, img: '/images/country/country-03.svg', alt: 'Centro-Oeste' },
    { name: 'Nordeste', entregas: '1.540 entregas', percent: 13, img: '/images/country/country-04.svg', alt: 'Nordeste' },
    { name: 'Norte', entregas: '580 entregas', percent: 5, img: '/images/country/country-05.svg', alt: 'Norte' },
  ];

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
